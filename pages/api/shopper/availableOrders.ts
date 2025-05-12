import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Fetch orders unassigned for the last 60 minutes, with detailed info
const GET_AVAILABLE_ORDERS = gql`
  query GetAvailableOrders($createdAfter: timestamptz!) {
    Orders(
      where: {
        shopper_id: { _is_null: true }
        created_at: { _gte: $createdAfter }
        status: { _eq: "PENDING" }
      }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      service_fee
      delivery_fee
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get orders from the last 60 minutes
    const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<{
      Orders: Array<{
        id: string;
        created_at: string;
        service_fee: string | null;
        delivery_fee: string | null;
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
    }>(GET_AVAILABLE_ORDERS, { createdAfter: cutoff });

    // Return the raw data for client-side filtering
    res.status(200).json(data.Orders);
  } catch (error) {
    console.error("Error fetching available orders:", error);
    res.status(500).json({ error: "Failed to fetch available orders" });
  }
}
