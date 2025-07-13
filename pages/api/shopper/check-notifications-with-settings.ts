import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// Query to get shopper notification settings
const GET_SHOPPER_NOTIFICATION_SETTINGS = gql`
  query GetShopperNotificationSettings($user_id: uuid!) {
    shopper_notification_settings(where: {user_id: {_eq: $user_id}}) {
      id
      user_id
      use_live_location
      custom_locations
      max_distance
      notification_types
      created_at
      updated_at
    }
  }
`;

// Query to get available orders
const GET_AVAILABLE_ORDERS = gql`
  query GetAvailableOrders {
    Orders(
      where: { shopper_id: { _is_null: true }, status: { _eq: "PENDING" } }
      order_by: { created_at: desc }
    ) {
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
      Order_Items_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

// Query to get available reel orders
const GET_AVAILABLE_REEL_ORDERS = gql`
  query GetAvailableReelOrders {
    reel_orders(
      where: { shopper_id: { _is_null: true }, status: { _eq: "PENDING" } }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      service_fee
      delivery_fee
      total
      quantity
      delivery_note
      status
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
        user_id
      }
      user: User {
        id
        name
        phone
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

interface NotificationSettings {
  use_live_location: boolean;
  custom_locations: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address: string;
  }>;
  max_distance: string;
  notification_types: {
    orders: boolean;
    batches: boolean;
    earnings: boolean;
    system: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { user_id, current_location } = req.body;

    if (!user_id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get shopper notification settings
    const settingsResponse = await hasuraClient.request(GET_SHOPPER_NOTIFICATION_SETTINGS, {
      user_id
    }) as any;

    const settings: NotificationSettings = settingsResponse.shopper_notification_settings?.[0] || {
      use_live_location: true,
      custom_locations: [],
      max_distance: "10",
      notification_types: {
        orders: true,
        batches: true,
        earnings: true,
        system: true,
      },
    };

    // Check if notifications are enabled for orders/batches
    if (!settings.notification_types.orders && !settings.notification_types.batches) {
      return res.status(200).json({
        success: true,
        notifications: [],
        message: "Notifications disabled for orders and batches"
      });
    }

    // Determine locations to check
    const locationsToCheck = [];
    
    if (settings.use_live_location && current_location) {
      locationsToCheck.push({
        name: "Live Location",
        latitude: current_location.lat,
        longitude: current_location.lng
      });
    }

    if (!settings.use_live_location && settings.custom_locations.length > 0) {
      settings.custom_locations.forEach(location => {
        locationsToCheck.push({
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude
        });
      });
    }

    if (locationsToCheck.length === 0) {
      return res.status(200).json({
        success: true,
        notifications: [],
        message: "No locations configured for notifications"
      });
    }

    // Get available orders
    const [regularOrdersData, reelOrdersData] = await Promise.all([
      hasuraClient.request(GET_AVAILABLE_ORDERS) as any,
      hasuraClient.request(GET_AVAILABLE_REEL_ORDERS) as any
    ]);

    const maxDistance = parseFloat(settings.max_distance);
    const notifications = [];

    // Process regular orders
    if (settings.notification_types.orders && regularOrdersData.Orders) {
      for (const order of regularOrdersData.Orders) {
        for (const location of locationsToCheck) {
          const distance = calculateDistanceKm(
            location.latitude,
            location.longitude,
            parseFloat(order.address.latitude),
            parseFloat(order.address.longitude)
          );

          if (distance <= maxDistance) {
            notifications.push({
              id: order.id,
              type: "order",
              shopName: order.shop.name,
              distance: Math.round(distance * 10) / 10,
              createdAt: order.created_at,
              customerAddress: `${order.address.street}, ${order.address.city}`,
              locationName: location.name,
              serviceFee: order.service_fee,
              deliveryFee: order.delivery_fee,
              itemCount: order.Order_Items_aggregate?.aggregate?.count || 0
            });
            break; // Only add once per order
          }
        }
      }
    }

    // Process reel orders (batches)
    if (settings.notification_types.batches && reelOrdersData.reel_orders) {
      for (const reelOrder of reelOrdersData.reel_orders) {
        for (const location of locationsToCheck) {
          const distance = calculateDistanceKm(
            location.latitude,
            location.longitude,
            parseFloat(reelOrder.address.latitude),
            parseFloat(reelOrder.address.longitude)
          );

          if (distance <= maxDistance) {
            notifications.push({
              id: reelOrder.id,
              type: "batch",
              shopName: reelOrder.Reel.title,
              distance: Math.round(distance * 10) / 10,
              createdAt: reelOrder.created_at,
              customerAddress: `${reelOrder.address.street}, ${reelOrder.address.city}`,
              locationName: location.name,
              total: reelOrder.total,
              quantity: reelOrder.quantity,
              deliveryNote: reelOrder.delivery_note,
              reelType: reelOrder.Reel.type
            });
            break; // Only add once per reel order
          }
        }
      }
    }

    // Sort notifications by creation time (oldest first)
    notifications.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    logger.info("Notification check completed", "CheckNotificationsWithSettings", {
      user_id,
      settings_used: {
        use_live_location: settings.use_live_location,
        custom_locations_count: settings.custom_locations.length,
        max_distance: settings.max_distance,
        notification_types: settings.notification_types
      },
      locations_checked: locationsToCheck.length,
      notifications_found: notifications.length
    });

    return res.status(200).json({
      success: true,
      notifications,
      settings: {
        use_live_location: settings.use_live_location,
        max_distance: settings.max_distance,
        notification_types: settings.notification_types
      }
    });

  } catch (error) {
    logger.error("Error checking notifications with settings", "CheckNotificationsWithSettings", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check notifications"
    });
  }
} 