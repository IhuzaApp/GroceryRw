import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { Client as GoogleMapsClient } from "@googlemaps/google-maps-services-js";
import { logger } from "../../../src/utils/logger";

const googleMapsClient = new GoogleMapsClient({});

const GET_AVAILABLE_BATCHES = gql`
  query GetAvailableBatches($created_after: timestamptz!) {
    Orders(
      where: { created_at: { _gt: $created_after }, status: { _eq: "PENDING" } }
    ) {
      id
      shop_id
      delivery_address
      created_at
      Shops {
        id
        name
        address
        latitude
        longitude
      }
    }
  }
`;

// Add query for available reel orders
const GET_AVAILABLE_REEL_BATCHES = gql`
  query GetAvailableReelBatches($created_after: timestamptz!) {
    reel_orders(
      where: { created_at: { _gt: $created_after }, status: { _eq: "PENDING" } }
    ) {
      id
      created_at
      Reel {
        id
        title
        type
        user_id
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

const GET_AVAILABLE_DASHERS = gql`
  query GetAvailableDashers($current_time: time!, $current_day: Int!) {
    Shopper_Availability(
      where: {
        _and: [
          { is_available: { _eq: true } }
          { status: { _eq: "ACTIVE" } }
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

const INSERT_NOTIFICATIONS = gql`
  mutation InsertNotifications($objects: [Notifications_insert_input!]!) {
    insert_Notifications(objects: $objects) {
      affected_rows
      returning {
        id
        user_id
        message
        type
      }
    }
  }
`;

interface Batch {
  id: string;
  shop_id: string;
  delivery_address: string;
  created_at: string;
  Shops: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface ReelBatch {
  id: string;
  created_at: string;
  Reel: {
    id: string;
    title: string;
    type: string;
    user_id: string;
  };
  user: {
    id: string;
    name: string;
  };
  address: {
    latitude: number;
    longitude: number;
    street: string;
    city: string;
  };
}

interface Dasher {
  user_id: string;
  last_known_latitude: number;
  last_known_longitude: number;
}

async function calculateDistance(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): Promise<number> {
  try {
    const response = await googleMapsClient.distancematrix({
      params: {
        origins: [origin],
        destinations: [destination],
        key: process.env.GOOGLE_MAPS_API_KEY!,
      },
    });

    return response.data.rows[0].elements[0].duration.value / 60; // Convert seconds to minutes
  } catch (error) {
    console.error("Error calculating distance:", error);
    return Infinity;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get batches created in the last 10 minutes (NEW orders only)
    const tenMinutesAgo = new Date(
      Date.now() - 10 * 60 * 1000
    ).toISOString();

    // Fetch both regular orders and reel orders in parallel
    const [regularBatchesData, reelBatchesData] = await Promise.all([
      hasuraClient.request<{
        Orders: Batch[];
      }>(GET_AVAILABLE_BATCHES, {
        created_after: tenMinutesAgo,
      }),
      hasuraClient.request<{
        reel_orders: ReelBatch[];
      }>(GET_AVAILABLE_REEL_BATCHES, {
        created_after: tenMinutesAgo,
      })
    ]);

    const availableBatches = regularBatchesData.Orders;
    const availableReelBatches = reelBatchesData.reel_orders;

    // Get current time and day for schedule checking
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS format
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Sunday = 7

    const { Shopper_Availability: availableDashers } =
      await hasuraClient.request<{ Shopper_Availability: Dasher[] }>(
        GET_AVAILABLE_DASHERS,
        {
          current_time: currentTime,
          current_day: currentDay,
        }
      );

    // Group regular batches by shop
    const batchesByShop = availableBatches.reduce((acc, batch) => {
      if (!acc[batch.shop_id]) {
        acc[batch.shop_id] = [];
      }
      acc[batch.shop_id].push(batch);
      return acc;
    }, {} as Record<string, Batch[]>);

    // Group reel batches by creator location (using customer address as pickup point)
    const reelBatchesByLocation = availableReelBatches.reduce((acc, batch) => {
      const locationKey = `${batch.address.latitude.toFixed(4)},${batch.address.longitude.toFixed(4)}`;
      if (!acc[locationKey]) {
        acc[locationKey] = [];
      }
      acc[locationKey].push(batch);
      return acc;
    }, {} as Record<string, ReelBatch[]>);

    // Get notification settings for all dashers
    const GET_NOTIFICATION_SETTINGS = gql`
      query GetNotificationSettings($user_ids: [uuid!]!) {
        shopper_notification_settings(where: {user_id: {_in: $user_ids}}) {
          user_id
          notification_types
          sound_settings
          max_distance
        }
      }
    `;

    const dasherIds = availableDashers.map(d => d.user_id);
    const settingsResponse = await hasuraClient.request(GET_NOTIFICATION_SETTINGS, {
      user_ids: dasherIds,
    }) as any;

    const settingsByUser = settingsResponse.shopper_notification_settings.reduce((acc: any, setting: any) => {
      acc[setting.user_id] = setting;
      return acc;
    }, {});

    // For each dasher, find nearby shops with available batches
    const notificationObjects: Array<{
      user_id: string;
      message: string;
      type: string;
      is_read: boolean;
    }> = [];

    await Promise.all(
      availableDashers.map(async (dasher) => {
        // Get dasher's notification settings
        const dasherSettings = settingsByUser[dasher.user_id] || {
          notification_types: { orders: true, batches: true, earnings: true, system: true },
          sound_settings: { enabled: true, volume: 0.8 },
          max_distance: "10"
        };

        // Check if notifications are enabled for this dasher
        if (!dasherSettings.notification_types.orders && !dasherSettings.notification_types.batches) {
          logger.info(`Skipping notifications for dasher ${dasher.user_id} - notifications disabled`, "NotifyNearbyDashers");
          return;
        }
        const nearbyBatches: Batch[] = [];
        const nearbyReelBatches: ReelBatch[] = [];

        // Get dasher's max distance from settings
        const maxDistanceKm = parseFloat(dasherSettings.max_distance || "10");
        const maxDistanceMinutes = maxDistanceKm * 2; // Rough conversion: 1km ≈ 2 minutes

        // Check each shop's distance from the dasher for regular orders
        for (const shopBatches of Object.values(batchesByShop)) {
          const shop = shopBatches[0].Shops;
          const distanceInMinutes = await calculateDistance(
            {
              lat: dasher.last_known_latitude,
              lng: dasher.last_known_longitude,
            },
            { lat: shop.latitude, lng: shop.longitude }
          );

          // If shop is within dasher's max distance, add its batches to nearbyBatches
          if (distanceInMinutes <= maxDistanceMinutes) {
            nearbyBatches.push(...shopBatches);
          }
        }

        // Check each reel creator's location for reel orders
        for (const reelBatches of Object.values(reelBatchesByLocation)) {
          const firstBatch = reelBatches[0];
          const distanceInMinutes = await calculateDistance(
            {
              lat: dasher.last_known_latitude,
              lng: dasher.last_known_longitude,
            },
            { lat: firstBatch.address.latitude, lng: firstBatch.address.longitude }
          );

          // If reel creator is within dasher's max distance, add its batches to nearbyReelBatches
          if (distanceInMinutes <= maxDistanceMinutes) {
            nearbyReelBatches.push(...reelBatches);
          }
        }

        // Create notification message combining both types of orders
        let notificationMessage = "";
        let hasRegularBatches = nearbyBatches.length > 0;
        let hasReelBatches = nearbyReelBatches.length > 0;

        if (hasRegularBatches && hasReelBatches) {
          // Both types of orders available
          const uniqueShops = Array.from(
            new Set(nearbyBatches.map((batch) => batch.Shops.name))
          );
          const uniqueReelCreators = Array.from(
            new Set(nearbyReelBatches.map((batch) => batch.user.name))
          );
          notificationMessage = `${nearbyBatches.length} regular batch(es) at ${uniqueShops.join(", ")} and ${nearbyReelBatches.length} reel order(s) from ${uniqueReelCreators.join(", ")}`;
        } else if (hasRegularBatches) {
          // Only regular orders
          const uniqueShops = Array.from(
            new Set(nearbyBatches.map((batch) => batch.Shops.name))
          );
          notificationMessage = `${nearbyBatches.length} new batch(es) available at ${uniqueShops.join(", ")}`;
        } else if (hasReelBatches) {
          // Only reel orders
          const uniqueReelCreators = Array.from(
            new Set(nearbyReelBatches.map((batch) => batch.user.name))
          );
          notificationMessage = `${nearbyReelBatches.length} new reel order(s) available from ${uniqueReelCreators.join(", ")}`;
        }

        // If there are any nearby batches (regular or reel), create a notification object
        if (notificationMessage) {
          notificationObjects.push({
            user_id: dasher.user_id,
            message: notificationMessage,
            type: "NEW_BATCHES",
            is_read: false,
          });
        }
      })
    );

    // Insert all notifications at once
    if (notificationObjects.length > 0) {
      await hasuraClient.request(INSERT_NOTIFICATIONS, {
        objects: notificationObjects,
      });
    }

    res.status(200).json({
      success: true,
      message: `Notifications created for ${notificationObjects.length} dashers`,
      regularBatchesCount: availableBatches.length,
      reelBatchesCount: availableReelBatches.length,
    });
  } catch (error) {
    console.error("Error processing batch notifications:", error);
    res.status(500).json({ error: "Failed to process batch notifications" });
  }
}
