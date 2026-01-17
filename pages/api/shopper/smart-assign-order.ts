import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";
import { sendNewOrderNotification } from "../../../src/services/fcmService";
import {
  getShopperLocation,
  isShopperOnline,
  logOfferSkip,
} from "../../../src/lib/redisClient";

// ============================================================================
// SYSTEM DESIGN: Dispatch with Exclusive Offers + Nearby Assignment
// ============================================================================
// Orders table = business truth (is the order assigned?)
// order_offers table = dispatch truth (who can currently see this order?)
// Redis = volatile state (GPS location, online status)
// FCM = transport only (no logic, just deliver messages)
//
// **ACTION-BASED SYSTEM** (No time-based expiry):
// - Offers stay until shopper explicitly ACCEPTS or DECLINES
// - If DECLINED → Goes to next shopper immediately
// - If ACCEPTED → Shopper works exclusively, no new offers until delivery
// - ONE ORDER AT A TIME → Cannot accept new orders while working on one
//
// Distance Gating: Only offer to shoppers within radius (3km → 5km → 8km)
// Location Validation: Shopper must have fresh location (< 30s old)
// ============================================================================

// ============================================================================
// DISTANCE & RADIUS CONFIGURATION
// ============================================================================
// Professional systems use round-based radius expansion to prevent starvation
// ============================================================================

interface RoundConfig {
  round: number;
  maxDistanceKm: number;
  maxEtaMinutes: number;
  offerDurationMs: number;
}

const ROUND_CONFIGS: RoundConfig[] = [
  { round: 1, maxDistanceKm: 3, maxEtaMinutes: 15, offerDurationMs: 60000 },
  { round: 2, maxDistanceKm: 5, maxEtaMinutes: 25, offerDurationMs: 60000 },
  { round: 3, maxDistanceKm: 8, maxEtaMinutes: 40, offerDurationMs: 90000 },
];

// For orders older than 30 minutes, use wider radius immediately
const URGENT_ORDER_AGE_MINUTES = 30;
const URGENT_MAX_DISTANCE_KM = 10;

// GraphQL query to get eligible orders (no active offers, not assigned)
const GET_ELIGIBLE_ORDERS = gql`
  query GetEligibleOrders {
    Orders(
      where: {
        _and: [
          { status: { _eq: "PENDING" } }
          { shopper_id: { _is_null: true } }
          { _not: { orderOffers: { status: { _eq: "OFFERED" } } } }
        ]
      }
      order_by: { created_at: asc }
      limit: 50
    ) {
      id
      created_at
      shop_id
      service_fee
      delivery_fee
      combined_order_id
      pin
      Shop {
        name
        latitude
        longitude
      }
      Address {
        latitude
        longitude
        street
        city
      }
      Order_Items_aggregate {
        aggregate {
          count
          sum {
            quantity
          }
        }
      }
    }
  }
`;

const GET_ELIGIBLE_REEL_ORDERS = gql`
  query GetEligibleReelOrders {
    reel_orders(
      where: {
        _and: [
          { status: { _eq: "PENDING" } }
          { shopper_id: { _is_null: true } }
          { _not: { orderOffers: { status: { _eq: "OFFERED" } } } }
        ]
      }
      order_by: { created_at: asc }
      limit: 50
    ) {
      id
      created_at
      service_fee
      delivery_fee
      total
      quantity
      Reel {
        title
        type
      }
      user: User {
        name
      }
      address: Address {
        latitude
        longitude
        street
        city
      }
    }
  }
`;

const GET_ELIGIBLE_RESTAURANT_ORDERS = gql`
  query GetEligibleRestaurantOrders {
    restaurant_orders(
      where: {
        _and: [
          { status: { _eq: "PENDING" } }
          { shopper_id: { _is_null: true } }
          { _not: { orderOffers: { status: { _eq: "OFFERED" } } } }
        ]
      }
      order_by: { updated_at: asc_nulls_last, created_at: asc }
      limit: 50
    ) {
      id
      created_at
      delivery_fee
      total
      delivery_time
      Restaurant {
        name
        lat
        long
      }
      orderedBy {
        name
      }
      Address {
        latitude
        longitude
        street
        city
      }
    }
  }
`;

// GraphQL query to get shopper performance data
const GET_SHOPPER_PERFORMANCE = gql`
  query GetShopperPerformance($shopper_id: uuid!) {
    Orders_aggregate(where: { shopper_id: { _eq: $shopper_id } }) {
      aggregate {
        count
      }
    }
    Ratings_aggregate(where: { shopper_id: { _eq: $shopper_id } }) {
      aggregate {
        avg {
          rating
        }
        count
      }
    }
  }
`;

// Query to get current round number for an order
const GET_CURRENT_ROUND = gql`
  query GetCurrentRound($order_id: uuid!) {
    order_offers(
      where: {
        _or: [
          { order_id: { _eq: $order_id } }
          { reel_order_id: { _eq: $order_id } }
          { restaurant_order_id: { _eq: $order_id } }
        ]
      }
      order_by: { round_number: desc }
      limit: 1
    ) {
      round_number
    }
  }
`;

// Query to check if shopper has already declined a regular order
const CHECK_SHOPPER_DECLINED_ORDER_REGULAR = gql`
  query CheckShopperDeclinedOrderRegular($order_id: uuid!, $shopper_id: uuid!) {
    order_offers(
      where: {
        _and: [
          { order_id: { _eq: $order_id } }
          { shopper_id: { _eq: $shopper_id } }
          { status: { _eq: "DECLINED" } }
        ]
      }
      limit: 1
    ) {
      id
      status
      round_number
    }
  }
`;

// Query to check if shopper has already declined a reel order
const CHECK_SHOPPER_DECLINED_ORDER_REEL = gql`
  query CheckShopperDeclinedOrderReel(
    $reel_order_id: uuid!
    $shopper_id: uuid!
  ) {
    order_offers(
      where: {
        _and: [
          { reel_order_id: { _eq: $reel_order_id } }
          { shopper_id: { _eq: $shopper_id } }
          { status: { _eq: "DECLINED" } }
        ]
      }
      limit: 1
    ) {
      id
      status
      round_number
    }
  }
`;

// Query to check if shopper has already declined a restaurant order
const CHECK_SHOPPER_DECLINED_ORDER_RESTAURANT = gql`
  query CheckShopperDeclinedOrderRestaurant(
    $restaurant_order_id: uuid!
    $shopper_id: uuid!
  ) {
    order_offers(
      where: {
        _and: [
          { restaurant_order_id: { _eq: $restaurant_order_id } }
          { shopper_id: { _eq: $shopper_id } }
          { status: { _eq: "DECLINED" } }
        ]
      }
      limit: 1
    ) {
      id
      status
      round_number
    }
  }
`;

// Query to check if shopper already has an active offer for this order (regular)
const CHECK_SHOPPER_EXISTING_OFFER_REGULAR = gql`
  query CheckShopperExistingOfferRegular(
    $order_id: uuid!
    $shopper_id: uuid!
    $order_type: String!
  ) {
    order_offers(
      where: {
        _and: [
          { shopper_id: { _eq: $shopper_id } }
          { order_type: { _eq: $order_type } }
          { status: { _in: ["OFFERED"] } }
          { order_id: { _eq: $order_id } }
        ]
      }
      limit: 1
    ) {
      id
      expires_at
      round_number
      status
    }
  }
`;

// Query to check if shopper already has an active offer for this order (reel)
const CHECK_SHOPPER_EXISTING_OFFER_REEL = gql`
  query CheckShopperExistingOfferReel(
    $reel_order_id: uuid!
    $shopper_id: uuid!
    $order_type: String!
  ) {
    order_offers(
      where: {
        _and: [
          { shopper_id: { _eq: $shopper_id } }
          { order_type: { _eq: $order_type } }
          { status: { _in: ["OFFERED"] } }
          { reel_order_id: { _eq: $reel_order_id } }
        ]
      }
      limit: 1
    ) {
      id
      expires_at
      round_number
      status
    }
  }
`;

// Query to check if shopper already has an active offer for this order (restaurant)
const CHECK_SHOPPER_EXISTING_OFFER_RESTAURANT = gql`
  query CheckShopperExistingOfferRestaurant(
    $restaurant_order_id: uuid!
    $shopper_id: uuid!
    $order_type: String!
  ) {
    order_offers(
      where: {
        _and: [
          { shopper_id: { _eq: $shopper_id } }
          { order_type: { _eq: $order_type } }
          { status: { _in: ["OFFERED"] } }
          { restaurant_order_id: { _eq: $restaurant_order_id } }
        ]
      }
      limit: 1
    ) {
      id
      expires_at
      round_number
      status
    }
  }
`;

// Mutation to update existing offer expiry time
const UPDATE_OFFER_EXPIRY = gql`
  mutation UpdateOfferExpiry($offer_id: uuid!, $expires_at: timestamptz!) {
    update_order_offers_by_pk(
      pk_columns: { id: $offer_id }
      _set: { expires_at: $expires_at, offered_at: "now()" }
    ) {
      id
      expires_at
      round_number
    }
  }
`;

// Mutation to create an exclusive offer
const CREATE_ORDER_OFFER = gql`
  mutation CreateOrderOffer(
    $order_id: uuid
    $reel_order_id: uuid
    $restaurant_order_id: uuid
    $business_order_id: uuid
    $shopper_id: uuid!
    $order_type: String!
    $offered_at: timestamptz!
    $expires_at: timestamptz!
    $round_number: Int!
  ) {
    insert_order_offers_one(
      object: {
        order_id: $order_id
        reel_order_id: $reel_order_id
        restaurant_order_id: $restaurant_order_id
        business_order_id: $business_order_id
        shopper_id: $shopper_id
        order_type: $order_type
        status: "OFFERED"
        offered_at: $offered_at
        expires_at: $expires_at
        round_number: $round_number
      }
    ) {
      id
      shopper_id
      status
      offered_at
      expires_at
      round_number
    }
  }
`;

// Haversine formula to calculate distance in kilometers
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate travel time in minutes (assuming 20 km/h average speed)
function calculateTravelTime(distanceKm: number): number {
  const averageSpeedKmh = 20;
  const travelTimeHours = distanceKm / averageSpeedKmh;
  return Math.round(travelTimeHours * 60);
}

// Format order data for API response
function formatOrderForResponse(
  order: any,
  shopperLocation: { lat: number; lng: number },
  expiresInMs: number
): any {
  const distance = calculateDistanceKm(
    shopperLocation.lat,
    shopperLocation.lng,
    parseFloat(order.Address?.latitude || order.address?.latitude),
    parseFloat(order.Address?.longitude || order.address?.longitude)
  );

  // Calculate items count based on order type
  let itemsCount = 1; // Default
  if (order.orderType === "regular") {
    const unitsCount =
      order.Order_Items_aggregate?.aggregate?.sum?.quantity || 0;
    const itemsTypeCount = order.Order_Items_aggregate?.aggregate?.count || 0;
    itemsCount = unitsCount || itemsTypeCount || 1;
  } else if (order.orderType === "reel") {
    itemsCount = order.quantity || 1;
  } else if (order.orderType === "restaurant") {
    itemsCount = order.items || order.quantity || 1;
  }

  return {
    id: order.id,
    shopName:
      order.Shop?.name ||
      order.Reel?.title ||
      order.Restaurant?.name ||
      "Unknown Shop",
    distance: distance,
    travelTimeMinutes: calculateTravelTime(distance),
    createdAt: order.created_at,
    customerAddress: `${order.Address?.street || order.address?.street}, ${
      order.Address?.city || order.address?.city
    }`,
    itemsCount: itemsCount,
    estimatedEarnings:
      order.orderType === "restaurant"
        ? parseFloat(order.delivery_fee || "0")
        : parseFloat(order.service_fee || "0") +
          parseFloat(order.delivery_fee || "0"),
    orderType: order.orderType,
    priority: order.priority,
    expiresIn: expiresInMs,
    // Add coordinates for map route display
    shopLatitude: parseFloat(
      order.Shop?.latitude || order.Restaurant?.lat || "0"
    ),
    shopLongitude: parseFloat(
      order.Shop?.longitude || order.Restaurant?.long || "0"
    ),
    customerLatitude: parseFloat(
      order.Address?.latitude || order.address?.latitude || "0"
    ),
    customerLongitude: parseFloat(
      order.Address?.longitude || order.address?.longitude || "0"
    ),
    // Add restaurant-specific fields
    ...(order.orderType === "restaurant" && {
      restaurant: order.Restaurant,
      total: parseFloat(order.total || "0"),
      deliveryTime: order.delivery_time,
    }),
    // Add reel-specific fields
    ...(order.orderType === "reel" && {
      reel: order.Reel,
    }),
  };
}

// Calculate shopper priority score (lower is better)
// Prioritizes older orders heavily while still considering new ones
function calculateShopperPriority(
  shopperLocation: { lat: number; lng: number },
  order: any,
  performance: any
): number {
  const orderLocation = {
    lat: parseFloat(order.Address?.latitude || order.address?.latitude),
    lng: parseFloat(order.Address?.longitude || order.address?.longitude),
  };

  // Calculate distance
  const distance = calculateDistanceKm(
    shopperLocation.lat,
    shopperLocation.lng,
    orderLocation.lat,
    orderLocation.lng
  );

  // Get performance metrics
  const avgRating = performance.Ratings_aggregate?.aggregate?.avg?.rating || 0;
  const orderCount = performance.Orders_aggregate?.aggregate?.count || 0;
  const completionRate =
    orderCount > 0 ? Math.min(100, (orderCount / 10) * 100) : 0; // Simplified completion rate

  // Calculate order age in minutes
  const orderTimestamp =
    order.orderType === "restaurant" && order.updated_at
      ? new Date(order.updated_at).getTime()
      : new Date(order.created_at).getTime();
  const ageInMinutes = (Date.now() - orderTimestamp) / 60000;

  // Age factor: heavily prioritize older orders, but don't completely ignore new ones
  // - Orders 30+ minutes old get maximum priority boost (lowest score)
  // - Orders 15-30 minutes old get moderate priority boost
  // - Orders under 15 minutes get less priority boost
  // - All orders are still considered, ensuring new ones don't get stuck
  let ageFactor;
  if (ageInMinutes >= 30) {
    // Very old orders: strongest priority (lowest score added)
    ageFactor = -5; // Negative value means higher priority
  } else if (ageInMinutes >= 15) {
    // Moderately old orders: good priority
    ageFactor = -2;
  } else if (ageInMinutes >= 5) {
    // Somewhat new orders: neutral priority
    ageFactor = 0;
  } else {
    // Very new orders: lower priority (higher score added)
    ageFactor = 2;
  }

  // Priority score calculation (lower is better)
  const priorityScore =
    distance * 0.3 + // Distance weight (30%)
    (5 - avgRating) * 1.5 + // Rating weight (inverted, 15%)
    (100 - completionRate) * 0.01 + // Completion rate weight (5%)
    ageFactor + // Age-based priority (50%)
    Math.random() * 0.3; // Small random factor (5%) for fairness

  return priorityScore;
}

// Note: Atomic assignment removed - shoppers must accept orders explicitly

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("=== Smart Assignment API (with Exclusive Offers) ===");
  console.log("Method:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { current_location, user_id } = req.body;
    console.log("Request body:", { user_id, current_location });

    if (!user_id) {
      console.warn("Missing user_id in request");
      return res.status(400).json({
        error: "User ID is required",
      });
    }

    if (!current_location || !current_location.lat || !current_location.lng) {
      console.warn("Missing or invalid current_location in request");
      return res.status(400).json({
        error: "Current location is required",
      });
    }

    if (!hasuraClient) {
      console.error("Hasura client is not initialized!");
      throw new Error("Hasura client is not initialized");
    }

    // ========================================================================
    // STEP 0: Check if shopper already has active orders
    // ========================================================================
    // ONE ORDER AT A TIME: Shopper cannot get new offers if they're working
    // on an order. They must complete/deliver it first.
    // ========================================================================

    // ========================================================================
    // Check if shopper has 2 or more active orders (not delivered)
    // ========================================================================
    // Shoppers can work on up to 2 orders at a time
    // If they have 2 active orders, block new offers until at least one is delivered
    // ========================================================================
    const CHECK_ACTIVE_ORDERS = gql`
      query CheckActiveOrders($shopper_id: uuid!) {
        Orders(
          where: {
            shopper_id: { _eq: $shopper_id }
            status: { _in: ["accepted", "in_progress", "picked_up"] }
          }
        ) {
          id
          status
        }
      }
    `;

    const activeOrdersData = (await hasuraClient.request(CHECK_ACTIVE_ORDERS, {
      shopper_id: user_id,
    })) as any;

    const activeOrders = activeOrdersData.Orders || [];
    const activeOrderCount = activeOrders.length;

    if (activeOrderCount >= 2) {
      console.log(
        "🚫 Shopper already has 2 active orders (not delivered) - cannot receive new offers:",
        {
          shopperId: user_id,
          activeOrderCount: activeOrderCount,
          orders: activeOrders.map((order: any) => ({
            orderId: order.id,
            status: order.status,
          })),
        }
      );

      return res.status(200).json({
        success: false,
        message: `You have ${activeOrderCount} active orders. Please deliver at least one before receiving new offers`,
        reason: "MAX_ACTIVE_ORDERS_REACHED",
        activeOrderCount: activeOrderCount,
        maxAllowed: 2,
        activeOrders: activeOrders.map((order: any) => ({
          orderId: order.id,
          status: order.status,
        })),
        note: "You can work on up to 2 orders at a time. Deliver at least one to receive new offers",
      });
    }

    if (activeOrderCount === 1) {
      console.log(
        "✅ Shopper has 1 active order - can still receive new offers (max 2 active orders)"
      );
    } else {
      console.log("✅ Shopper has no active orders - can receive new offers");
    }

    // ========================================================================
    // Check if shopper already has an active OFFERED offer
    // ========================================================================
    // One offer at a time rule: Shoppers can only have ONE pending offer
    // They must accept or decline it before receiving a new offer
    // ========================================================================
    const CHECK_ACTIVE_OFFERED_OFFER = gql`
      query CheckActiveOfferedOffer($shopper_id: uuid!) {
        order_offers(
          where: {
            shopper_id: { _eq: $shopper_id }
            status: { _eq: "OFFERED" }
            expires_at: { _gt: "now()" }
          }
          limit: 1
        ) {
          id
          order_id
          reel_order_id
          restaurant_order_id
          order_type
          status
          expires_at
          round_number
        }
      }
    `;

    const activeOfferedOfferData = (await hasuraClient.request(
      CHECK_ACTIVE_OFFERED_OFFER,
      {
        shopper_id: user_id,
      }
    )) as any;

    if (
      activeOfferedOfferData.order_offers &&
      activeOfferedOfferData.order_offers.length > 0
    ) {
      const activeOffer = activeOfferedOfferData.order_offers[0];
      const orderId =
        activeOffer.order_id ||
        activeOffer.reel_order_id ||
        activeOffer.restaurant_order_id;

      console.log(
        "🚫 Shopper already has an active OFFERED offer - cannot receive new offer:",
        {
          shopperId: user_id,
          offerId: activeOffer.id,
          orderId: orderId,
          orderType: activeOffer.order_type,
          status: activeOffer.status,
          expiresAt: activeOffer.expires_at,
          round: activeOffer.round_number,
        }
      );

      return res.status(200).json({
        success: false,
        message:
          "You have a pending offer. Please accept or decline it before receiving new offers",
        reason: "ACTIVE_OFFER_PENDING",
        activeOfferId: activeOffer.id,
        activeOrderId: orderId,
        activeOrderType: activeOffer.order_type,
        note: "Action-based system: You must accept or decline your current offer before receiving a new one",
      });
    }

    console.log(
      "✅ Shopper has no active orders or pending offers - can receive new offer"
    );

    // ========================================================================
    // STEP 1: Find Eligible Orders
    // ========================================================================
    // Orders are eligible only if:
    // - Order status = PENDING
    // - shopper_id IS NULL
    // - NO active offer (status=OFFERED, expires_at > now())
    // ========================================================================

    console.log("Fetching eligible orders (no active offers)...");
    const [
      regularOrdersData,
      reelOrdersData,
      restaurantOrdersData,
      performanceData,
    ] = await Promise.all([
      hasuraClient.request(GET_ELIGIBLE_ORDERS) as any,
      hasuraClient.request(GET_ELIGIBLE_REEL_ORDERS) as any,
      hasuraClient.request(GET_ELIGIBLE_RESTAURANT_ORDERS) as any,
      hasuraClient.request(GET_SHOPPER_PERFORMANCE, {
        shopper_id: user_id,
      }) as any,
    ]);

    const availableOrders = regularOrdersData.Orders || [];
    const availableReelOrders = reelOrdersData.reel_orders || [];
    const availableRestaurantOrders =
      restaurantOrdersData.restaurant_orders || [];

    console.log("Eligible orders (no active offers):", {
      regular: availableOrders.length,
      reel: availableReelOrders.length,
      restaurant: availableRestaurantOrders.length,
      total:
        availableOrders.length +
        availableReelOrders.length +
        availableRestaurantOrders.length,
    });

    // Combine all orders with type information
    const allOrders = [
      ...availableOrders.map((order: any) => ({
        ...order,
        orderType: "regular",
      })),
      ...availableReelOrders.map((order: any) => ({
        ...order,
        orderType: "reel",
      })),
      ...availableRestaurantOrders.map((order: any) => ({
        ...order,
        orderType: "restaurant",
      })),
    ];

    if (allOrders.length === 0) {
      console.log("No eligible orders found");
      return res.status(200).json({
        success: false,
        message: "No available orders at the moment",
        orders: [],
      });
    }

    // ========================================================================
    // STEP 1.5: DISTANCE GATING (Professional Eligibility Checks)
    // ========================================================================
    // Server-side validation (never trust client):
    // 1. Check shopper is online (has fresh Redis location)
    // 2. Filter orders by distance (round-based radius expansion)
    // 3. Log all skips for audit/debugging
    // ========================================================================

    console.log("📍 Performing distance gating checks...");

    // Check if shopper has fresh location in Redis
    const redisLocation = await getShopperLocation(user_id);
    const useRedisLocation = redisLocation !== null;

    if (useRedisLocation) {
      const locationAge = (Date.now() - redisLocation.updatedAt) / 1000;
      console.log(
        `✅ Using Redis location (age: ${locationAge.toFixed(1)}s):`,
        redisLocation
      );

      // Check if location is fresh enough
      if (locationAge > 30) {
        console.warn(
          `⚠️ Location is stale (${locationAge.toFixed(
            1
          )}s old). Shopper may be offline.`
        );
        await logOfferSkip({
          orderId: "N/A",
          shopperId: user_id,
          reason: "STALE_LOCATION",
          metadata: { locationAge },
        });
      }
    } else {
      console.log(
        "⚠️ No Redis location found. Using fallback client location."
      );
      console.log(
        "   (This is normal if Redis is unavailable or shopper just went online)"
      );
    }

    // Use Redis location if available, otherwise fall back to client location
    const shopperLocation = useRedisLocation
      ? { lat: redisLocation.lat, lng: redisLocation.lng }
      : current_location;

    // Filter orders by distance with round-based expansion
    const nearbyOrders: any[] = [];

    for (const order of allOrders) {
      const orderLocation = {
        lat: parseFloat(order.Address?.latitude || order.address?.latitude),
        lng: parseFloat(order.Address?.longitude || order.address?.longitude),
      };

      const distance = calculateDistanceKm(
        shopperLocation.lat,
        shopperLocation.lng,
        orderLocation.lat,
        orderLocation.lng
      );

      // Calculate order age
      const orderTimestamp =
        order.orderType === "restaurant" && order.updated_at
          ? new Date(order.updated_at).getTime()
          : new Date(order.created_at).getTime();
      const orderAgeMinutes = (Date.now() - orderTimestamp) / 60000;

      // Determine max distance based on order age and round
      let maxDistanceKm: number;
      let maxEtaMinutes: number;

      if (orderAgeMinutes >= URGENT_ORDER_AGE_MINUTES) {
        // Urgent old orders: use wider radius immediately
        maxDistanceKm = URGENT_MAX_DISTANCE_KM;
        maxEtaMinutes = 60;
        console.log(
          `⏰ URGENT order ${order.id} (${orderAgeMinutes.toFixed(
            1
          )}m old) - using ${maxDistanceKm}km radius`
        );
      } else {
        // Get current round for this order
        const roundData = (await hasuraClient.request(GET_CURRENT_ROUND, {
          order_id: order.id,
        })) as any;

        const currentRound = roundData.order_offers?.[0]?.round_number || 0;
        const nextRound = currentRound + 1;

        // Get config for next round (capped at max round)
        const roundConfig =
          ROUND_CONFIGS[Math.min(nextRound - 1, ROUND_CONFIGS.length - 1)];
        maxDistanceKm = roundConfig.maxDistanceKm;
        maxEtaMinutes = roundConfig.maxEtaMinutes;

        console.log(
          `📍 Order ${
            order.id
          } round ${nextRound}: max ${maxDistanceKm}km, distance ${distance.toFixed(
            2
          )}km`
        );
      }

      // Distance check
      if (distance > maxDistanceKm) {
        console.log(
          `❌ SKIP: Order ${order.id} too far (${distance.toFixed(
            2
          )}km > ${maxDistanceKm}km)`
        );
        await logOfferSkip({
          orderId: order.id,
          shopperId: user_id,
          reason: "DISTANCE_TOO_FAR",
          distance,
          metadata: {
            maxDistanceKm,
            orderAgeMinutes,
          },
        });
        continue;
      }

      // ETA check (optional but professional)
      const eta = calculateTravelTime(distance);
      if (eta > maxEtaMinutes) {
        console.log(
          `❌ SKIP: Order ${order.id} ETA too long (${eta}min > ${maxEtaMinutes}min)`
        );
        await logOfferSkip({
          orderId: order.id,
          shopperId: user_id,
          reason: "ETA_TOO_LONG",
          distance,
          metadata: {
            eta,
            maxEtaMinutes,
          },
        });
        continue;
      }

      // Check if shopper has already declined this order
      // Use separate queries for each order type to avoid null UUID issues
      let declinedCheck: any = { order_offers: [] };

      try {
        if (order.orderType === "regular") {
          declinedCheck = (await hasuraClient.request(
            CHECK_SHOPPER_DECLINED_ORDER_REGULAR,
            {
              order_id: order.id,
              shopper_id: user_id,
            }
          )) as any;
        } else if (order.orderType === "reel") {
          declinedCheck = (await hasuraClient.request(
            CHECK_SHOPPER_DECLINED_ORDER_REEL,
            {
              reel_order_id: order.id,
              shopper_id: user_id,
            }
          )) as any;
        } else if (order.orderType === "restaurant") {
          declinedCheck = (await hasuraClient.request(
            CHECK_SHOPPER_DECLINED_ORDER_RESTAURANT,
            {
              restaurant_order_id: order.id,
              shopper_id: user_id,
            }
          )) as any;
        }

        if (
          declinedCheck.order_offers &&
          declinedCheck.order_offers.length > 0
        ) {
          console.log(
            `❌ SKIP: Order ${order.id} was already declined by this shopper (round ${declinedCheck.order_offers[0].round_number})`
          );
          await logOfferSkip({
            orderId: order.id,
            shopperId: user_id,
            reason: "ALREADY_DECLINED",
            distance,
            metadata: {
              declinedRound: declinedCheck.order_offers[0].round_number,
            },
          });
          continue;
        }
      } catch (error) {
        // Log error but don't block the order - better to show it than fail silently
        console.error("Error checking declined order status:", error);
        logger.error("Error checking declined order", "SmartAssignOrder", {
          orderId: order.id,
          orderType: order.orderType,
          shopperId: user_id,
          error: error instanceof Error ? error.message : String(error),
        });
        // Continue processing - don't skip the order if we can't check declined status
      }

      // Order passes all checks
      nearbyOrders.push({
        ...order,
        distance,
        eta,
      });
      console.log(
        `✅ ELIGIBLE: Order ${order.id} (${distance.toFixed(
          2
        )}km, ${eta}min ETA)`
      );
    }

    console.log(
      `📊 Distance filtering: ${allOrders.length} total → ${nearbyOrders.length} nearby`
    );

    if (nearbyOrders.length === 0) {
      console.log("No nearby orders found after distance gating");
      return res.status(200).json({
        success: false,
        message: "No nearby orders available at the moment",
        orders: [],
        reason: "DISTANCE_FILTERED",
      });
    }

    // ========================================================================
    // STEP 2: Select the Next Shopper for Each Order
    // ========================================================================
    // Use smart logic (distance, age, rating, completion rate, random factor)
    // to find the best order for THIS shopper
    // ========================================================================

    console.log(
      "Calculating priority for",
      nearbyOrders.length,
      "nearby orders"
    );

    // Calculate priority for each order
    const ordersWithPriority = nearbyOrders.map((order) => ({
      ...order,
      priority: calculateShopperPriority(
        shopperLocation, // Use validated shopper location
        order,
        performanceData
      ),
    }));

    // Sort by priority (lowest first)
    ordersWithPriority.sort((a, b) => a.priority - b.priority);

    // Get the best order for this shopper
    const bestOrder = ordersWithPriority[0];
    console.log("✅ Best order selected for this shopper:", {
      id: bestOrder.id,
      type: bestOrder.orderType,
      distance: bestOrder.distance.toFixed(2) + "km",
      eta: bestOrder.eta + "min",
      priority: bestOrder.priority.toFixed(2),
    });

    // ========================================================================
    // STEP 3: Create Exclusive Offer (THIS IS THE LOCK)
    // ========================================================================
    // Insert one row into order_offers
    // This row is the exclusive lock - only this shopper can see the order
    // ========================================================================

    // Get current round number for this order
    const roundData = (await hasuraClient.request(GET_CURRENT_ROUND, {
      order_id: bestOrder.id,
    })) as any;

    const currentRound = roundData.order_offers?.[0]?.round_number || 0;
    const nextRound = currentRound + 1;

    const now = new Date();
    const offeredAt = now.toISOString();
    // Set expiry to 4 hours from now (fallback safety - action-based system means shopper must accept/decline)
    const expiresAt = new Date(
      now.getTime() + 4 * 60 * 60 * 1000
    ).toISOString();

    // Prepare the order_id field based on order type
    // Set unused foreign keys explicitly to null to avoid constraint violations
    const offerVariables: any = {
      shopper_id: user_id,
      order_type: bestOrder.orderType,
      offered_at: offeredAt,
      expires_at: expiresAt,
      round_number: nextRound,
      order_id: null,
      reel_order_id: null,
      restaurant_order_id: null,
      business_order_id: null,
    };

    // Set only the relevant order ID based on type
    if (bestOrder.orderType === "regular") {
      offerVariables.order_id = bestOrder.id;
    } else if (bestOrder.orderType === "reel") {
      offerVariables.reel_order_id = bestOrder.id;
    } else if (bestOrder.orderType === "restaurant") {
      offerVariables.restaurant_order_id = bestOrder.id;
    }

    // ========================================================================
    // Check if shopper already has an active offer for this order
    // If yes, just extend the expiry time instead of creating a duplicate
    // ========================================================================

    let existingOfferData: any;

    if (bestOrder.orderType === "regular") {
      existingOfferData = await hasuraClient.request(
        CHECK_SHOPPER_EXISTING_OFFER_REGULAR,
        {
          shopper_id: user_id,
          order_type: bestOrder.orderType,
          order_id: bestOrder.id,
        }
      );
    } else if (bestOrder.orderType === "reel") {
      existingOfferData = await hasuraClient.request(
        CHECK_SHOPPER_EXISTING_OFFER_REEL,
        {
          shopper_id: user_id,
          order_type: bestOrder.orderType,
          reel_order_id: bestOrder.id,
        }
      );
    } else if (bestOrder.orderType === "restaurant") {
      existingOfferData = await hasuraClient.request(
        CHECK_SHOPPER_EXISTING_OFFER_RESTAURANT,
        {
          shopper_id: user_id,
          order_type: bestOrder.orderType,
          restaurant_order_id: bestOrder.id,
        }
      );
    }

    const existingOffer = existingOfferData.order_offers?.[0];

    let offerId: string;
    let offerRound: number;
    let isExtendingOffer = false; // Track if we're extending vs creating

    if (existingOffer) {
      isExtendingOffer = true; // Mark that we're extending
      // Shopper already has an active offer for this order - just extend the expiry
      console.log("🔄 Extending existing offer (preventing duplicate):", {
        existingOfferId: existingOffer.id,
        orderId: bestOrder.id,
        shopperId: user_id,
        currentExpiry: existingOffer.expires_at,
        newExpiry: expiresAt,
        round: existingOffer.round_number,
      });

      const updateResult = (await hasuraClient.request(UPDATE_OFFER_EXPIRY, {
        offer_id: existingOffer.id,
        expires_at: expiresAt,
      })) as any;

      offerId = existingOffer.id;
      offerRound = existingOffer.round_number;

      console.log("✅ Offer expiry extended:", {
        offerId,
        newExpiresAt: expiresAt,
        round: offerRound,
      });
    } else {
      // No existing offer found - but double-check before creating to prevent race conditions
      // Re-check one more time to ensure no duplicate was created between our check and now
      let finalCheckData: any;
      if (bestOrder.orderType === "regular") {
        finalCheckData = await hasuraClient.request(
          CHECK_SHOPPER_EXISTING_OFFER_REGULAR,
          {
            shopper_id: user_id,
            order_type: bestOrder.orderType,
            order_id: bestOrder.id,
          }
        );
      } else if (bestOrder.orderType === "reel") {
        finalCheckData = await hasuraClient.request(
          CHECK_SHOPPER_EXISTING_OFFER_REEL,
          {
            shopper_id: user_id,
            order_type: bestOrder.orderType,
            reel_order_id: bestOrder.id,
          }
        );
      } else if (bestOrder.orderType === "restaurant") {
        finalCheckData = await hasuraClient.request(
          CHECK_SHOPPER_EXISTING_OFFER_RESTAURANT,
          {
            shopper_id: user_id,
            order_type: bestOrder.orderType,
            restaurant_order_id: bestOrder.id,
          }
        );
      }

      const finalCheckOffer = finalCheckData.order_offers?.[0];

      if (finalCheckOffer) {
        // Another request created the offer between our checks - extend it instead
        console.log(
          "🔄 Race condition detected - offer created by another request, extending:",
          {
            existingOfferId: finalCheckOffer.id,
            orderId: bestOrder.id,
            shopperId: user_id,
          }
        );

        const updateResult = (await hasuraClient.request(UPDATE_OFFER_EXPIRY, {
          offer_id: finalCheckOffer.id,
          expires_at: expiresAt,
        })) as any;

        offerId = finalCheckOffer.id;
        offerRound = finalCheckOffer.round_number;

        console.log("✅ Offer extended (race condition handled):", {
          offerId,
          round: offerRound,
        });
        isExtendingOffer = true; // Mark that we're extending, not creating
      } else {
        // Confirmed no existing offer - safe to create new one
        console.log("Creating exclusive offer:", {
          orderId: bestOrder.id,
          orderType: bestOrder.orderType,
          shopperId: user_id,
          round: nextRound,
          note: "No time limit - shopper must accept or decline",
        });

        try {
          const offerResult = (await hasuraClient.request(
            CREATE_ORDER_OFFER,
            offerVariables
          )) as any;

          if (!offerResult.insert_order_offers_one) {
            throw new Error("Failed to create order offer");
          }

          offerId = offerResult.insert_order_offers_one.id;
          offerRound = nextRound;

          console.log("✅ Exclusive offer created:", {
            offerId,
            round: offerRound,
          });
        } catch (error: any) {
          // Handle potential unique constraint violation
          if (
            error.message?.includes("duplicate") ||
            error.message?.includes("unique constraint")
          ) {
            console.warn(
              "⚠️ Duplicate offer detected during creation, checking for existing offer:",
              {
                orderId: bestOrder.id,
                shopperId: user_id,
              }
            );

            // One final check - maybe another request created it
            let recoveryCheckData: any;
            if (bestOrder.orderType === "regular") {
              recoveryCheckData = await hasuraClient.request(
                CHECK_SHOPPER_EXISTING_OFFER_REGULAR,
                {
                  shopper_id: user_id,
                  order_type: bestOrder.orderType,
                  order_id: bestOrder.id,
                }
              );
            } else if (bestOrder.orderType === "reel") {
              recoveryCheckData = await hasuraClient.request(
                CHECK_SHOPPER_EXISTING_OFFER_REEL,
                {
                  shopper_id: user_id,
                  order_type: bestOrder.orderType,
                  reel_order_id: bestOrder.id,
                }
              );
            } else if (bestOrder.orderType === "restaurant") {
              recoveryCheckData = await hasuraClient.request(
                CHECK_SHOPPER_EXISTING_OFFER_RESTAURANT,
                {
                  shopper_id: user_id,
                  order_type: bestOrder.orderType,
                  restaurant_order_id: bestOrder.id,
                }
              );
            }

            const recoveryOffer = recoveryCheckData.order_offers?.[0];
            if (recoveryOffer) {
              // Found it - extend instead
              const updateResult = (await hasuraClient.request(
                UPDATE_OFFER_EXPIRY,
                {
                  offer_id: recoveryOffer.id,
                  expires_at: expiresAt,
                }
              )) as any;

              offerId = recoveryOffer.id;
              offerRound = recoveryOffer.round_number;
              isExtendingOffer = true; // Mark that we're extending, not creating

              console.log(
                "✅ Recovered from duplicate - extended existing offer:",
                {
                  offerId,
                  round: offerRound,
                }
              );
            } else {
              throw error; // Re-throw if we can't recover
            }
          } else {
            throw error; // Re-throw other errors
          }
        }
      }
    }

    // ========================================================================
    // STEP 5: Send FCM Notification (Aligned with Offer)
    // ========================================================================
    // FCM payload represents the OFFER, not just the order
    // expiresIn must match the database expires_at
    // ========================================================================

    const orderData = formatOrderForResponse(
      bestOrder,
      shopperLocation, // Use validated shopper location
      null // No time-based expiry
    );

    // Only send FCM notification for NEW offers, not when extending existing ones
    // This prevents duplicate notifications when polling refreshes the same offer
    if (!isExtendingOffer) {
      try {
        // Check if this is a combined order
        let notificationData: any = {
          id: bestOrder.id,
          shopName: orderData.shopName,
          customerAddress: orderData.customerAddress,
          distance: orderData.distance,
          itemsCount: orderData.itemsCount,
          travelTimeMinutes: orderData.travelTimeMinutes,
          estimatedEarnings: orderData.estimatedEarnings,
          orderType: orderData.orderType,
          expiresInMs: null, // No expiry - shopper must accept or decline
        };

        // If it's a combined order (has combined_order_id), fetch all related orders
        if (bestOrder.combined_order_id && bestOrder.orderType === "regular") {
          try {
            const GET_COMBINED_ORDER_INFO = gql`
              query GetCombinedOrderInfo($combined_order_id: uuid!) {
                Orders(where: { combined_order_id: { _eq: $combined_order_id } }) {
                  id
                  service_fee
                  delivery_fee
                  Shop {
                    name
                  }
                  Order_Items_aggregate {
                    aggregate {
                      count
                    }
                  }
                }
              }
            `;

            const combinedOrderData = (await hasuraClient.request(
              GET_COMBINED_ORDER_INFO,
              { combined_order_id: bestOrder.combined_order_id }
            )) as any;

            const allOrders = combinedOrderData.Orders || [];
            if (allOrders.length > 1) {
              // Calculate combined totals
              const totalEarnings = allOrders.reduce((sum: number, order: any) => {
                return (
                  sum +
                  parseFloat(order.service_fee || "0") +
                  parseFloat(order.delivery_fee || "0")
                );
              }, 0);

              const totalItems = allOrders.reduce((sum: number, order: any) => {
                return sum + (order.Order_Items_aggregate.aggregate?.count || 0);
              }, 0);

              const storeNames = allOrders
                .map((order: any) => order.Shop?.name)
                .filter(Boolean)
                .join(", ");

              // Update notification data for combined order
              notificationData = {
                ...notificationData,
                id: bestOrder.combined_order_id, // Use combined_order_id
                estimatedEarnings: totalEarnings,
                itemsCount: totalItems,
                isCombinedOrder: true,
                orderCount: allOrders.length,
                storeNames: storeNames,
              };

              console.log("🛒 Combined order detected:", {
                combined_order_id: bestOrder.combined_order_id,
                storeCount: allOrders.length,
                totalEarnings,
                stores: storeNames,
              });
            }
          } catch (combinedOrderError) {
            console.error(
              "Error fetching combined order info:",
              combinedOrderError
            );
            // Continue with single order notification if combined fetch fails
          }
        }

        await sendNewOrderNotification(user_id, notificationData);

        console.log(
          "✅ FCM notification sent to shopper:",
          user_id,
          "for order:",
          bestOrder.id,
          notificationData.isCombinedOrder
            ? `(Combined: ${notificationData.orderCount} stores)`
            : "",
          "| No time limit - waiting for explicit action"
        );
      } catch (fcmError) {
        console.error("Failed to send FCM notification:", fcmError);
        // Continue even if notification fails - shopper can still poll
      }
    } else {
      console.log(
        "⏭️ Skipping FCM notification - extending existing offer (preventing duplicate notification)"
      );
    }

    return res.status(200).json({
      success: true,
      order: orderData,
      message: isExtendingOffer
        ? "Offer refreshed - still waiting for shopper action"
        : "Exclusive offer created - shopper must accept or decline",
      offerId: offerId,
      round: offerRound,
      expiresIn: null, // No time limit
      wasExtended: isExtendingOffer,
      note: "Action-based system: offer stays until shopper accepts or declines",
    });
  } catch (error) {
    console.error("=== ERROR in Smart Assignment API ===");
    console.error("Error:", error);
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    logger.error("Error in smart assignment", "SmartAssignmentAPI", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return res.status(500).json({
      error: "Failed to find order",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
