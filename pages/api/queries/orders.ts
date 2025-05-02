import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ORDERS = gql`
  query GetOrders {
    Orders {
      id
      user_id
      status
      created_at
      shopper_id
      total
      updated_at
      delivery_time
      delivery_photo_url
      delivery_notes
      delivery_address_id
      combined_order_id
    }
  }
`;

interface OrdersResponse {
  Orders: Array<{
    id: string;
    user_id: string;
    status: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await hasuraClient.request<OrdersResponse>(GET_ORDERS);
    res.status(200).json({ orders: data.Orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}
