import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const ACCEPT_BATCH_MUTATION = gql`
  mutation AcceptBatch(
    $orderId: uuid!
    $shopperId: uuid!
    $assigned_at: timestamptz!
  ) {
    update_Orders_by_pk(
      pk_columns: { id: $orderId }
      _set: {
        shopper_id: $shopperId
        status: "accepted"
        updated_at: "now()"
        assigned_at: $assigned_at
      }
    ) {
      id
      status
      shopper_id
      updated_at
      assigned_at
    }
  }
`;

const ACCEPT_REEL_BATCH_MUTATION = gql`
  mutation AcceptReelBatch(
    $orderId: uuid!
    $shopperId: uuid!
    $assigned_at: timestamptz!
  ) {
    update_reel_orders_by_pk(
      pk_columns: { id: $orderId }
      _set: {
        shopper_id: $shopperId
        status: "accepted"
        updated_at: "now()"
        assigned_at: $assigned_at
      }
    ) {
      id
      status
      shopper_id
      updated_at
      assigned_at
    }
  }
`;

const ACCEPT_RESTAURANT_BATCH_MUTATION = gql`
  mutation AcceptRestaurantBatch(
    $orderId: uuid!
    $shopperId: uuid!
    $assigned_at: timestamptz!
  ) {
    update_restaurant_orders_by_pk(
      pk_columns: { id: $orderId }
      _set: {
        shopper_id: $shopperId
        status: "accepted"
        updated_at: "now()"
        assigned_at: $assigned_at
      }
    ) {
      id
      status
      shopper_id
      updated_at
      assigned_at
    }
  }
`;

const CHECK_ORDER_EXISTS = gql`
  query CheckOrderExists($orderId: uuid!) {
    Orders(where: { id: { _eq: $orderId } }) {
      id
      status
      shopper_id
    }

    reel_orders(where: { id: { _eq: $orderId } }) {
      id
      status
      shopper_id
    }

    restaurant_orders(where: { id: { _eq: $orderId } }) {
      id
      status
      shopper_id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, userId } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ error: "Order ID and User ID are required" });
  }

  if (userId !== session.user.id) {
    return res
      .status(403)
      .json({ error: "You can only accept batches for yourself" });
  }

  try {
    if (!hasuraClient) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }

    // First, check if the order exists and is available
    const checkResponse = (await hasuraClient.request(CHECK_ORDER_EXISTS, {
      orderId,
    })) as any;

    const regularOrder = checkResponse.Orders?.[0];
    const reelOrder = checkResponse.reel_orders?.[0];
    const restaurantOrder = checkResponse.restaurant_orders?.[0];

    if (!regularOrder && !reelOrder && !restaurantOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = regularOrder || reelOrder || restaurantOrder;
    const isReelOrder = !!reelOrder;
    const isRestaurantOrder = !!restaurantOrder;

    // Check if order is already assigned
    if (order.shopper_id && order.shopper_id !== userId) {
      return res.status(409).json({
        error: "This batch has already been assigned to another shopper",
      });
    }

    // Check if order is in valid state for acceptance
    if (order.status !== "PENDING") {
      return res.status(409).json({
        error: "This batch is no longer available for assignment",
      });
    }

    // Accept the batch
    const assignedAt = new Date().toISOString();
    let acceptResponse;

    if (isRestaurantOrder) {
      acceptResponse = (await hasuraClient.request(
        ACCEPT_RESTAURANT_BATCH_MUTATION,
        {
          orderId,
          shopperId: userId,
          assigned_at: assignedAt,
        }
      )) as any;
    } else if (isReelOrder) {
      acceptResponse = (await hasuraClient.request(ACCEPT_REEL_BATCH_MUTATION, {
        orderId,
        shopperId: userId,
        assigned_at: assignedAt,
      })) as any;
    } else {
      acceptResponse = (await hasuraClient.request(ACCEPT_BATCH_MUTATION, {
        orderId,
        shopperId: userId,
        assigned_at: assignedAt,
      })) as any;
    }

    if (
      acceptResponse.update_Orders_by_pk ||
      acceptResponse.update_reel_orders_by_pk ||
      acceptResponse.update_restaurant_orders_by_pk
    ) {
      console.log(`✅ Batch ${orderId} accepted by shopper ${userId}`);

      return res.status(200).json({
        success: true,
        message: "Batch accepted successfully",
        orderId,
        shopperId: userId,
        orderType: isRestaurantOrder
          ? "restaurant"
          : isReelOrder
          ? "reel"
          : "regular",
      });
    } else {
      return res.status(500).json({ error: "Failed to accept batch" });
    }
  } catch (error) {
    console.error("Error accepting batch:", error);
    return res.status(500).json({
      error: "Failed to accept batch",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
