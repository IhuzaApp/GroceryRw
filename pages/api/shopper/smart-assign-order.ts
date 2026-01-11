import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// GraphQL query to get available orders for notification
const GET_AVAILABLE_ORDERS = gql`
  query GetAvailableOrders($current_time: timestamptz!) {
    Orders(
      where: {
        status: { _eq: "PENDING" }
        created_at: { _gt: $current_time }
        shopper_id: { _is_null: true }
      }
      order_by: { created_at: asc }
      limit: 20
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
    }
  }
`;

// GraphQL query to get available reel orders for notification
const GET_AVAILABLE_REEL_ORDERS = gql`
  query GetAvailableReelOrders($current_time: timestamptz!) {
    reel_orders(
      where: {
        status: { _eq: "PENDING" }
        created_at: { _gt: $current_time }
        shopper_id: { _is_null: true }
      }
      order_by: { created_at: asc }
      limit: 20
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

// GraphQL query to get available restaurant orders for notification
const GET_AVAILABLE_RESTAURANT_ORDERS = gql`
  query GetAvailableRestaurantOrders($current_time: timestamptz!) {
    restaurant_orders(
      where: {
        status: { _eq: "PENDING" }
        shopper_id: { _is_null: true }
        _or: [
          { updated_at: { _gte: $current_time } }
          {
            updated_at: { _is_null: true }
            created_at: { _gte: $current_time }
          }
        ]
      }
      order_by: { updated_at: asc_nulls_last, created_at: asc }
      limit: 20
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

// Note: We don't auto-assign orders anymore
// Shoppers must explicitly accept orders through the accept-batch API

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

// Calculate shopper priority score (lower is better)
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

  // Priority score calculation (lower is better)
  const priorityScore =
    distance * 0.4 + // Distance weight (40%)
    (5 - avgRating) * 2 + // Rating weight (inverted, 20%)
    (100 - completionRate) * 0.01 + // Completion rate weight (10%)
    Math.random() * 0.5; // Small random factor (10%) for fairness

  return priorityScore;
}

// Note: Atomic assignment removed - shoppers must accept orders explicitly

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("=== Smart Assignment API called ===");
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

    console.log("Checking hasuraClient...");
    if (!hasuraClient) {
      console.error("Hasura client is not initialized!");
      throw new Error("Hasura client is not initialized");
    }
    console.log("hasuraClient is initialized");

    // Get orders created in the last 29 minutes
    const twentyNineMinutesAgo = new Date(
      Date.now() - 29 * 60 * 1000
    ).toISOString();
    console.log("Fetching orders created after:", twentyNineMinutesAgo);

    // Fetch regular, reel, and restaurant orders in parallel
    console.log("Fetching orders and shopper performance from Hasura...");
    const [
      regularOrdersData,
      reelOrdersData,
      restaurantOrdersData,
      performanceData,
    ] = await Promise.all([
      hasuraClient.request(GET_AVAILABLE_ORDERS, {
        current_time: twentyNineMinutesAgo,
      }) as any,
      hasuraClient.request(GET_AVAILABLE_REEL_ORDERS, {
        current_time: twentyNineMinutesAgo,
      }) as any,
      hasuraClient.request(GET_AVAILABLE_RESTAURANT_ORDERS, {
        current_time: twentyNineMinutesAgo,
      }) as any,
      hasuraClient.request(GET_SHOPPER_PERFORMANCE, {
        shopper_id: user_id,
      }) as any,
    ]);
    console.log("Data fetched successfully from Hasura");

    const availableOrders = regularOrdersData.Orders || [];
    const availableReelOrders = reelOrdersData.reel_orders || [];
    const availableRestaurantOrders =
      restaurantOrdersData.restaurant_orders || [];
    
    console.log("Available orders counts:", {
      regular: availableOrders.length,
      reel: availableReelOrders.length,
      restaurant: availableRestaurantOrders.length,
      total: availableOrders.length + availableReelOrders.length + availableRestaurantOrders.length
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
      console.log("No available orders found");
      return res.status(200).json({
        success: false,
        message: "No available orders at the moment",
        orders: [],
      });
    }
    
    console.log("Calculating priority for", allOrders.length, "orders");

    // Calculate priority for each order
    const ordersWithPriority = allOrders.map((order) => ({
      ...order,
      priority: calculateShopperPriority(
        current_location,
        order,
        performanceData
      ),
    }));

    // Sort by priority (lowest first)
    ordersWithPriority.sort((a, b) => a.priority - b.priority);

    // Get the best order for the shopper to see (don't assign yet)
    const bestOrder = ordersWithPriority[0];
    console.log("Best order selected:", {
      id: bestOrder.id,
      type: bestOrder.orderType,
      priority: bestOrder.priority
    });

    // Calculate distance and travel time
    const distance = calculateDistanceKm(
      current_location.lat,
      current_location.lng,
      parseFloat(bestOrder.Address?.latitude || bestOrder.address?.latitude),
      parseFloat(bestOrder.Address?.longitude || bestOrder.address?.longitude)
    );

    // Calculate travel time in minutes (assuming 20 km/h average speed)
    const calculateTravelTime = (distanceKm: number): number => {
      const averageSpeedKmh = 20;
      const travelTimeHours = distanceKm / averageSpeedKmh;
      return Math.round(travelTimeHours * 60);
    };

    // Format order for notification (don't assign yet)
    const orderForNotification = {
      id: bestOrder.id,
      shopName:
        bestOrder.Shop?.name ||
        bestOrder.Reel?.title ||
        bestOrder.Restaurant?.name ||
        "Unknown Shop",
      distance: distance,
      travelTimeMinutes: calculateTravelTime(distance),
      createdAt: bestOrder.created_at,
      customerAddress: `${
        bestOrder.Address?.street || bestOrder.address?.street
      }, ${bestOrder.Address?.city || bestOrder.address?.city}`,
      itemsCount: bestOrder.quantity || 1,
      estimatedEarnings:
        bestOrder.orderType === "restaurant"
          ? parseFloat(bestOrder.delivery_fee || "0") // Restaurant orders: delivery only
          : parseFloat(bestOrder.service_fee || "0") +
            parseFloat(bestOrder.delivery_fee || "0"), // Regular and reel orders: service + delivery
      orderType: bestOrder.orderType,
      priority: bestOrder.priority,
      // Add restaurant-specific fields
      ...(bestOrder.orderType === "restaurant" && {
        restaurant: bestOrder.Restaurant,
        total: parseFloat(bestOrder.total || "0"),
        deliveryTime: bestOrder.delivery_time,
      }),
      // Add reel-specific fields
      ...(bestOrder.orderType === "reel" && {
        reel: bestOrder.Reel,
      }),
    };

    console.log("Returning order notification:", {
      orderId: orderForNotification.id,
      orderType: orderForNotification.orderType,
      distance: orderForNotification.distance,
      estimatedEarnings: orderForNotification.estimatedEarnings
    });
    
    return res.status(200).json({
      success: true,
      order: orderForNotification,
      message: "Order found - shopper can accept or skip",
    });
  } catch (error) {
    console.error("=== ERROR in Smart Assignment API ===");
    console.error("Error:", error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
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
