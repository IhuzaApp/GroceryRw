import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";
import {
  sendNewOrderNotification,
  sendOrderExpiredNotification,
} from "../../../src/services/fcmService";

// GraphQL query to get available shoppers with FCM tokens
const GET_AVAILABLE_SHOPPERS = gql`
  query GetAvailableShoppers {
    Shopper_Availability(where: { is_available: { _eq: true } }) {
      user_id
      last_known_latitude
      last_known_longitude
    }
  }
`;

// GraphQL query to get available orders
const GET_AVAILABLE_ORDERS = gql`
  query GetAvailableOrders($current_time: timestamptz!) {
    Orders(
      where: {
        status: { _eq: "PENDING" }
        created_at: { _gt: $current_time }
        shopper_id: { _is_null: true }
      }
      order_by: { created_at: asc }
      limit: 10
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

// GraphQL query to get available reel orders
const GET_AVAILABLE_REEL_ORDERS = gql`
  query GetAvailableReelOrders($current_time: timestamptz!) {
    reel_orders(
      where: {
        status: { _eq: "PENDING" }
        created_at: { _gt: $current_time }
        shopper_id: { _is_null: true }
      }
      order_by: { created_at: asc }
      limit: 10
    ) {
      id
      created_at
      service_fee
      delivery_fee
      Reel {
        title
        latitude
        longitude
      }
      address {
        latitude
        longitude
        street
        city
      }
    }
  }
`;

// GraphQL query to get available restaurant orders
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
      limit: 10
    ) {
      id
      created_at
      delivery_fee
      total
      Restaurant {
        name
        lat
        long
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

// Calculate distance between two points
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
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
};

// Calculate shopper priority
const calculateShopperPriority = (
  shopperLocation: { lat: number; lng: number },
  order: any,
  performanceData: any
): number => {
  const distance = calculateDistance(
    shopperLocation.lat,
    shopperLocation.lng,
    parseFloat(order.Address?.latitude || order.address?.latitude),
    parseFloat(order.Address?.longitude || order.address?.longitude)
  );

  // Base priority is distance (lower is better)
  let priority = distance;

  // Add performance factors if available
  if (performanceData?.Ratings_aggregate?.aggregate?.avg?.rating) {
    const rating = performanceData.Ratings_aggregate.aggregate.avg.rating;
    priority -= (rating - 3) * 0.5; // Higher rating = lower priority (better)
  }

  if (performanceData?.Orders_aggregate?.aggregate?.count) {
    const orderCount = performanceData.Orders_aggregate.aggregate.count;
    priority -= Math.min(orderCount * 0.1, 2); // More orders = lower priority (better)
  }

  // Add small random factor for fairness
  priority += Math.random() * 0.5;

  return priority;
};

// Distribute orders to shoppers
export const distributeOrders = async () => {
  try {
    console.log("🔄 Starting real-time order distribution...");

    const activeConnections = getActiveConnections();
    const locationClusters = getLocationClusters();

    if (activeConnections.size === 0) {
      console.log("ℹ️ No active shoppers connected");
      return;
    }

    // Get orders created in the last 29 minutes
    const twentyNineMinutesAgo = new Date(
      Date.now() - 29 * 60 * 1000
    ).toISOString();

    if (!hasuraClient) {
      console.log("ℹ️ Hasura client not available");
      return;
    }

    // Fetch available orders
    const [regularOrdersData, reelOrdersData, restaurantOrdersData] =
      await Promise.all([
        hasuraClient.request(GET_AVAILABLE_ORDERS, {
          current_time: twentyNineMinutesAgo,
        }) as any,
        hasuraClient.request(GET_AVAILABLE_REEL_ORDERS, {
          current_time: twentyNineMinutesAgo,
        }) as any,
        hasuraClient.request(GET_AVAILABLE_RESTAURANT_ORDERS, {
          current_time: twentyNineMinutesAgo,
        }) as any,
      ]);

    const availableOrders = regularOrdersData.Orders || [];
    const availableReelOrders = reelOrdersData.reel_orders || [];
    const availableRestaurantOrders =
      restaurantOrdersData.restaurant_orders || [];

    // Combine all orders
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
      console.log("ℹ️ No available orders for distribution");
      return;
    }

    console.log(
      `📦 Found ${allOrders.length} orders to distribute to ${activeConnections.size} shoppers`
    );

    // Process each order
    for (const order of allOrders) {
      await distributeOrderToBestShopper(order, activeConnections);
    }
  } catch (error) {
    console.error("💥 Error in order distribution:", error);
    logger.error(
      "Error in real-time order distribution",
      "DistributeOrder",
      error
    );
  }
};

// Distribute single order to best shopper using FCM
const distributeOrderToBestShopper = async (
  order: any,
  availableShoppers: any[]
) => {
  try {
    const orderLocation = {
      lat: parseFloat(order.Address?.latitude || order.address?.latitude),
      lng: parseFloat(order.Address?.longitude || order.address?.longitude),
    };

    // Find best shopper for this order
    let bestShopper = null;
    let bestPriority = Infinity;

    for (const shopper of availableShoppers) {
      if (!shopper.last_known_latitude || !shopper.last_known_longitude)
        continue;

      const shopperLocation = {
        lat: parseFloat(shopper.last_known_latitude),
        lng: parseFloat(shopper.last_known_longitude),
      };

      // Calculate priority for this shopper
      const priority = calculateShopperPriority(shopperLocation, order, null);

      if (priority < bestPriority) {
        bestPriority = priority;
        bestShopper = { userId: shopper.user_id, location: shopperLocation, priority };
      }
    }

    if (!bestShopper) {
      console.log(`⚠️ No suitable shopper found for order ${order.id}`);
      return;
    }

    // Format order for notification
    const distance = calculateDistance(
      bestShopper.location.lat,
      bestShopper.location.lng,
      orderLocation.lat,
      orderLocation.lng
    );

    // Calculate travel time in minutes (assuming 20 km/h average speed)
    const calculateTravelTime = (distanceKm: number): number => {
      const averageSpeedKmh = 20;
      const travelTimeHours = distanceKm / averageSpeedKmh;
      return Math.round(travelTimeHours * 60);
    };

    const orderForNotification = {
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
      itemsCount: order.quantity || 1,
      estimatedEarnings:
        order.orderType === "restaurant"
          ? parseFloat(order.delivery_fee || "0") // Restaurant orders: delivery only
          : parseFloat(order.service_fee || "0") +
            parseFloat(order.delivery_fee || "0"), // Regular and reel orders: service + delivery
      orderType: order.orderType,
      priority: bestPriority,
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

    // Send FCM notification
    try {
      await sendNewOrderNotification(bestShopper.userId, orderForNotification);
      console.log(
        `✅ Order ${order.id} notification sent via FCM to shopper ${
          bestShopper.userId
        } (priority: ${bestPriority.toFixed(2)})`
      );

      // Set up expiration timer
      setTimeout(async () => {
        try {
          await sendOrderExpiredNotification(
            bestShopper.userId,
            order.id,
            "timeout"
          );
          console.log(
            `⏰ Order ${order.id} expired notification sent to shopper ${bestShopper.userId}`
          );
        } catch (error) {
          console.error(
            `❌ Failed to send expiration notification for order ${order.id}:`,
            error
          );
        }
      }, 60000);
    } catch (error) {
      console.error(
        `❌ Failed to send FCM notification for order ${order.id} to shopper ${bestShopper.userId}:`,
        error
      );
    }
  } catch (error) {
    console.error(`💥 Error distributing order ${order.id}:`, error);
  }
};

// API endpoint to trigger distribution
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await distributeOrders();

    res.status(200).json({
      success: true,
      message: "Order distribution completed",
    });
  } catch (error) {
    console.error("💥 Error in distribute-order API:", error);
    res.status(500).json({
      error: "Failed to distribute orders",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
