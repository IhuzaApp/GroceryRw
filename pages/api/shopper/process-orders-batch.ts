import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// GraphQL query to get available dashers
const GET_AVAILABLE_DASHERS = gql`
  query GetAvailableDashers($current_time: timetz!, $current_day: Int!) {
    Shopper_Availability(
      where: {
        _and: [
          { is_available: { _eq: true } }
          { day_of_week: { _eq: $current_day } }
          { start_time: { _lte: $current_time } }
          { end_time: { _gte: $current_time } }
        ]
      }
    ) {
      user_id
      last_known_latitude
      last_known_longitude
    }
  }
`;

// GraphQL query to get available orders
const GET_AVAILABLE_ORDERS = gql`
  query GetAvailableOrders($created_after: timestamptz!) {
    Orders(
      where: {
        created_at: { _gt: $created_after }
        status: { _eq: "PENDING" }
        shopper_id: { _is_null: true }
      }
    ) {
      id
      created_at
      shop_id
      service_fee
      delivery_fee
      Shops {
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
  query GetAvailableReelOrders($created_after: timestamptz!) {
    reel_orders(
      where: {
        created_at: { _gt: $created_after }
        status: { _eq: "PENDING" }
        shopper_id: { _is_null: true }
      }
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

// Group shoppers by location clusters
function groupShoppersByLocation(shoppers: any[], clusterRadiusKm: number = 2) {
  const clusters: Array<{
    center: { lat: number; lng: number };
    shoppers: any[];
    id: string;
  }> = [];

  shoppers.forEach(shopper => {
    let assignedToCluster = false;

    for (const cluster of clusters) {
      const distance = calculateDistanceKm(
        cluster.center.lat,
        cluster.center.lng,
        shopper.last_known_latitude,
        shopper.last_known_longitude
      );

      if (distance <= clusterRadiusKm) {
        cluster.shoppers.push(shopper);
        assignedToCluster = true;
        break;
      }
    }

    if (!assignedToCluster) {
      clusters.push({
        id: `cluster_${clusters.length + 1}`,
        center: {
          lat: shopper.last_known_latitude,
          lng: shopper.last_known_longitude
        },
        shoppers: [shopper]
      });
    }
  });

  return clusters;
}

// Group orders by location
function groupOrdersByLocation(orders: any[], orderType: "regular" | "reel") {
  const orderGroups: Array<{
    location: { lat: number; lng: number };
    orders: any[];
    shopName: string;
  }> = [];

  orders.forEach(order => {
    const lat = parseFloat(order.Address?.latitude || order.address?.latitude);
    const lng = parseFloat(order.Address?.longitude || order.address?.longitude);
    const shopName = order.Shops?.name || order.Reel?.title || "Unknown";

    let assignedToGroup = false;

    for (const group of orderGroups) {
      const distance = calculateDistanceKm(
        group.location.lat,
        group.location.lng,
        lat,
        lng
      );

      if (distance <= 1) { // 1km radius for order grouping
        group.orders.push(order);
        assignedToGroup = true;
        break;
      }
    }

    if (!assignedToGroup) {
      orderGroups.push({
        location: { lat, lng },
        orders: [order],
        shopName
      });
    }
  });

  return orderGroups;
}

// Find nearby orders for a cluster
function findNearbyOrdersForCluster(
  cluster: any,
  orderGroups: any[],
  maxDistanceKm: number = 10
) {
  const nearbyOrders: any[] = [];

  orderGroups.forEach(group => {
    const distance = calculateDistanceKm(
      cluster.center.lat,
      cluster.center.lng,
      group.location.lat,
      group.location.lng
    );

    if (distance <= maxDistanceKm) {
      nearbyOrders.push(...group.orders);
    }
  });

  return nearbyOrders;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get current time and day for schedule checking
    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0] + "+00:00";
    const currentDay = now.getDay() === 0 ? 7 : now.getDay();

    // Get orders created in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();

    // Fetch data in parallel
    const [dashersData, regularOrdersData, reelOrdersData] = await Promise.all([
      hasuraClient.request(GET_AVAILABLE_DASHERS, {
        current_time: currentTime,
        current_day: currentDay,
      }) as any,
      hasuraClient.request(GET_AVAILABLE_ORDERS, {
        created_after: tenMinutesAgo,
      }) as any,
      hasuraClient.request(GET_AVAILABLE_REEL_ORDERS, {
        created_after: tenMinutesAgo,
      }) as any,
    ]);

    const availableDashers = dashersData.Shopper_Availability || [];
    const availableOrders = regularOrdersData.Orders || [];
    const availableReelOrders = reelOrdersData.reel_orders || [];

    logger.info(`Processing batch: ${availableDashers.length} dashers, ${availableOrders.length} regular orders, ${availableReelOrders.length} reel orders`);

    // Group shoppers by location
    const shopperClusters = groupShoppersByLocation(availableDashers, 2); // 2km cluster radius

    // Group orders by location
    const regularOrderGroups = groupOrdersByLocation(availableOrders, "regular");
    const reelOrderGroups = groupOrdersByLocation(availableReelOrders, "reel");

    const allOrderGroups = [...regularOrderGroups, ...reelOrderGroups];

    // Process each cluster
    const clusterAssignments: Array<{
      clusterId: string;
      shopperCount: number;
      nearbyOrders: number;
      assignments: any[];
    }> = [];

    for (const cluster of shopperClusters) {
      const nearbyOrders = findNearbyOrdersForCluster(cluster, allOrderGroups, 10);

      clusterAssignments.push({
        clusterId: cluster.id,
        shopperCount: cluster.shoppers.length,
        nearbyOrders: nearbyOrders.length,
        assignments: nearbyOrders.slice(0, Math.min(cluster.shoppers.length, nearbyOrders.length))
      });

      logger.info(`Cluster ${cluster.id}: ${cluster.shoppers.length} shoppers, ${nearbyOrders.length} nearby orders`);
    }

    // Calculate efficiency metrics
    const totalShoppers = availableDashers.length;
    const totalOrders = availableOrders.length + availableReelOrders.length;
    const totalClusters = shopperClusters.length;
    const avgShoppersPerCluster = totalShoppers / totalClusters;
    const avgOrdersPerCluster = totalOrders / totalClusters;

    const efficiency = {
      totalShoppers,
      totalOrders,
      totalClusters,
      avgShoppersPerCluster: Math.round(avgShoppersPerCluster * 100) / 100,
      avgOrdersPerCluster: Math.round(avgOrdersPerCluster * 100) / 100,
      clusterUtilization: Math.round((totalOrders / totalShoppers) * 100) / 100
    };

    logger.info("Batch processing completed", efficiency);

    return res.status(200).json({
      success: true,
      message: `Processed ${totalShoppers} shoppers and ${totalOrders} orders across ${totalClusters} clusters`,
      data: {
        clusters: clusterAssignments,
        efficiency,
        summary: {
          regularOrders: availableOrders.length,
          reelOrders: availableReelOrders.length,
          totalOrders,
          totalShoppers,
          totalClusters
        }
      }
    });

  } catch (error) {
    logger.error("Error in batch processing:", error);
    return res.status(500).json({
      error: "Failed to process batch",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
