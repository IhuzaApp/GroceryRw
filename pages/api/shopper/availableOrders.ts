import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Modify the query to ensure we're only filtering by PENDING status, with no date filtering
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

// Haversine formula to calculate distance in kilometers between two coordinates
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

// Estimate travel time in minutes based on distance
// Average car speed in city is around 30 km/h (0.5 km per minute)
function estimateTravelTimeMinutes(distanceKm: number): number {
  const avgSpeedKmPerMinute = 0.5; // 30 km/h = 0.5 km per minute
  return Math.round(distanceKm / avgSpeedKmPerMinute);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set cache control headers to prevent caching
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    console.log(
      `[availableOrders] Request received at ${new Date().toISOString()}`
    );

    // Get shopper's current location from query params
    const shopperLatitude = parseFloat(req.query.latitude as string) || 0;
    const shopperLongitude = parseFloat(req.query.longitude as string) || 0;
    // Changed from 10 to 15 minutes max travel time
    const maxTravelTime = parseInt(req.query.maxTravelTime as string) || 15;
    
    console.log(`[availableOrders] Shopper location: ${shopperLatitude}, ${shopperLongitude}`);
    console.log(`[availableOrders] Max travel time: ${maxTravelTime} minutes`);

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    console.log(`[availableOrders] Querying Hasura for all PENDING orders`);

    // Modified to get all PENDING orders without date filtering
    const data = await hasuraClient.request<{
      Orders: Array<{
        id: string;
        created_at: string;
        service_fee: string | null;
        delivery_fee: string | null;
        status: string;
        shop: {
          name: string;
          address: string;
          latitude: string;
          longitude: string;
        };
        address: {
          latitude: string;
          longitude: string;
          street: string;
          city: string;
        };
        Order_Items_aggregate: { aggregate: { count: number | null } | null };
      }>;
    }>(GET_AVAILABLE_ORDERS);

    console.log(
      `[availableOrders] Retrieved ${data.Orders.length} PENDING orders from database`
    );

    // Transform data to make it easier to use on the client
    const availableOrders = data.Orders.map((order) => {
      // Calculate metrics for sorting and filtering
      const createdAt = new Date(order.created_at);
      const pendingMinutes = Math.floor(
        (Date.now() - createdAt.getTime()) / 60000
      );

      // Added conditional checks to handle potential null values in coordinates
      const shopLatitude = order.shop?.latitude
        ? parseFloat(order.shop.latitude)
        : 0;
      const shopLongitude = order.shop?.longitude
        ? parseFloat(order.shop.longitude)
        : 0;
      const customerLatitude = order.address?.latitude
        ? parseFloat(order.address.latitude)
        : 0;
      const customerLongitude = order.address?.longitude
        ? parseFloat(order.address.longitude)
        : 0;
        
      // Calculate distance from shopper to shop in kilometers
      const distanceToShopKm = calculateDistanceKm(
        shopperLatitude,
        shopperLongitude,
        shopLatitude,
        shopLongitude
      );
      
      // Calculate distance between shop and customer in kilometers
      const shopToCustomerDistanceKm = calculateDistanceKm(
        shopLatitude,
        shopLongitude,
        customerLatitude,
        customerLongitude
      );
      
      // Calculate travel time from shopper to shop
      const travelTimeMinutes = estimateTravelTimeMinutes(distanceToShopKm);
      
      // Round distances to 1 decimal place
      const formattedDistanceToShop = Math.round(distanceToShopKm * 10) / 10;
      const formattedShopToCustomerDistance = Math.round(shopToCustomerDistanceKm * 10) / 10;

      // Calculate priority level (1-5) for UI highlighting
      // Orders over 24 hours old get highest priority as they're at risk of being cancelled
      let priorityLevel = 1; // Default - lowest priority (fresh orders)
      if (pendingMinutes >= 24 * 60) {
        priorityLevel = 5; // Critical - pending for 24+ hours
      } else if (pendingMinutes >= 4 * 60) {
        priorityLevel = 4; // High - pending for 4+ hours
      } else if (pendingMinutes >= 60) {
        priorityLevel = 3; // Medium - pending for 1+ hour
      } else if (pendingMinutes >= 30) {
        priorityLevel = 2; // Low - pending for 30+ minutes
      }

      return {
        id: order.id,
        createdAt: order.created_at,
        shopName: order.shop?.name || "Unknown Shop",
        shopAddress: order.shop?.address || "No Address",
        shopLatitude,
        shopLongitude,
        customerLatitude,
        customerLongitude,
        customerAddress: order.address
          ? `${order.address.street || ""}, ${order.address.city || ""}`
          : "No Address",
        itemsCount: order.Order_Items_aggregate?.aggregate?.count ?? 0,
        serviceFee: parseFloat(order.service_fee || "0"),
        deliveryFee: parseFloat(order.delivery_fee || "0"),
        earnings:
          parseFloat(order.service_fee || "0") +
          parseFloat(order.delivery_fee || "0"),
        pendingMinutes,
        priorityLevel,
        status: order.status,
        // Add new fields for distance and travel time
        distance: formattedDistanceToShop,
        shopToCustomerDistance: formattedShopToCustomerDistance,
        travelTimeMinutes: travelTimeMinutes
      };
    });
    
    // Filter orders by travel time - only show orders within 15 minutes travel time
    const filteredOrders = availableOrders.filter(
      order => order.travelTimeMinutes <= maxTravelTime
    );

    // Log the filtered orders
    console.log(
      `[availableOrders] Filtered to ${filteredOrders.length} orders within ${maxTravelTime} minutes travel time`
    );

    // Detailed logging of filtered orders
    filteredOrders.forEach((order, index) => {
      console.log(`[availableOrders] Filtered Order ${index + 1}:
        ID: ${order.id}
        Created: ${order.createdAt}
        Status: ${order.status}
        Shop: ${order.shopName}
        Shop Coords: ${order.shopLatitude}, ${order.shopLongitude}
        Travel time to shop: ${order.travelTimeMinutes} min
        Distance to shop: ${order.distance} km
        Customer Address: ${order.customerAddress}
        Customer Coords: ${order.customerLatitude}, ${order.customerLongitude}
        Distance shop to customer: ${order.shopToCustomerDistance} km
        Items Count: ${order.itemsCount}
      `);
    });

    // Return the processed and filtered data
    res.status(200).json(filteredOrders);
  } catch (error: any) {
    console.error("[availableOrders] Error fetching available orders:", error);
    res
      .status(500)
      .json({
        error: "Failed to fetch available orders",
        details: error.toString(),
      });
  }
}
