import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Fetch active orders for a specific shopper
const GET_ACTIVE_ORDERS = gql`
  query GetActiveOrders($shopperId: uuid!) {
    Orders(
      where: {
        shopper_id: { _eq: $shopperId }
        status: {
          _in: ["accepted", "picked", "in_progress", "at_customer", "shopping"]
        }
      }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      status
      service_fee
      delivery_fee
      total
      Shop {
        name
        address
        latitude
        longitude
      }
      User {
        id
        name
      }
      Address {
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
  // Use optional chaining and type assertion for safety
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res
      .status(401)
      .json({ error: "You must be logged in as a shopper" });
  }

  try {
    const data = await hasuraClient.request<{
      Orders: Array<{
        id: string;
        created_at: string;
        status: string;
        service_fee: string | null;
        delivery_fee: string | null;
        total: number | null;
        Shop: {
          name: string;
          address: string;
          latitude: string;
          longitude: string;
        };
        User: { id: string; name: string };
        Address: {
          latitude: string;
          longitude: string;
          street: string;
          city: string;
        };
        Order_Items_aggregate: {
          aggregate: {
            count: number | null;
          } | null;
        };
      }>;
    }>(GET_ACTIVE_ORDERS, { shopperId: userId });

    const activeOrders = data.Orders.map((o) => ({
      id: o.id,
      status: o.status,
      createdAt: o.created_at,
      shopName: o.Shop.name,
      shopAddress: o.Shop.address,
      shopLat: parseFloat(o.Shop.latitude),
      shopLng: parseFloat(o.Shop.longitude),
      customerName: o.User.name,
      customerAddress: `${o.Address.street}, ${o.Address.city}`,
      customerLat: parseFloat(o.Address.latitude),
      customerLng: parseFloat(o.Address.longitude),
      items: o.Order_Items_aggregate.aggregate?.count ?? 0,
      total: o.total ?? 0,
      estimatedEarnings: (
        parseFloat(o.service_fee || "0") + parseFloat(o.delivery_fee || "0")
      ).toFixed(2),
    }));

    res.status(200).json(activeOrders);
  } catch (error) {
    console.error("Error fetching active batches:", error);
    res.status(500).json({ error: "Failed to fetch active batches" });
  }
}
