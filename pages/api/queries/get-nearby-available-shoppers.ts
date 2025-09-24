import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { logger } from "../../../src/utils/logger";

const GET_NEARBY_AVAILABLE_SHOPPERS = gql`
  query GetNearbyAvailableShoppers($orderId: uuid!, $maxDistance: float) {
    # Get order details to find shop location
    orders(where: { id: { _eq: $orderId } }) {
      id
      shop_id
      shop {
        id
        name
        latitude
        longitude
      }
    }
    
    # Get all active shoppers with their FCM tokens and locations
    active_shoppers: users(
      where: {
        _and: [
          { role: { _eq: "shopper" } }
          { is_active: { _eq: true } }
          { fcm_tokens: { is_active: { _eq: true } } }
        ]
      }
    ) {
      id
      name
      email
      latitude
      longitude
      fcm_tokens(where: { is_active: { _eq: true } }) {
        id
        token
        platform
        is_active
      }
      # Check if shopper is currently available (has location cookies or recent activity)
      last_seen
    }
  }
`;

interface NearbyShoppersResponse {
  orders: Array<{
    id: string;
    shop_id: string;
    shop: {
      id: string;
      name: string;
      latitude: number;
      longitude: number;
    };
  }>;
  active_shoppers: Array<{
    id: string;
    name: string;
    email: string;
    latitude: number | null;
    longitude: number | null;
    last_seen: string | null;
    fcm_tokens: Array<{
      id: string;
      token: string;
      platform: string;
      is_active: boolean;
    }>;
  }>;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, maxDistance = 10, excludeShopperId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "Missing required field: orderId",
      });
    }

    logger.info(
      "Getting nearby available shoppers",
      "GetNearbyShoppersAPI",
      { orderId, maxDistance, excludeShopperId }
    );

    if (!hasuraClient) {
      logger.error("Hasura client not initialized", "GetNearbyShoppersAPI");
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<NearbyShoppersResponse>(
      GET_NEARBY_AVAILABLE_SHOPPERS,
      { orderId, maxDistance }
    );

    if (!data.orders || data.orders.length === 0) {
      logger.warn("Order not found", "GetNearbyShoppersAPI", { orderId });
      return res.status(404).json({
        error: "Order not found",
      });
    }

    const order = data.orders[0];
    const shopLocation = order.shop;

    if (!shopLocation.latitude || !shopLocation.longitude) {
      logger.warn("Shop location not available", "GetNearbyShoppersAPI", { 
        orderId, 
        shopId: shopLocation.id 
      });
      return res.status(400).json({
        error: "Shop location not available",
      });
    }

    // Filter shoppers by distance and availability
    const nearbyShoppers = data.active_shoppers
      .filter(shopper => {
        // Exclude specific shopper if provided
        if (excludeShopperId && shopper.id === excludeShopperId) {
          return false;
        }

        // Must have FCM tokens
        if (!shopper.fcm_tokens || shopper.fcm_tokens.length === 0) {
          return false;
        }

        // Must have location data
        if (!shopper.latitude || !shopper.longitude) {
          return false;
        }

        // Calculate distance from shop
        const distance = calculateDistance(
          shopLocation.latitude,
          shopLocation.longitude,
          shopper.latitude,
          shopper.longitude
        );

        // Check if within max distance
        if (distance > maxDistance) {
          return false;
        }

        // Check if shopper was recently active (within last 30 minutes)
        if (shopper.last_seen) {
          const lastSeenTime = new Date(shopper.last_seen).getTime();
          const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
          if (lastSeenTime < thirtyMinutesAgo) {
            return false;
          }
        }

        return true;
      })
      .map(shopper => ({
        id: shopper.id,
        name: shopper.name,
        email: shopper.email,
        latitude: shopper.latitude,
        longitude: shopper.longitude,
        distance: calculateDistance(
          shopLocation.latitude,
          shopLocation.longitude,
          shopper.latitude!,
          shopper.longitude!
        ),
        fcm_tokens: shopper.fcm_tokens,
      }))
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    logger.info(
      `Found ${nearbyShoppers.length} nearby available shoppers`,
      "GetNearbyShoppersAPI",
      {
        orderId,
        shopLocation: { lat: shopLocation.latitude, lng: shopLocation.longitude },
        maxDistance,
        nearbyShoppers: nearbyShoppers.map(s => ({ 
          id: s.id, 
          distance: s.distance.toFixed(2) 
        }))
      }
    );

    return res.status(200).json({
      success: true,
      shoppers: nearbyShoppers,
      shopLocation,
      maxDistance,
    });

  } catch (error) {
    logger.error(
      "Error getting nearby available shoppers",
      "GetNearbyShoppersAPI",
      error instanceof Error ? error.message : "Unknown error"
    );
    return res.status(500).json({
      error: "Failed to get nearby available shoppers",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
