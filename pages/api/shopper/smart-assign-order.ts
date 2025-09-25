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
    lng: parseFloat(order.Address?.longitude || order.address?.longitude)
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
  const completionRate = orderCount > 0 ? Math.min(100, (orderCount / 10) * 100) : 0; // Simplified completion rate

  // Priority score calculation (lower is better)
  const priorityScore = 
    (distance * 0.4) +                    // Distance weight (40%)
    ((5 - avgRating) * 2) +               // Rating weight (inverted, 20%)
    ((100 - completionRate) * 0.01) +     // Completion rate weight (10%)
    (Math.random() * 0.5);                // Small random factor (10%) for fairness

  return priorityScore;
}

// Note: Atomic assignment removed - shoppers must accept orders explicitly

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

          try {

    const { current_location, user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({
        error: "User ID is required"
      });
    }

    if (!current_location || !current_location.lat || !current_location.lng) {
      return res.status(400).json({
        error: "Current location is required"
      });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get orders created in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // Fetch both regular and reel orders in parallel
    const [regularOrdersData, reelOrdersData, performanceData] = await Promise.all([
      hasuraClient.request(GET_AVAILABLE_ORDERS, {
        current_time: tenMinutesAgo,
      }) as any,
      hasuraClient.request(GET_AVAILABLE_REEL_ORDERS, {
        current_time: tenMinutesAgo,
      }) as any,
      hasuraClient.request(GET_SHOPPER_PERFORMANCE, {
        shopper_id: user_id,
      }) as any,
    ]);

    const availableOrders = regularOrdersData.Orders || [];
    const availableReelOrders = reelOrdersData.reel_orders || [];

    // Combine all orders with type information
    const allOrders = [
      ...availableOrders.map((order: any) => ({ ...order, orderType: "regular" })),
      ...availableReelOrders.map((order: any) => ({ ...order, orderType: "reel" }))
    ];

    if (allOrders.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No available orders at the moment",
        orders: []
      });
    }

    // Calculate priority for each order
    const ordersWithPriority = allOrders.map(order => ({
      ...order,
      priority: calculateShopperPriority(current_location, order, performanceData)
    }));

    // Sort by priority (lowest first)
    ordersWithPriority.sort((a, b) => a.priority - b.priority);

    // Get the best order for the shopper to see (don't assign yet)
    const bestOrder = ordersWithPriority[0];

    // Format order for notification (don't assign yet)
    const orderForNotification = {
      id: bestOrder.id,
      shopName: bestOrder.Shop?.name || bestOrder.Reel?.title || "Unknown Shop",
      distance: calculateDistanceKm(
        current_location.lat,
        current_location.lng,
        parseFloat(bestOrder.Address?.latitude || bestOrder.address?.latitude),
        parseFloat(bestOrder.Address?.longitude || bestOrder.address?.longitude)
      ),
      createdAt: bestOrder.created_at,
      customerAddress: `${bestOrder.Address?.street || bestOrder.address?.street}, ${bestOrder.Address?.city || bestOrder.address?.city}`,
      itemsCount: bestOrder.quantity || 1,
      estimatedEarnings: parseFloat(bestOrder.service_fee || "0") + parseFloat(bestOrder.delivery_fee || "0"),
      orderType: bestOrder.orderType,
      priority: bestOrder.priority
    };

    return res.status(200).json({
      success: true,
      order: orderForNotification,
      message: "Order found - shopper can accept or skip"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Failed to find order",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
