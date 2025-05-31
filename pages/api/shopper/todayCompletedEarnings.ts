import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Define types for the GraphQL response
interface Order {
  id: string;
  service_fee: string | null;
  delivery_fee: string | null;
  updated_at: string;
  Shop: {
    name: string;
  } | null;
}

interface GraphQLResponse {
  Orders: Order[];
}

// GraphQL query to fetch today's completed delivery earnings
const GET_TODAY_COMPLETED_EARNINGS = gql`
  query GetTodayCompletedEarnings($shopper_id: uuid!, $today_start: timestamptz!, $today_end: timestamptz!) {
    Orders(
      where: {
        shopper_id: { _eq: $shopper_id }
        status: { _eq: "delivered" }
        updated_at: { _gte: $today_start, _lte: $today_end }
      }
    ) {
      id
      service_fee
      delivery_fee
      updated_at
      Shop {
        name
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get session to identify the shopper
    const session = await getServerSession(req, res, authOptions as any);
    const shopperId = (session as any)?.user?.id;

    if (!shopperId) {
      return res.status(401).json({ error: "You must be logged in as a shopper" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Calculate today's date range in the local timezone
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Fetch orders for today
    const data = await hasuraClient.request<GraphQLResponse>(GET_TODAY_COMPLETED_EARNINGS, {
      shopper_id: shopperId,
      today_start: todayStart.toISOString(),
      today_end: todayEnd.toISOString(),
    });

    // Calculate total earnings and get order details
    let totalEarnings = 0;
    const completedOrders = data.Orders.map((order) => {
      const serviceFee = parseFloat(order.service_fee || "0");
      const deliveryFee = parseFloat(order.delivery_fee || "0");
      const orderTotal = serviceFee + deliveryFee;
      totalEarnings += orderTotal;

      return {
        id: order.id,
        shopName: order.Shop?.name || "Unknown Shop",
        earnings: orderTotal,
        completedAt: order.updated_at,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalEarnings,
        completedOrders,
        orderCount: completedOrders.length,
      }
    });
  } catch (error) {
    console.error("Error fetching today's completed earnings:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch today's completed earnings"
    });
  }
} 