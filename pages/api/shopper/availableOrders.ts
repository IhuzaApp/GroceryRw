import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Fetch orders unassigned with detailed info
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
    // Get orders from the last 24 hours by default, or use query parameter
    const hoursParam = req.query.hours ? parseInt(req.query.hours as string) : 24;
    const hours = isNaN(hoursParam) ? 24 : hoursParam;
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

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

    // Transform data to make it easier to use on the client
    const availableOrders = data.Orders.map(order => ({
      id: order.id,
      createdAt: order.created_at,
      shopName: order.shop.name,
      shopAddress: order.shop.address,
      shopLatitude: parseFloat(order.shop.latitude),
      shopLongitude: parseFloat(order.shop.longitude),
      customerLatitude: parseFloat(order.address.latitude),
      customerLongitude: parseFloat(order.address.longitude),
      customerAddress: `${order.address.street}, ${order.address.city}`,
      itemsCount: order.Order_Items_aggregate.aggregate?.count ?? 0,
      serviceFee: parseFloat(order.service_fee || "0"),
      deliveryFee: parseFloat(order.delivery_fee || "0"),
      earnings: parseFloat(order.service_fee || "0") + parseFloat(order.delivery_fee || "0"),
    }));

    // Return the processed data
    res.status(200).json(availableOrders);
  } catch (error) {
    console.error("Error fetching available orders:", error);
    res.status(500).json({ error: "Failed to fetch available orders" });
  }
}
