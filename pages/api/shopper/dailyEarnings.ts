import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL query to fetch today's orders for a shopper (active and completed)
const GET_DAILY_ORDERS = gql`
  query GetDailyOrders($shopperId: uuid!, $startDate: timestamptz!) {
    # Active orders
    activeOrders: Orders(
      where: {
        shopper_id: { _eq: $shopperId }
        status: {
          _in: ["accepted", "picked", "in_progress", "at_customer", "shopping"]
        }
        created_at: { _gte: $startDate }
      }
    ) {
      id
      service_fee
      delivery_fee
    }

    # Completed orders (delivered)
    completedOrders: Orders(
      where: {
        shopper_id: { _eq: $shopperId }
        status: { _eq: "delivered" }
        updated_at: { _gte: $startDate }
      }
    ) {
      id
      service_fee
      delivery_fee
    }
  }
`;

interface Order {
  id: string;
  service_fee: string | null;
  delivery_fee: string | null;
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
    // Calculate the start of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<{
      activeOrders: Order[];
      completedOrders: Order[];
    }>(GET_DAILY_ORDERS, {
      shopperId: userId,
      startDate: today.toISOString(),
    });

    // Calculate earnings from active orders
    const activeEarnings = data.activeOrders.reduce(
      (sum: number, order: Order) => {
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");
        const orderTotal = serviceFee + deliveryFee;
        console.log(
          `Active order ${order.id}: service_fee=${serviceFee}, delivery_fee=${deliveryFee}, total=${orderTotal}`
        );
        return sum + orderTotal;
      },
      0
    );

    // Calculate earnings from completed orders
    const completedEarnings = data.completedOrders.reduce(
      (sum: number, order: Order) => {
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");
        const orderTotal = serviceFee + deliveryFee;
        console.log(
          `Completed order ${order.id}: service_fee=${serviceFee}, delivery_fee=${deliveryFee}, total=${orderTotal}`
        );
        return sum + orderTotal;
      },
      0
    );

    // Total earnings for the day
    const totalEarnings = activeEarnings + completedEarnings;

    console.log(
      `Daily earnings summary: active=${activeEarnings}, completed=${completedEarnings}, total=${totalEarnings}`
    );

    return res.status(200).json({
      success: true,
      earnings: {
        active: activeEarnings,
        completed: completedEarnings,
        total: totalEarnings,
      },
      orderCounts: {
        active: data.activeOrders.length,
        completed: data.completedOrders.length,
        total: data.activeOrders.length + data.completedOrders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching daily earnings:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch daily earnings",
    });
  }
}
