import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Fetch orders including item aggregates, fees, and shopper assignment
const GET_ORDERS = gql`
  query GetOrders($user_id: uuid) {
    Orders(
      where: { user_id: { _eq: $user_id } }
      order_by: { created_at: desc }
    ) {
      id
      OrderID
      user_id
      status
      created_at
      total
      service_fee
      delivery_fee
      shop_id
      shopper_id
      Order_Items_aggregate {
        aggregate {
          count
          sum {
            quantity
          }
        }
      }
    }
  }
`;

// Fetch shop details by IDs
const GET_SHOPS_BY_IDS = gql`
  query GetShopsByIds($ids: [uuid!]!) {
    Shops(where: { id: { _in: $ids } }) {
      id
      name
      address
      image
    }
  }
`;

interface OrdersResponse {
  Orders: Array<{
    id: string;
    OrderID: string;
    user_id: string;
    status: string;
    created_at: string;
    total: string;
    service_fee: string;
    delivery_fee: string;
    shop_id: string;
    shopper_id: string | null;
    Order_Items_aggregate: {
      aggregate: {
        count: number;
        sum: {
          quantity: number | null;
        } | null;
      } | null;
    };
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Extract user_id from query parameters or from session
    let userId = req.query.user_id as string;
    
    // If no user_id provided in query, try to get it from the session
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        // This is a simplified example. In a real app, you would verify the token
        // and extract the user ID from it using your authentication library
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        userId = payload.sub || payload.user_id;
      } catch (error) {
        console.error("Error extracting user ID from token:", error);
      }
    }

    // 1. Fetch orders
    const data = await hasuraClient.request<OrdersResponse>(GET_ORDERS, {
      user_id: userId,
    });
    const orders = data.Orders;
    // 2. Fetch shops for these orders
    const shopIds = Array.from(new Set(orders.map((o) => o.shop_id)));

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const shopsData = await hasuraClient.request<{
      Shops: Array<{
        id: string;
        name: string;
        address: string;
        image: string;
      }>;
    }>(GET_SHOPS_BY_IDS, { ids: shopIds });
    const shopMap = new Map(shopsData.Shops.map((s) => [s.id, s]));
    // 3. Enrich orders with shop details and item counts
    const enriched = orders.map((o) => {
      const agg = o.Order_Items_aggregate.aggregate;
      const itemsCount = agg?.count ?? 0;
      const unitsCount = agg?.sum?.quantity ?? 0;
      // Compute grand total including fees
      const baseTotal = parseFloat(o.total || "0");
      const serviceFee = parseFloat(o.service_fee || "0");
      const deliveryFee = parseFloat(o.delivery_fee || "0");
      const grandTotal = baseTotal + serviceFee + deliveryFee;
      return {
        id: o.id,
        OrderID: o.OrderID,
        user_id: o.user_id,
        status: o.status,
        created_at: o.created_at,
        total: grandTotal,
        shop_id: o.shop_id,
        shopper_id: o.shopper_id,
        shop: shopMap.get(o.shop_id) || null,
        itemsCount,
        unitsCount,
      };
    });
    res.status(200).json({ orders: enriched });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}
