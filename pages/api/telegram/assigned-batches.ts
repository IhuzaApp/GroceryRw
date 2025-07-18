import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Define types for the GraphQL response
interface Order {
  id: string;
  OrderID: number;
  created_at: string;
  delivery_time: string | null;
  service_fee: string | null;
  delivery_fee: string | null;
  status: string;
  delivery_notes: string | null;
  shop: {
    name: string;
    address: string;
  } | null;
  address: {
    street: string;
    city: string;
  } | null;
  Order_Items_aggregate: {
    aggregate: {
      count: number | null;
    } | null;
  };
}

interface ReelOrder {
  id: string;
  created_at: string;
  delivery_time: string | null;
  service_fee: string | null;
  delivery_fee: string | null;
  total: string;
  quantity: string;
  delivery_note: string | null;
  status: string;
  Reel: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
  };
  user: {
    name: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
  } | null;
}

interface GraphQLResponse {
  Orders: Order[];
  reel_orders: ReelOrder[];
}

// GraphQL query to fetch assigned orders for a specific shopper
const GET_ASSIGNED_BATCHES = gql`
  query GetAssignedBatches($shopper_id: uuid!) {
    Orders(
      where: { shopper_id: { _eq: $shopper_id }, status: { _neq: "delivered" } }
      order_by: { created_at: desc }
    ) {
      id
      OrderID
      created_at
      delivery_time
      service_fee
      delivery_fee
      status
      delivery_notes
      shop: Shop {
        name
        address
      }
      address: Address {
        street
        city
      }
      Order_Items_aggregate {
        aggregate {
          count
        }
      }
    }

    reel_orders(
      where: { shopper_id: { _eq: $shopper_id }, status: { _neq: "delivered" } }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      delivery_time
      service_fee
      delivery_fee
      total
      quantity
      delivery_note
      status
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
      }
      user: User {
        name
        phone
      }
      address: Address {
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Fetch assigned orders for this shopper
    const data = await hasuraClient.request<GraphQLResponse>(
      GET_ASSIGNED_BATCHES,
      {
        shopper_id: userId,
      }
    );

    // Process regular orders
    const regularOrders = data.Orders.map((order) => {
      const serviceFee = parseFloat(order.service_fee || "0");
      const deliveryFee = parseFloat(order.delivery_fee || "0");
      const totalEarnings = serviceFee + deliveryFee;

      const deliveryTime = order.delivery_time
        ? new Date(order.delivery_time)
        : null;
      const timeRemaining = deliveryTime
        ? Math.max(0, deliveryTime.getTime() - Date.now())
        : null;
      const minutesRemaining = timeRemaining
        ? Math.floor(timeRemaining / (1000 * 60))
        : null;

      return {
        id: order.id,
        orderId: order.OrderID,
        type: "regular",
        status: order.status,
        shopName: order.shop?.name || "Unknown Shop",
        shopAddress: order.shop?.address || "No address",
        customerAddress: `${order.address?.street || "No street"}, ${
          order.address?.city || "No city"
        }`,
        earnings: totalEarnings,
        serviceFee,
        deliveryFee,
        itemsCount: order.Order_Items_aggregate.aggregate?.count || 0,
        deliveryTime: order.delivery_time,
        minutesRemaining,
        deliveryNotes: order.delivery_notes,
        createdAt: order.created_at,
      };
    });

    // Process reel orders
    const reelOrders = data.reel_orders.map((order) => {
      const serviceFee = parseFloat(order.service_fee || "0");
      const deliveryFee = parseFloat(order.delivery_fee || "0");
      const totalEarnings = serviceFee + deliveryFee;

      const deliveryTime = order.delivery_time
        ? new Date(order.delivery_time)
        : null;
      const timeRemaining = deliveryTime
        ? Math.max(0, deliveryTime.getTime() - Date.now())
        : null;
      const minutesRemaining = timeRemaining
        ? Math.floor(timeRemaining / (1000 * 60))
        : null;

      return {
        id: order.id,
        type: "reel",
        status: order.status,
        title: order.Reel.title,
        description: order.Reel.description,
        product: order.Reel.Product,
        price: order.Reel.Price,
        customerName: order.user.name,
        customerPhone: order.user.phone,
        customerAddress: `${order.address?.street || "No street"}, ${
          order.address?.city || "No city"
        }`,
        earnings: totalEarnings,
        serviceFee,
        deliveryFee,
        quantity: parseInt(order.quantity),
        deliveryTime: order.delivery_time,
        minutesRemaining,
        deliveryNote: order.delivery_note,
        createdAt: order.created_at,
      };
    });

    // Combine and sort all orders by creation time (newest first)
    const allOrders = [...regularOrders, ...reelOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.status(200).json({
      success: true,
      data: {
        orders: allOrders,
        totalCount: allOrders.length,
        regularCount: regularOrders.length,
        reelCount: reelOrders.length,
      },
    });
  } catch (error) {
    console.error("Error fetching assigned batches:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch assigned batches",
    });
  }
}
