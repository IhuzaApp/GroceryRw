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
          {
            _not: {
              orderOffers: {
                _and: [
                  { status: { _eq: "OFFERED" } }
                  { expires_at: { _gt: "now()" } }
                ]
              }
            }
          }
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
          {
            _not: {
              orderOffers: {
                _and: [
                  { status: { _eq: "OFFERED" } }
                  { expires_at: { _gt: "now()" } }
                ]
              }
            }
          }
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
          {
            _not: {
              orderOffers: {
                _and: [
                  { status: { _eq: "OFFERED" } }
                  { expires_at: { _gt: "now()" } }
                ]
              }
            }
          }
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
    
    const CHECK_ACTIVE_ORDERS = gql`
      query CheckActiveOrders($shopper_id: uuid!) {
        Orders(
          where: {
            shopper_id: { _eq: $shopper_id }
            status: { _in: ["accepted", "in_progress", "picked_up"] }
          }
          limit: 1
        ) {
          id
          status
        }
      }
    `;

    const activeOrdersData = (await hasuraClient.request(CHECK_ACTIVE_ORDERS, {
      shopper_id: user_id,
    })) as any;

    if (activeOrdersData.Orders && activeOrdersData.Orders.length > 0) {
      const activeOrder = activeOrdersData.Orders[0];
      console.log("🚫 Shopper already has active order:", {
        shopperId: user_id,
        activeOrderId: activeOrder.id,
        status: activeOrder.status,
      });
      
      return res.status(200).json({
        success: false,
        message: "Complete your current order before accepting new ones",
        reason: "ACTIVE_ORDER_IN_PROGRESS",
        activeOrderId: activeOrder.id,
        activeOrderStatus: activeOrder.status,
      });
    }

    console.log("✅ Shopper has no active orders - can receive new offers");

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
          `⚠️ Location is stale (${locationAge.toFixed(1)}s old). Shopper may be offline.`
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
          `⏰ URGENT order ${order.id} (${orderAgeMinutes.toFixed(1)}m old) - using ${maxDistanceKm}km radius`
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
          `📍 Order ${order.id} round ${nextRound}: max ${maxDistanceKm}km, distance ${distance.toFixed(2)}km`
        );
      }

      // Distance check
      if (distance > maxDistanceKm) {
        console.log(
          `❌ SKIP: Order ${order.id} too far (${distance.toFixed(2)}km > ${maxDistanceKm}km)`
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

      // Order passes all checks
      nearbyOrders.push({
        ...order,
        distance,
        eta,
      });
      console.log(
        `✅ ELIGIBLE: Order ${order.id} (${distance.toFixed(2)}km, ${eta}min ETA)`
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

    console.log("Calculating priority for", nearbyOrders.length, "nearby orders");

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
    // No time-based expiry - set to 7 days in future (effectively "until action taken")
    const expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)).toISOString();

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

    if (existingOffer) {
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
      // No existing offer - create a new one
      console.log("Creating exclusive offer:", {
        orderId: bestOrder.id,
        orderType: bestOrder.orderType,
        shopperId: user_id,
        round: nextRound,
        note: "No time limit - shopper must accept or decline",
      });

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

      try {
        await sendNewOrderNotification(user_id, {
          id: bestOrder.id,
        shopName: orderData.shopName,
        customerAddress: orderData.customerAddress,
        distance: orderData.distance,
        itemsCount: orderData.itemsCount,
        travelTimeMinutes: orderData.travelTimeMinutes,
        estimatedEarnings: orderData.estimatedEarnings,
        orderType: orderData.orderType,
        expiresInMs: null, // No expiry - shopper must accept or decline
      });

      console.log(
        "✅ FCM notification sent to shopper:",
        user_id,
        "for order:",
        bestOrder.id,
        "| No time limit - waiting for explicit action"
      );
    } catch (fcmError) {
      console.error("Failed to send FCM notification:", fcmError);
      // Continue even if notification fails - shopper can still poll
    }

    return res.status(200).json({
      success: true,
      order: orderData,
      message: existingOffer 
        ? "Offer refreshed - still waiting for shopper action"
        : "Exclusive offer created - shopper must accept or decline",
      offerId: offerId,
      round: offerRound,
      expiresIn: null, // No time limit
      wasExtended: !!existingOffer,
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
