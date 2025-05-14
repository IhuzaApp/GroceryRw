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
  }
`;

interface Order {
  id: string;
  service_fee: string | null;
  delivery_fee: string | null;
  created_at: string;
  updated_at: string;
}

interface GraphQLResponse {
  Orders: Order[];
  CompletedOrders: {
    aggregate: {
      count: number;
    };
  };
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
    
    if (data.Orders && Array.isArray(data.Orders)) {
      totalEarnings = data.Orders.reduce((sum: number, order) => {
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");
        return sum + serviceFee + deliveryFee;
      }, 0);
      
      // Calculate active hours (time from created_at to updated_at)
      totalActiveHours = data.Orders.reduce((totalHours: number, order) => {
        const startTime = new Date(order.created_at);
        const endTime = new Date(order.updated_at);
        const hoursDiff = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return totalHours + hoursDiff;
      }, 0);
    }
    
    // Calculate average hours per order
    const completedOrdersCount = data.CompletedOrders.aggregate.count || 0;
    const averageActiveHours = completedOrdersCount > 0 
      ? totalActiveHours / completedOrdersCount 
      : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalEarnings,
        completedOrders: completedOrdersCount,
        activeHours: parseFloat(averageActiveHours.toFixed(1)),
        rating: 0 // As per requirement, leave rating as 0
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