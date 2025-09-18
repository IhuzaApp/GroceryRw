import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL mutation to update regular order status
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus(
    $id: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_Orders_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      id
      status
      updated_at
    }
  }
`;

// GraphQL mutation to update reel order status
const UPDATE_REEL_ORDER_STATUS = gql`
  mutation UpdateReelOrderStatus(
    $id: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_reel_orders_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      id
      status
      updated_at
    }
  }
`;


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Authenticate the shopper
  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res
      .status(400)
      .json({ error: "Missing required fields: orderId and status" });
  }

  // Validate status value
  const validStatuses = [
    "accepted",
    "shopping",
    "picked",
    "in_progress",
    "on_the_way",
    "at_customer",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    // First check if this is a regular order or reel order
    const CHECK_REGULAR_ORDER = gql`
      query CheckRegularOrder($orderId: uuid!, $shopperId: uuid!) {
        Orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
        }
      }
    `;

    const CHECK_REEL_ORDER = gql`
      query CheckReelOrder($orderId: uuid!, $shopperId: uuid!) {
        reel_orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
        }
      }
    `;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Check regular orders first
    const regularOrderCheck = await hasuraClient.request<{
      Orders: Array<{ id: string; status: string }>;
    }>(CHECK_REGULAR_ORDER, {
      orderId,
      shopperId: userId,
    });

    let isReelOrder = false;
    let orderType = "regular";

    if (regularOrderCheck.Orders && regularOrderCheck.Orders.length > 0) {
      // Found regular order assignment
    } else {
      // Check reel orders
      const reelOrderCheck = await hasuraClient.request<{
        reel_orders: Array<{ id: string; status: string }>;
      }>(CHECK_REEL_ORDER, {
        orderId,
        shopperId: userId,
      });

      if (reelOrderCheck.reel_orders && reelOrderCheck.reel_orders.length > 0) {
        // Found reel order assignment
        isReelOrder = true;
        orderType = "reel";
      } else {
        console.error(
          "Authorization failed: Shopper not assigned to this order"
        );
        return res
          .status(403)
          .json({ error: "You are not assigned to this order" });
      }
    }

    // Handle shopping status - delegate to wallet operations API
    if (status === "shopping") {
      try {
        const walletResponse = await fetch(
          `${
            req.headers.host
              ? `http://${req.headers.host}`
              : "http://localhost:3000"
          }/api/shopper/walletOperations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.cookie || "",
            },
            body: JSON.stringify({
              orderId,
              operation: "shopping",
              isReelOrder,
            }),
          }
        );

        if (!walletResponse.ok) {
          console.error(
            "Failed to process wallet operation for shopping:",
            await walletResponse.text()
          );
          return res.status(500).json({
            error: "Failed to process wallet operation",
          });
        }
      } catch (walletError) {
        console.error("Error processing wallet operation:", walletError);
        return res.status(500).json({
          error:
            walletError instanceof Error
              ? walletError.message
              : "Unknown error",
        });
      }
    }

    // Get current timestamp for updated_at
    const currentTimestamp = new Date().toISOString();

    // Update the order status based on order type
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    let updateResult: any;
    if (isReelOrder) {
      updateResult = await hasuraClient.request<{
        update_reel_orders_by_pk: {
          id: string;
          status: string;
          updated_at: string;
        };
      }>(UPDATE_REEL_ORDER_STATUS, {
        id: orderId,
        status,
        updated_at: currentTimestamp,
      });
    } else {
      updateResult = await hasuraClient.request<{
        update_Orders_by_pk: {
          id: string;
          status: string;
          updated_at: string;
        };
      }>(UPDATE_ORDER_STATUS, {
        id: orderId,
        status,
        updated_at: currentTimestamp,
      });
    }

    const updatedOrder = isReelOrder
      ? updateResult.update_reel_orders_by_pk
      : updateResult.update_Orders_by_pk;

    // Handle cancelled status - delegate to wallet operations API
    if (status === "cancelled") {
      try {
        const walletResponse = await fetch(
          `${
            req.headers.host
              ? `http://${req.headers.host}`
              : "http://localhost:3000"
          }/api/shopper/walletOperations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: req.headers.cookie || "",
            },
            body: JSON.stringify({
              orderId,
              operation: "cancelled",
              isReelOrder,
            }),
          }
        );

        if (!walletResponse.ok) {
          console.error(
            "Failed to process wallet operation for cancelled:",
            await walletResponse.text()
          );
          return res.status(500).json({
            error: "Failed to process wallet operation",
          });
        }
      } catch (walletError) {
        console.error("Error processing wallet operation:", walletError);
        return res.status(500).json({
          error:
            walletError instanceof Error
              ? walletError.message
              : "Unknown error",
        });
      }
    }

    // Note: Wallet operations for "delivered" status are handled separately
    // in the DeliveryConfirmationModal before calling this API

    return res.status(200).json({
      success: true,
      order: updatedOrder,
      orderType,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    });
  }
}
