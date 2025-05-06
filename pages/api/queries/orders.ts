import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Fetch orders including item aggregates
const GET_ORDERS = gql`
  query GetOrders {
    Orders {
      id
      user_id
      status
      created_at
      total
      shop_id
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
    user_id: string;
    status: string;
    created_at: string;
    total: string;
    shop_id: string;
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
    // 1. Fetch orders
    const data = await hasuraClient.request<OrdersResponse>(GET_ORDERS);
    const orders = data.Orders;
    // 2. Fetch shops for these orders
    const shopIds = Array.from(new Set(orders.map(o => o.shop_id)));
    const shopsData = await hasuraClient.request<{ Shops: Array<{ id: string; name: string; address: string; image: string; }> }>(GET_SHOPS_BY_IDS, { ids: shopIds });
    const shopMap = new Map(shopsData.Shops.map(s => [s.id, s]));
    // 3. Enrich orders with shop details and item counts
    const enriched = orders.map(o => {
      const agg = o.Order_Items_aggregate.aggregate;
      const itemsCount = agg?.count ?? 0;
      const unitsCount = agg?.sum?.quantity ?? 0;
      return {
        id: o.id,
        user_id: o.user_id,
        status: o.status,
        created_at: o.created_at,
        total: o.total,
        shop_id: o.shop_id,
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
