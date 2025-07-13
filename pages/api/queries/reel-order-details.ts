import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";
import { logger } from "../../../src/utils/logger";

// Fetch reel order details
const GET_REEL_ORDER_DETAILS = gql`
  query GetReelOrderDetails($order_id: uuid!) {
    reel_orders_by_pk(id: $order_id) {
      id
      OrderID
      user_id
      status
      created_at
      total
      service_fee
      delivery_fee
      discount
      voucher_code
      delivery_time
      delivery_note
      quantity
      found
      shopper_id
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
        user_id
        created_on
        likes
        isLiked
        category
        delivery_time
        restaurant_id
        Restaurant {
        id
          name
          location
        }
      }
        User {
          id
          name
          email
          phone
      }
    }
  }
`;

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

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Order ID is required" });
    }

    logger.info("Fetching reel order details", "ReelOrderDetailsAPI", {
      orderId: id,
    });

    // Fetch reel order details
    const data = await hasuraClient.request<{
      reel_orders_by_pk: {
        id: string;
        OrderID: string;
        user_id: string;
        status: string;
        created_at: string;
        total: string;
        service_fee: string;
        delivery_fee: string;
        discount: string | null;
        voucher_code: string | null;
        delivery_time: string;
        delivery_note: string;
        quantity: string;
        found: boolean;
        shopper_id: string | null;
        Reel: {
          id: string;
          title: string;
          description: string;
          Price: string;
          Product: string;
          type: string;
          video_url: string;
          user_id: string;
          created_on: string;
          likes: number;
          isLiked: boolean;
          category: string;
          delivery_time: string;
          restaurant_id: string;
          Restaurant: {
          id: string;
            name: string;
            location: string;
          };
        };
          User: {
            id: string;
            name: string;
            email: string;
            phone: string;
          };
      } | null;
    }>(GET_REEL_ORDER_DETAILS, { order_id: id });

    const orderData = data.reel_orders_by_pk;
    if (!orderData) {
      return res.status(404).json({ error: "Reel order not found" });
    }

    // Format the order data for the frontend
    const formattedOrder = {
      id: orderData.id,
      OrderID: orderData.OrderID,
      status: orderData.status,
      created_at: orderData.created_at,
      placedAt: new Date(orderData.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      total: parseFloat(orderData.total),
      service_fee: parseFloat(orderData.service_fee),
      delivery_fee: parseFloat(orderData.delivery_fee),
      discount: orderData.discount ? parseFloat(orderData.discount) : 0,
      voucher_code: orderData.voucher_code,
      delivery_time: orderData.delivery_time,
      estimatedDelivery: orderData.delivery_time,
      delivery_note: orderData.delivery_note,
      quantity: parseInt(orderData.quantity),
      found: orderData.found,
      orderType: "reel" as const,
      reel: orderData.Reel,
      assignedTo: orderData.User
        ? {
            id: orderData.User.id,
            name: orderData.User.name,
            phone: orderData.User.phone,
            email: orderData.User.email,
          }
        : null,
    };

    res.status(200).json({ order: formattedOrder });
  } catch (error) {
    logger.error(
      "Error fetching reel order details",
      "ReelOrderDetailsAPI",
      error
    );
    res.status(500).json({ error: "Failed to fetch reel order details" });
  }
}
