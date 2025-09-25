import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Query to check all orders (not just recent ones)
const GET_ALL_ORDERS = gql`
  query GetAllOrders {
    Orders(
      where: {
        status: { _eq: "PENDING" }
        shopper_id: { _is_null: true }
      }
      order_by: { created_at: desc }
      limit: 10
    ) {
      id
      created_at
      status
      shopper_id
      service_fee
      delivery_fee
      Shop {
        name
        latitude
        longitude
      }
      Address {
        latitude
        longitude
        street
        city
      }
    }
  }
`;

const GET_ALL_REEL_ORDERS = gql`
  query GetAllReelOrders {
    reel_orders(
      where: {
        status: { _eq: "PENDING" }
        shopper_id: { _is_null: true }
      }
      order_by: { created_at: desc }
      limit: 10
    ) {
      id
      created_at
      status
      shopper_id
      service_fee
      delivery_fee
      Reel {
        title
        latitude
        longitude
      }
      address {
        latitude
        longitude
        street
        city
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
    console.log("🔍 Checking for existing orders...");

    const [regularOrdersData, reelOrdersData] = await Promise.all([
      hasuraClient.request(GET_ALL_ORDERS) as any,
      hasuraClient.request(GET_ALL_REEL_ORDERS) as any,
    ]);

    const regularOrders = regularOrdersData.Orders || [];
    const reelOrders = reelOrdersData.reel_orders || [];

    console.log("📊 Found orders:", {
      regularOrders: regularOrders.length,
      reelOrders: reelOrders.length,
      regularOrdersData: regularOrders,
      reelOrdersData: reelOrders
    });

    return res.status(200).json({
      success: true,
      message: "Order check completed",
      results: {
        regularOrders: {
          count: regularOrders.length,
          orders: regularOrders.map(order => ({
            id: order.id,
            created_at: order.created_at,
            status: order.status,
            shopper_id: order.shopper_id,
            shopName: order.Shop?.name,
            address: order.Address?.street + ", " + order.Address?.city
          }))
        },
        reelOrders: {
          count: reelOrders.length,
          orders: reelOrders.map(order => ({
            id: order.id,
            created_at: order.created_at,
            status: order.status,
            shopper_id: order.shopper_id,
            reelTitle: order.Reel?.title,
            address: order.address?.street + ", " + order.address?.city
          }))
        }
      }
    });

  } catch (error) {
    console.error("💥 Error checking orders:", error);
    return res.status(500).json({
      error: "Failed to check orders",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
