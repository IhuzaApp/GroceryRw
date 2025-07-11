import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";
import { logger } from "../../../src/utils/logger";

// Fetch regular orders including item aggregates, fees, and shopper assignment
const GET_ORDERS = gql`
  query GetOrders($user_id: uuid!) {
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
      delivery_time
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

// Fetch reel orders
const GET_REEL_ORDERS = gql`
  query GetReelOrders($user_id: uuid!) {
    reel_orders(
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
      reel_id
      shopper_id
      delivery_time
      quantity
      delivery_note
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
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
    delivery_time: string;
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

interface ReelOrdersResponse {
  reel_orders: Array<{
    id: string;
    OrderID: string;
    user_id: string;
    status: string;
    created_at: string;
    total: string;
    service_fee: string;
    delivery_fee: string;
    reel_id: string;
    shopper_id: string | null;
    delivery_time: string;
    quantity: string;
    delivery_note: string;
    Reel: {
      id: string;
      title: string;
      description: string;
      Price: string;
      Product: string;
      type: string;
      video_url: string;
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

    // Get the user ID from the session
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract user ID from session
    const userId = (session.user as any).id;
    if (!userId) {
      return res.status(400).json({ error: "Missing user ID in session" });
    }

    logger.info("Fetching all orders for user", "AllOrdersAPI", { userId });

    // 1. Fetch regular orders
    const ordersData = await hasuraClient.request<OrdersResponse>(GET_ORDERS, {
      user_id: userId,
    });
    const orders = ordersData.Orders;

    // 2. Fetch reel orders
    const reelOrdersData = await hasuraClient.request<ReelOrdersResponse>(GET_REEL_ORDERS, {
      user_id: userId,
    });
    const reelOrders = reelOrdersData.reel_orders;

    logger.info(`Found ${orders?.length || 0} regular orders and ${reelOrders?.length || 0} reel orders`, "AllOrdersAPI");

    // 3. Fetch shops for regular orders
    const shopIds = Array.from(new Set(orders.map((o) => o.shop_id))).filter(
      Boolean
    );

    let shopMap = new Map();
    if (shopIds.length > 0) {
      const shopsData = await hasuraClient.request<{
        Shops: Array<{
          id: string;
          name: string;
          address: string;
          image: string;
        }>;
      }>(GET_SHOPS_BY_IDS, { ids: shopIds });
      shopMap = new Map(shopsData.Shops.map((s) => [s.id, s]));
    }

    // 4. Enrich regular orders with shop details and item counts
    const enrichedRegularOrders = orders.map((o) => {
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
        delivery_time: o.delivery_time,
        total: grandTotal,
        shop_id: o.shop_id,
        shopper_id: o.shopper_id,
        shop: shopMap.get(o.shop_id) || null,
        itemsCount,
        unitsCount,
        orderType: "regular" as const,
      };
    });

    // 5. Enrich reel orders
    const enrichedReelOrders = reelOrders.map((ro) => {
      const baseTotal = parseFloat(ro.total || "0");
      const serviceFee = parseFloat(ro.service_fee || "0");
      const deliveryFee = parseFloat(ro.delivery_fee || "0");
      const grandTotal = baseTotal + serviceFee + deliveryFee;
      
      return {
        id: ro.id,
        OrderID: ro.OrderID,
        user_id: ro.user_id,
        status: ro.status,
        created_at: ro.created_at,
        delivery_time: ro.delivery_time,
        total: grandTotal,
        shopper_id: ro.shopper_id,
        shop: null, // Reel orders don't have shops
        itemsCount: 1, // Reel orders have 1 item
        unitsCount: parseInt(ro.quantity) || 1,
        orderType: "reel" as const,
        reel: ro.Reel,
        quantity: parseInt(ro.quantity) || 1,
        delivery_note: ro.delivery_note,
      };
    });

    // 6. Combine and sort all orders by creation date (newest first)
    const allOrders = [...enrichedRegularOrders, ...enrichedReelOrders].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.status(200).json({ orders: allOrders });
  } catch (error) {
    logger.error("Error fetching all orders", "AllOrdersAPI", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
} 