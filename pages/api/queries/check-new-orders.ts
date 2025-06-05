import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { Client as GoogleMapsClient } from '@googlemaps/google-maps-services-js';
import { startOrderNotifications, stopOrderNotifications } from '../../../src/utils/orderNotifier';
import { serverLogger } from '../../../src/utils/serverLogger';

const googleMapsClient = new GoogleMapsClient({});

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
function estimateTravelTimeMinutes(distanceKm: number): number {
  const avgSpeedKmPerMinute = 0.5; // 30 km/h = 0.5 km per minute
  return Math.round(distanceKm / avgSpeedKmPerMinute);
}

const GET_NEW_ORDERS = gql`
  query GetNewOrders($created_after: timestamptz!) {
    Orders(
      where: {
        created_at: { _gt: $created_after },
        status: { _eq: "PENDING" },
        shopper_id: { _is_null: true }
      }
    ) {
      id
      shop_id
      total
      created_at
      Address {
        street
        city
        postal_code
        latitude
        longitude
      }
      Shop {
        id
        name
        address
        latitude
        longitude
      }
      Order_Items_aggregate {
        aggregate {
          count
          sum {
            quantity
          }
        }
      }
    }
  }
`;

const GET_ACTIVE_SHOPPERS = gql`
  query GetActiveShoppers($current_time: time!, $current_day: Int!) {
    Shopper_Availability(
      where: {
        _and: [
          { is_available: { _eq: true } },
          { status: { _eq: "ACTIVE" } },
          { day_of_week: { _eq: $current_day } },
          { start_time: { _lte: $current_time } },
          { end_time: { _gte: $current_time } }
        ]
      }
    ) {
      user_id
      default_latitude
      default_longitude
      current_latitude
      current_longitude
      preferred_radius_km
    }
  }
`;

interface Order {
  id: string;
  shop_id: string;
  total: string;
  created_at: string;
  Address: {
    street: string;
    city: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
  Shop: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  Order_Items_aggregate?: {
    aggregate?: {
      count?: number;
      sum?: {
        quantity?: number;
      };
    };
  };
  distance?: number;
  travelTimeMinutes?: number;
}

interface Shopper {
  user_id: string;
  default_latitude: number;
  default_longitude: number;
  current_latitude: number | null;
  current_longitude: number | null;
  preferred_radius_km: number;
}

let lastCheckTime: Date | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get shopper's location from query params
    const shopperLatitude = parseFloat(req.query.latitude as string) || 0;
    const shopperLongitude = parseFloat(req.query.longitude as string) || 0;
    const maxTravelTime = parseInt(req.query.maxTravelTime as string) || 15;

    serverLogger.info('Checking for new orders', 'OrderChecker', {
      shopperLatitude,
      shopperLongitude,
      maxTravelTime
    });

    // If this is not the first check, ensure at least 3 minutes have passed
    if (lastCheckTime) {
      const timeSinceLastCheck = Date.now() - lastCheckTime.getTime();
      if (timeSinceLastCheck < 180000) { // 3 minutes in milliseconds
        serverLogger.info('Skipping check - too soon', 'OrderChecker', {
          timeSinceLastCheck,
          lastCheckTime
        });
        return res.status(200).json({
          success: true,
          message: "Skipping check - less than 3 minutes since last check",
          notifications: []
        });
      }
    }

    // Update last check time
    lastCheckTime = new Date();

    // Get orders created in the last 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { Orders: newOrders } = await hasuraClient.request<{ Orders: Order[] }>(
      GET_NEW_ORDERS,
      {
        created_after: threeMinutesAgo,
      }
    );

    serverLogger.info('Found new orders', 'OrderChecker', {
      orderCount: newOrders.length,
      checkTime: threeMinutesAgo
    });

    if (newOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new orders found",
        notifications: []
      });
    }

    // Calculate distance and travel time for each order
    const ordersWithDistance = newOrders.map(order => {
      const shopLat = order.Shop.latitude;
      const shopLng = order.Shop.longitude;
      
      const distanceKm = calculateDistanceKm(
        shopperLatitude,
        shopperLongitude,
        shopLat,
        shopLng
      );
      
      const travelTimeMinutes = estimateTravelTimeMinutes(distanceKm);
      
      return {
        ...order,
        distance: Math.round(distanceKm * 10) / 10,
        travelTimeMinutes
      };
    });

    // Filter orders by travel time
    const nearbyOrders = ordersWithDistance.filter(
      order => order.travelTimeMinutes <= maxTravelTime
    );

    serverLogger.info('Filtered nearby orders', 'OrderChecker', {
      totalOrders: ordersWithDistance.length,
      nearbyOrders: nearbyOrders.length,
      maxTravelTime
    });

    if (nearbyOrders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No nearby orders found",
        notifications: []
      });
    }

    // Group orders by shop for better notifications
    const ordersByShop = nearbyOrders.reduce((acc, order) => {
      if (!acc[order.Shop.name]) {
        acc[order.Shop.name] = [];
      }
      acc[order.Shop.name].push(order);
      return acc;
    }, {} as Record<string, Order[]>);

    // Create notifications for nearby orders
    const notifications = Object.entries(ordersByShop).map(([shopName, orders]) => {
      const totalOrders = orders.length;
      const totalItems = orders.reduce((sum, order) => 
        sum + (order.Order_Items_aggregate?.aggregate?.count || 0), 0);
      const totalEarnings = orders.reduce((sum, order) => 
        sum + parseFloat(order.total || "0"), 0);

      // Get the closest order's distance
      const closestOrder = orders.reduce((closest, current) => 
        (current.distance || 0) < (closest.distance || Infinity) ? current : closest
      );

      return {
        id: `${shopName}-${Date.now()}`,
        type: "NEW_ORDERS",
        title: `🔔 New Orders at ${shopName}!`,
        message: `${totalOrders} new order${totalOrders > 1 ? 's' : ''} (${totalItems} items) - ${closestOrder.distance}km away. Potential earnings: RWF${totalEarnings.toFixed(0)}`,
        orders: orders.map(order => ({
          id: order.id,
          shop_name: shopName,
          items: order.Order_Items_aggregate?.aggregate?.count || 0,
          total: order.total,
          distance: order.distance,
          travel_time: order.travelTimeMinutes
        })),
        timestamp: new Date().toISOString(),
        priority: totalOrders > 2 ? "high" : "normal"
      };
    });

    serverLogger.info('Created notifications', 'OrderChecker', {
      notificationCount: notifications.length,
      shopCount: Object.keys(ordersByShop).length
    });

    // Log the notifications being sent
    console.log(`[check-new-orders] Sending ${notifications.length} notifications for nearby orders:`, 
      notifications.map(n => ({
        shop: n.title,
        message: n.message,
        ordersCount: n.orders.length
      }))
    );

    res.status(200).json({
      success: true,
      notifications,
      should_play_sound: notifications.length > 0,
      message: `Found ${notifications.length} new nearby order notifications`
    });

    // Start notifications when shopper logs in or becomes active
    startOrderNotifications();

    // Stop notifications when shopper logs out or becomes inactive
    stopOrderNotifications();
  } catch (error) {
    serverLogger.error('Error checking for new orders', 'OrderChecker', error);
    res.status(500).json({
      success: false,
      error: "Failed to check for new orders"
    });
  }
} 