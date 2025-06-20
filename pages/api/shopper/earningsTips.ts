import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL query to fetch order patterns for analysis
const GET_ORDER_PATTERNS = gql`
  query GetOrderPatterns($shopperId: uuid!) {
    # Get all delivered orders for the shopper
    Orders(
      where: { shopper_id: { _eq: $shopperId }, status: { _eq: "delivered" } }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      updated_at
      service_fee
      delivery_fee
      shop_id
      Shop {
        id
        name
      }
    }
    
    # Get total orders count
    TotalOrders: Orders_aggregate(
      where: { 
        shopper_id: { _eq: $shopperId }, 
        status: { _eq: "delivered" }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  service_fee: string | null;
  delivery_fee: string | null;
  shop_id: string;
  Shop: {
    id: string;
    name: string;
  };
}

interface GraphQLResponse {
  Orders: Order[];
  TotalOrders: {
    aggregate: {
      count: number;
    };
  };
}

interface TimeSlot {
  day: string;
  hour: number;
  count: number;
  totalEarnings: number;
}

interface StorePerformance {
  store: string;
  orderCount: number;
  totalEarnings: number;
  avgEarnings: number;
}

interface EarningsTips {
  peakHours: {
    day: string;
    timeRange: string;
    orderCount: number;
    avgEarnings: number;
  }[];
  topStores: StorePerformance[];
  batchOrderPercentage: number;
  totalOrders: number;
  tips: string[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Get session to identify the shopper
  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in as a shopper" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<GraphQLResponse>(
      GET_ORDER_PATTERNS,
      {
        shopperId: userId,
      }
    );

    if (!data.Orders || data.Orders.length === 0) {
      // Return default tips if no orders
      return res.status(200).json({
        success: true,
        tips: {
          peakHours: [],
          topStores: [],
          batchOrderPercentage: 0,
          totalOrders: 0,
          tips: [
            "Start accepting orders to see personalized tips based on your performance",
            "Focus on maintaining high customer ratings",
            "Consider working during weekends when demand is typically higher",
            "Stay active during meal times (lunch 12-2pm, dinner 6-8pm)"
          ]
        }
      });
    }

    // Analyze order patterns
    const timeSlots: TimeSlot[] = [];
    const storeMap = new Map<string, StorePerformance>();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Process each order
    data.Orders.forEach((order) => {
      const orderDate = new Date(order.created_at);
      const day = dayNames[orderDate.getDay()];
      const hour = orderDate.getHours();
      const earnings = parseFloat(order.service_fee || "0") + parseFloat(order.delivery_fee || "0");

      // Track time slots
      const timeSlotKey = `${day}-${hour}`;
      const existingSlot = timeSlots.find(slot => slot.day === day && slot.hour === hour);
      
      if (existingSlot) {
        existingSlot.count++;
        existingSlot.totalEarnings += earnings;
      } else {
        timeSlots.push({
          day,
          hour,
          count: 1,
          totalEarnings: earnings
        });
      }

      // Track store performance
      const storeName = order.Shop?.name || "Unknown Store";
      if (storeMap.has(storeName)) {
        const store = storeMap.get(storeName)!;
        store.orderCount++;
        store.totalEarnings += earnings;
        store.avgEarnings = store.totalEarnings / store.orderCount;
      } else {
        storeMap.set(storeName, {
          store: storeName,
          orderCount: 1,
          totalEarnings: earnings,
          avgEarnings: earnings
        });
      }
    });

    // Find peak hours (top 3 time slots by order count)
    const peakHours = timeSlots
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(slot => ({
        day: slot.day,
        timeRange: `${slot.hour}:00 - ${slot.hour + 1}:00`,
        orderCount: slot.count,
        avgEarnings: Math.round(slot.totalEarnings / slot.count)
      }));

    // Find top performing stores
    const topStores = Array.from(storeMap.values())
      .sort((a, b) => b.avgEarnings - a.avgEarnings)
      .slice(0, 3);

    // Calculate total orders count
    const totalOrderCount = data.TotalOrders.aggregate.count || 0;

    // Generate dynamic tips
    const tips: string[] = [];

    // Tip 1: Peak hours with more detail
    if (peakHours.length > 0) {
      const topPeak = peakHours[0];
      if (topPeak.orderCount >= 3) {
        tips.push(`🔥 Peak time: ${topPeak.day} ${topPeak.timeRange} - ${topPeak.orderCount} orders, avg RWF ${topPeak.avgEarnings}`);
      } else {
        tips.push(`Shop during peak hours: ${topPeak.day} ${topPeak.timeRange} (${topPeak.orderCount} orders, avg RWF ${topPeak.avgEarnings})`);
      }
    } else {
      tips.push("Shop during peak hours (Fri 4-8pm, Sat 10am-2pm, Sun 11am-3pm)");
    }

    // Tip 2: General batch order tip
    tips.push("📦 Accept batch orders with multiple deliveries for higher earnings per trip");

    // Tip 3: Top stores with earnings data
    if (topStores.length > 0) {
      const topStore = topStores[0];
      const secondStore = topStores[1];
      
      if (topStore.avgEarnings > 2000) {
        tips.push(`🏪 Focus on ${topStore.store} - your highest earner (avg RWF ${Math.round(topStore.avgEarnings)})`);
      } else if (secondStore && (topStore.avgEarnings - secondStore.avgEarnings) > 500) {
        tips.push(`🏪 ${topStore.store} pays ${Math.round(topStore.avgEarnings - secondStore.avgEarnings)} RWF more than other stores`);
      } else {
        tips.push(`🏪 Focus on ${topStore.store} - your most consistent store`);
      }
    } else {
      tips.push("Focus on stores you're familiar with to shop faster");
    }

    // Tip 4: Performance-based tip
    if (totalOrderCount < 5) {
      tips.push("🚀 Complete more orders to unlock personalized performance insights");
    } else if (totalOrderCount < 20) {
      tips.push("⭐ Maintain high ratings - you're building a great reputation!");
    } else {
      tips.push("⭐ Excellent order count! Keep maintaining high customer ratings for bonuses");
    }

    // Tip 5: Time-based tip
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = dayNames[now.getDay()];
    
    // Check if current time is a peak time
    const currentTimeSlot = timeSlots.find(slot => 
      slot.day === currentDay && Math.abs(slot.hour - currentHour) <= 1
    );
    
    if (currentTimeSlot && currentTimeSlot.count >= 2) {
      tips.push(`⏰ Right now is a peak time! (${currentTimeSlot.count} orders in this hour)`);
    } else if (currentHour >= 11 && currentHour <= 14) {
      tips.push("🍽️ Lunch rush time (11am-2pm) - high demand for food orders");
    } else if (currentHour >= 17 && currentHour <= 20) {
      tips.push("🍽️ Dinner rush time (5pm-8pm) - peak delivery hours");
    }

    return res.status(200).json({
      success: true,
      tips: {
        peakHours,
        topStores,
        batchOrderPercentage: 0,
        totalOrders: totalOrderCount,
        tips
      }
    });

  } catch (error) {
    console.error("Error fetching earnings tips:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch earnings tips",
    });
  }
} 