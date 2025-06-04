import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';

const googleMapsClient = new GoogleMapsClient({});

const GET_AVAILABLE_BATCHES = gql`
  query GetAvailableBatches($created_after: timestamptz!) {
    Orders(
      where: {
        created_at: { _gt: $created_after },
        status: { _eq: "PENDING" }
      }
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

const GET_AVAILABLE_DASHERS = gql`
  query GetAvailableDashers {
    Shopper_Availability(
      where: { 
        is_available: { _eq: true }
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
    console.error('Error calculating distance:', error);
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
    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const { Orders: availableBatches } = await hasuraClient.request<{ Orders: Batch[] }>(
      GET_AVAILABLE_BATCHES,
      {
        created_after: twentyMinutesAgo,
      }
    );

    const { Shopper_Availability: availableDashers } = await hasuraClient.request<{ Shopper_Availability: Dasher[] }>(
      GET_AVAILABLE_DASHERS
    );

    // Group batches by shop
    const batchesByShop = availableBatches.reduce((acc, batch) => {
      if (!acc[batch.shop_id]) {
        acc[batch.shop_id] = [];
      }
      acc[batch.shop_id].push(batch);
      return acc;
    }, {} as Record<string, Batch[]>);

    // For each dasher, find nearby shops with available batches
    const notificationObjects: Array<{
      user_id: string;
      message: string;
      type: string;
      is_read: boolean;
    }> = [];

    await Promise.all(availableDashers.map(async (dasher) => {
      const nearbyBatches: Batch[] = [];

      // Check each shop's distance from the dasher
      for (const shopBatches of Object.values(batchesByShop)) {
        const shop = shopBatches[0].Shops;
        const distanceInMinutes = await calculateDistance(
          { lat: dasher.last_known_latitude, lng: dasher.last_known_longitude },
          { lat: shop.latitude, lng: shop.longitude }
        );

        // If shop is within 10 minutes, add its batches to nearbyBatches
        if (distanceInMinutes <= 10) {
          nearbyBatches.push(...shopBatches);
        }
      }

      // If there are nearby batches, create a notification object
      if (nearbyBatches.length > 0) {
        const uniqueShops = Array.from(new Set(nearbyBatches.map(batch => batch.Shops.name)));
        const notificationMessage = `${nearbyBatches.length} new batch(es) available at ${uniqueShops.join(', ')}`;
        
        notificationObjects.push({
          user_id: dasher.user_id,
          message: notificationMessage,
          type: 'NEW_BATCHES',
          is_read: false
        });
      }
    }));

    // Insert all notifications at once
    if (notificationObjects.length > 0) {
      await hasuraClient.request(
        INSERT_NOTIFICATIONS,
        {
          objects: notificationObjects
        }
      );
    }

    res.status(200).json({ 
      success: true,
      message: `Notifications created for ${notificationObjects.length} dashers`
    });
  } catch (error) {
    console.error("Error processing batch notifications:", error);
    res.status(500).json({ error: "Failed to process batch notifications" });
  }
} 