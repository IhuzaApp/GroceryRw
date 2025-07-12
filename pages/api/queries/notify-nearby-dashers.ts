import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { Client as GoogleMapsClient } from "@googlemaps/google-maps-services-js";

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
  query GetAvailableDashers {
    Shopper_Availability(where: { is_available: { _eq: true } }) {
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

    // Get batches created in the last 20 minutes
    const twentyMinutesAgo = new Date(
      Date.now() - 20 * 60 * 1000
    ).toISOString();

    // Fetch both regular orders and reel orders in parallel
    const [regularBatchesData, reelBatchesData] = await Promise.all([
      hasuraClient.request<{
        Orders: Batch[];
      }>(GET_AVAILABLE_BATCHES, {
        created_after: twentyMinutesAgo,
      }),
      hasuraClient.request<{
        reel_orders: ReelBatch[];
      }>(GET_AVAILABLE_REEL_BATCHES, {
        created_after: twentyMinutesAgo,
      })
    ]);

    const availableBatches = regularBatchesData.Orders;
    const availableReelBatches = reelBatchesData.reel_orders;

    const { Shopper_Availability: availableDashers } =
      await hasuraClient.request<{ Shopper_Availability: Dasher[] }>(
        GET_AVAILABLE_DASHERS
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

    // For each dasher, find nearby shops with available batches
    const notificationObjects: Array<{
      user_id: string;
      message: string;
      type: string;
      is_read: boolean;
    }> = [];

    await Promise.all(
      availableDashers.map(async (dasher) => {
        const nearbyBatches: Batch[] = [];
        const nearbyReelBatches: ReelBatch[] = [];

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

          // If shop is within 10 minutes, add its batches to nearbyBatches
          if (distanceInMinutes <= 10) {
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

          // If reel creator is within 10 minutes, add its batches to nearbyReelBatches
          if (distanceInMinutes <= 10) {
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
