import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL query to fetch earnings and orders statistics for a shopper
const GET_EARNINGS_STATS = gql`
  query GetEarningsStats($shopperId: uuid!) {
    # Get earnings
    Orders(
      where: { 
        shopper_id: { _eq: $shopperId },
        status: { _eq: "delivered" }
      }
    ) {
      id
      delivery_fee
      service_fee
      created_at
      updated_at
      shop_id
      Shop {
        id
        name
      }
    }
    
    # Get completed orders count
    CompletedOrders: Orders_aggregate(
      where: {
        shopper_id: { _eq: $shopperId },
        status: { _eq: "delivered" }
      }
    ) {
      aggregate {
        count
      }
    }
    
    # Get store breakdown - each distinct shop
    distinctShops: Orders(
      where: { 
        shopper_id: { _eq: $shopperId },
        status: { _eq: "delivered" }
      }
      distinct_on: shop_id
    ) {
      shop_id
      Shop {
        id
        name
      }
    }
  }
`;

interface Order {
  id: string;
  service_fee: string | null;
  delivery_fee: string | null;
  created_at: string;
  updated_at: string;
  shop_id: string;
  Shop: {
    id: string;
    name: string;
  };
}

interface Shop {
  shop_id: string;
  Shop: {
    id: string;
    name: string;
  };
}

interface GraphQLResponse {
  Orders: Order[];
  CompletedOrders: {
    aggregate: {
      count: number;
    };
  };
  distinctShops: Shop[];
}

interface StoreEarnings {
  store: string;
  amount: number;
  percentage: number;
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

    const data = await hasuraClient.request<GraphQLResponse>(GET_EARNINGS_STATS, {
      shopperId: userId,
    });

    // Calculate total earnings from completed orders (delivery_fee + service_fee)
    let totalEarnings = 0;
    let totalActiveHours = 0;
    
    // Create a map to track earnings by store
    const storeEarningsMap = new Map<string, number>();
    
    if (data.Orders && Array.isArray(data.Orders)) {
      data.Orders.forEach(order => {
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");
        const orderTotal = serviceFee + deliveryFee;
        
        // Add to total earnings
        totalEarnings += orderTotal;
        
        // Calculate active hours
        const startTime = new Date(order.created_at);
        const endTime = new Date(order.updated_at);
        const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        totalActiveHours += hoursDiff;
        
        // Add to store earnings
        const storeName = order.Shop?.name || 'Unknown Store';
        if (storeEarningsMap.has(storeName)) {
          storeEarningsMap.set(storeName, storeEarningsMap.get(storeName)! + orderTotal);
        } else {
          storeEarningsMap.set(storeName, orderTotal);
        }
      });
    }
    
    // Format store earnings data
    let storeEarnings: StoreEarnings[] = Array.from(storeEarningsMap.entries())
      .map(([store, amount]) => ({
        store,
        amount,
        percentage: Math.round((amount / totalEarnings) * 100) || 0
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Keep top 3 stores and combine the rest as "Other Stores"
    if (storeEarnings.length > 3) {
      const topStores = storeEarnings.slice(0, 3);
      const otherStores = storeEarnings.slice(3);
      
      const otherStoresAmount = otherStores.reduce((sum, store) => sum + store.amount, 0);
      const otherStoresPercentage = Math.round((otherStoresAmount / totalEarnings) * 100) || 0;
      
      storeEarnings = [
        ...topStores,
        {
          store: "Other Stores",
          amount: otherStoresAmount,
          percentage: otherStoresPercentage
        }
      ];
    }
    
    // Calculate average hours per order
    const completedOrdersCount = data.CompletedOrders.aggregate.count || 0;
    const averageActiveHours = completedOrdersCount > 0 
      ? totalActiveHours / completedOrdersCount 
      : 0;

    // Mock data for earnings components
    const earningsComponents = [
      { type: "Delivery Fee", amount: data.Orders.reduce((sum, order) => sum + parseFloat(order.delivery_fee || "0"), 0), percentage: 0 },
      { type: "Service Fee", amount: data.Orders.reduce((sum, order) => sum + parseFloat(order.service_fee || "0"), 0), percentage: 0 }
    ];
    
    // Calculate percentages for earnings components
    earningsComponents.forEach(component => {
      component.percentage = Math.round((component.amount / totalEarnings) * 100) || 0;
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalEarnings,
        completedOrders: completedOrdersCount,
        activeHours: parseFloat(averageActiveHours.toFixed(1)),
        rating: 0, // As per requirement, leave rating as 0
        storeBreakdown: storeEarnings,
        earningsComponents
      }
    });
  } catch (error) {
    console.error("Error fetching earnings stats:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch earnings stats",
    });
  }
} 