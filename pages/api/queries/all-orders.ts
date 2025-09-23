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
      Order_Items {
        quantity
        product: Product {
          final_price
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

// Fetch restaurant orders
const GET_RESTAURANT_ORDERS = gql`
  query GetRestaurantOrders($user_id: uuid!) {
    restaurant_orders(
      where: { user_id: { _eq: $user_id } }
      order_by: { created_at: desc }
    ) {
      id
      OrderID
      user_id
      status
      created_at
      total
      delivery_fee
      restaurant_id
      shopper_id
      delivery_time
      delivery_notes
      discount
      voucher_code
      found
      restaurant_dishe_orders {
        quantity
        price
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

// Fetch restaurant details by IDs
const GET_RESTAURANTS_BY_IDS = gql`
  query GetRestaurantsByIds($ids: [uuid!]!) {
    Restaurants(where: { id: { _in: $ids } }) {
      id
      name
      location
      profile
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
    Order_Items: Array<{
      quantity: number;
      product: {
        final_price: string;
      };
    }>;
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

interface RestaurantOrdersResponse {
  restaurant_orders: Array<{
    id: string;
    OrderID: string;
    user_id: string;
    status: string;
    created_at: string;
    total: string;
    delivery_fee: string;
    restaurant_id: string;
    shopper_id: string | null;
    delivery_time: string;
    delivery_notes: string;
    discount: string;
    voucher_code: string;
    found: boolean;
    restaurant_dishe_orders: Array<{
      quantity: string;
      price: string;
    }>;
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
    const reelOrdersData = await hasuraClient.request<ReelOrdersResponse>(
      GET_REEL_ORDERS,
      {
        user_id: userId,
      }
    );
    const reelOrders = reelOrdersData.reel_orders;

    // 3. Fetch restaurant orders
    const restaurantOrdersData = await hasuraClient.request<RestaurantOrdersResponse>(
      GET_RESTAURANT_ORDERS,
      {
        user_id: userId,
      }
    );
    const restaurantOrders = restaurantOrdersData.restaurant_orders;

    logger.info(
      `Found ${orders?.length || 0} regular orders, ${
        reelOrders?.length || 0
      } reel orders, and ${restaurantOrders?.length || 0} restaurant orders`,
      "AllOrdersAPI"
    );

    // 4. Fetch shops for regular orders
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

    // 5. Fetch restaurants for restaurant orders
    const restaurantIds = Array.from(new Set(restaurantOrders.map((ro) => ro.restaurant_id))).filter(
      Boolean
    );

    let restaurantMap = new Map();
    if (restaurantIds.length > 0) {
      const restaurantsData = await hasuraClient.request<{
        Restaurants: Array<{
          id: string;
          name: string;
          location: string;
          profile: string;
        }>;
      }>(GET_RESTAURANTS_BY_IDS, { ids: restaurantIds });
      restaurantMap = new Map(restaurantsData.Restaurants.map((r) => [r.id, r]));
    }

    // 6. Enrich regular orders with shop details and item counts
    const enrichedRegularOrders = orders.map((o) => {
      const agg = o.Order_Items_aggregate.aggregate;
      const itemsCount = agg?.count ?? 0;
      const unitsCount = agg?.sum?.quantity ?? 0;

      // Calculate subtotal based on final prices (what customer pays)
      const finalPriceSubtotal =
        o.Order_Items?.reduce((sum: number, item: any) => {
          return (
            sum + parseFloat(item.product.final_price || "0") * item.quantity
          );
        }, 0) || 0;

      // Compute grand total including fees
      const serviceFee = parseFloat(o.service_fee || "0");
      const deliveryFee = parseFloat(o.delivery_fee || "0");
      const grandTotal = finalPriceSubtotal + serviceFee + deliveryFee;

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

    // 7. Enrich reel orders
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

    // 8. Enrich restaurant orders with restaurant details and item counts
    const enrichedRestaurantOrders = restaurantOrders.map((ro) => {
      // Calculate counts manually from the restaurant_dishe_orders array
      const itemsCount = ro.restaurant_dishe_orders?.length ?? 0;
      const unitsCount = ro.restaurant_dishe_orders?.reduce((sum, item) => {
        return sum + parseInt(item.quantity || "0");
      }, 0) ?? 0;

      const baseTotal = parseFloat(ro.total || "0");
      const deliveryFee = parseFloat(ro.delivery_fee || "0");
      const discountAmount = parseFloat(ro.discount || "0");
      const grandTotal = baseTotal + deliveryFee - discountAmount;

      return {
        id: ro.id,
        OrderID: ro.OrderID || ro.id, // Use OrderID if available, otherwise fall back to id
        user_id: ro.user_id,
        status: ro.status,
        created_at: ro.created_at,
        delivery_time: ro.delivery_time,
        total: grandTotal,
        shopper_id: ro.shopper_id,
        shop: restaurantMap.get(ro.restaurant_id) ? {
          ...restaurantMap.get(ro.restaurant_id),
          address: restaurantMap.get(ro.restaurant_id).location,
          image: restaurantMap.get(ro.restaurant_id).profile
        } : null, // Use restaurant as shop for compatibility
        itemsCount,
        unitsCount,
        orderType: "restaurant" as const,
        delivery_note: ro.delivery_notes,
        discount: discountAmount,
        voucher_code: ro.voucher_code,
        found: ro.found,
      };
    });

    // 9. Combine and sort all orders by creation date (newest first)
    const allOrders = [...enrichedRegularOrders, ...enrichedReelOrders, ...enrichedRestaurantOrders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    res.status(200).json({ orders: allOrders });
  } catch (error) {
    logger.error("Error fetching all orders", "AllOrdersAPI", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
}
