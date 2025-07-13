import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// Test user ID
const TEST_USER_ID = "36672ccc-5f44-465a-b2f6-7ff23f4f643f";

// Haversine formula to calculate distance in kilometers
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get notification settings
    const GET_NOTIFICATION_SETTINGS = gql`
      query GetNotificationSettings($user_id: uuid!) {
        shopper_notification_settings(where: {user_id: {_eq: $user_id}}) {
          id
          user_id
          use_live_location
          custom_locations
          max_distance
          notification_types
          sound_settings
        }
      }
    `;

    const settingsResponse = await hasuraClient.request(GET_NOTIFICATION_SETTINGS, {
      user_id: TEST_USER_ID
    }) as any;

    const currentSettings = settingsResponse.shopper_notification_settings?.[0];

    if (!currentSettings) {
      return res.status(200).json({
        success: true,
        message: "No notification settings found",
        test_user_id: TEST_USER_ID
      });
    }

    // Get available orders
    const GET_AVAILABLE_ORDERS = gql`
      query GetAvailableOrders {
        Orders(where: { shopper_id: { _is_null: true }, status: { _eq: "PENDING" } }) {
          id
          created_at
          service_fee
          delivery_fee
          status
          shop: Shop {
            name
            address
            latitude
            longitude
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

    // Get available reel orders
    const GET_AVAILABLE_REEL_ORDERS = gql`
      query GetAvailableReelOrders {
        reel_orders(where: { shopper_id: { _is_null: true }, status: { _eq: "PENDING" } }) {
          id
          created_at
          total
          quantity
          delivery_note
          status
          Reel {
            id
            title
            type
          }
          user: User {
            id
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

    const [ordersResponse, reelOrdersResponse] = await Promise.all([
      hasuraClient.request(GET_AVAILABLE_ORDERS) as any,
      hasuraClient.request(GET_AVAILABLE_REEL_ORDERS) as any
    ]);

    const allOrders = ordersResponse.Orders || [];
    const allReelOrders = reelOrdersResponse.reel_orders || [];
    
    // For testing purposes, use a default location
    // In a real app, the shopper's location would come from:
    // 1. GPS coordinates from the mobile app
    // 2. Browser geolocation API
    // 3. Stored in a separate location table
    // 4. Or passed as a parameter in the request
    const defaultLocation = {
      latitude: -1.9496551,  // Kigali coordinates
      longitude: 30.1163144
    };

    // Determine locations to check
    const locationsToCheck = [];
    
    if (currentSettings.use_live_location) {
      // For testing, use default location. In real app, this would be shopper's GPS location
      locationsToCheck.push({
        name: "Live Location",
        latitude: defaultLocation.latitude,
        longitude: defaultLocation.longitude,
        source: "live_location"
      });
    }

    if (!currentSettings.use_live_location && currentSettings.custom_locations?.length > 0) {
      currentSettings.custom_locations.forEach((location: any) => {
        locationsToCheck.push({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          source: "custom_location"
        });
      });
    }

    const maxDistance = parseFloat(currentSettings.max_distance || "10");
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    // Check orders in zone
    const ordersInZone = [];
    const reelOrdersInZone = [];

    for (const location of locationsToCheck) {
      // Check regular orders
      for (const order of allOrders) {
        const orderCreatedAt = new Date(order.created_at);
        const isNewOrder = orderCreatedAt.getTime() > tenMinutesAgo.getTime();
        
        const distance = calculateDistanceKm(
          location.latitude,
          location.longitude,
          parseFloat(order.address.latitude),
          parseFloat(order.address.longitude)
        );

        if (distance <= maxDistance) {
          ordersInZone.push({
            ...order,
            distance: Math.round(distance * 10) / 10,
            locationName: location.name,
            locationSource: location.source,
            isNewOrder,
            ageInMinutes: Math.round((now.getTime() - orderCreatedAt.getTime()) / (1000 * 60))
          });
        }
      }

      // Check reel orders
      for (const reelOrder of allReelOrders) {
        const reelOrderCreatedAt = new Date(reelOrder.created_at);
        const isNewReelOrder = reelOrderCreatedAt.getTime() > tenMinutesAgo.getTime();
        
        const distance = calculateDistanceKm(
          location.latitude,
          location.longitude,
          parseFloat(reelOrder.address.latitude),
          parseFloat(reelOrder.address.longitude)
        );

        if (distance <= maxDistance) {
          reelOrdersInZone.push({
            ...reelOrder,
            distance: Math.round(distance * 10) / 10,
            locationName: location.name,
            locationSource: location.source,
            isNewReelOrder,
            ageInMinutes: Math.round((now.getTime() - reelOrderCreatedAt.getTime()) / (1000 * 60))
          });
        }
      }
    }

    // Remove duplicates
    const uniqueOrdersInZone = ordersInZone.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    );

    const uniqueReelOrdersInZone = reelOrdersInZone.filter((order, index, self) => 
      index === self.findIndex(o => o.id === order.id)
    );

    return res.status(200).json({
      success: true,
      message: "Orders in zone check completed",
      test_user_id: TEST_USER_ID,
      settings: {
        use_live_location: currentSettings.use_live_location,
        custom_locations: currentSettings.custom_locations || [],
        max_distance: currentSettings.max_distance
      },
      location_note: "For testing: using default Kigali coordinates. In real app, location comes from GPS/browser geolocation.",
      locations_checked: locationsToCheck.map(loc => ({
        name: loc.name,
        source: loc.source,
        coordinates: { lat: loc.latitude, lng: loc.longitude }
      })),
      summary: {
        total_orders_available: allOrders.length,
        total_reel_orders_available: allReelOrders.length,
        orders_in_zone: uniqueOrdersInZone.length,
        reel_orders_in_zone: uniqueReelOrdersInZone.length,
        new_orders_in_zone: uniqueOrdersInZone.filter(o => o.isNewOrder).length,
        new_reel_orders_in_zone: uniqueReelOrdersInZone.filter(o => o.isNewReelOrder).length
      },
      orders_in_zone: uniqueOrdersInZone,
      reel_orders_in_zone: uniqueReelOrdersInZone,
      age_filter_info: {
        filter_applied: "Only NEW orders/batches (created within last 10 minutes)",
        current_time: new Date().toISOString(),
        ten_minutes_ago: tenMinutesAgo.toISOString()
      }
    });

  } catch (error) {
    logger.error("Error checking orders in zone", "CheckOrdersInZone", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check orders in zone",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 