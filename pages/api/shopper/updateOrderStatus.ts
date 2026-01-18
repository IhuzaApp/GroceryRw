import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { processWalletOperation } from "../../../src/lib/walletOperations";

// GraphQL mutations for bulk updates by combined_order_id
const UPDATE_BULK_ORDERS = gql`
  mutation UpdateBulkOrders(
    $combinedId: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_Orders(
      where: { combined_order_id: { _eq: $combinedId } }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      affected_rows
      returning {
        id
        status
      }
    }
  }
`;

const UPDATE_BULK_REEL_ORDERS = gql`
  mutation UpdateBulkReelOrders(
    $combinedId: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_reel_orders(
      where: { combined_order_id: { _eq: $combinedId } }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      affected_rows
      returning {
        id
        status
      }
    }
  }
`;

const UPDATE_BULK_RESTAURANT_ORDERS = gql`
  mutation UpdateBulkRestaurantOrders(
    $combinedId: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_restaurant_orders(
      where: { combined_order_id: { _eq: $combinedId } }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      affected_rows
      returning {
        id
        status
      }
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
          combined_order_id
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
          combined_order_id
        }
      }
    `;

    const CHECK_RESTAURANT_ORDER = gql`
      query CheckRestaurantOrder($orderId: uuid!, $shopperId: uuid!) {
        restaurant_orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
          combined_order_id
        }
      }
    `;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    let combinedId: string | null = null;
    let isReelOrder = false;
    let isRestaurantOrder = false;
    let orderType = "regular";

    // Check regular orders first
    const regularOrderCheck = await hasuraClient.request<{
      Orders: Array<{ id: string; status: string; combined_order_id: string | null }>;
    }>(CHECK_REGULAR_ORDER, {
      orderId,
      shopperId: userId,
    });

    if (regularOrderCheck.Orders && regularOrderCheck.Orders.length > 0) {
      // Found regular order assignment
      combinedId = regularOrderCheck.Orders[0].combined_order_id;
    } else {
      // Check reel orders
      const reelOrderCheck = await hasuraClient.request<{
        reel_orders: Array<{ id: string; status: string; combined_order_id: string | null }>;
      }>(CHECK_REEL_ORDER, {
        orderId,
        shopperId: userId,
      });

      if (reelOrderCheck.reel_orders && reelOrderCheck.reel_orders.length > 0) {
        // Found reel order assignment
        isReelOrder = true;
        orderType = "reel";
        combinedId = reelOrderCheck.reel_orders[0].combined_order_id;
      } else {
        // Check restaurant orders
        const restaurantOrderCheck = await hasuraClient.request<{
          restaurant_orders: Array<{ id: string; status: string; combined_order_id: string | null }>;
        }>(CHECK_RESTAURANT_ORDER, {
          orderId,
          shopperId: userId,
        });

        if (
          restaurantOrderCheck.restaurant_orders &&
          restaurantOrderCheck.restaurant_orders.length > 0
        ) {
          // Found restaurant order assignment
          isRestaurantOrder = true;
          orderType = "restaurant";
          combinedId = restaurantOrderCheck.restaurant_orders[0].combined_order_id;
        } else {
          console.error(
            "Authorization failed: Shopper not assigned to this order"
          );
          return res
            .status(403)
            .json({ error: "You are not assigned to this order" });
        }
      }
    }

    // Prevent restaurant orders from being updated to "shopping" status
    if (isRestaurantOrder && status === "shopping") {
      return res.status(400).json({
        error:
          "Restaurant orders cannot be updated to 'shopping' status. Use 'on_the_way' instead.",
      });
    }

    // Handle shopping status - process wallet operations directly
    // Skip wallet operations for restaurant orders as they don't have shopping phase
    if (status === "shopping" && !isRestaurantOrder) {
      try {
        await processWalletOperation(
          userId,
          orderId,
          "shopping",
          isReelOrder,
          isRestaurantOrder,
          req
        );
      } catch (walletError) {
        console.error("Error processing wallet operation:", walletError);
        return res.status(500).json({
          error:
            walletError instanceof Error
              ? walletError.message
              : "Failed to process wallet operation",
        });
      }
    }

    // Get current timestamp for updated_at
    const currentTimestamp = new Date().toISOString();

    // Update the order status based on order type
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    let updatedOrder: any;

    if (combinedId) {
      // Bulk update for combined orders
      const variables = {
        combinedId,
        status,
        updated_at: currentTimestamp,
      };

      // Update all three tables as a combined batch could contain mixed types (though unlikely)
      const [regularUpdate, reelUpdate, restaurantUpdate] = await Promise.all([
        hasuraClient.request(UPDATE_BULK_ORDERS, variables),
        hasuraClient.request(UPDATE_BULK_REEL_ORDERS, variables),
        hasuraClient.request(UPDATE_BULK_RESTAURANT_ORDERS, variables),
      ]);

      // Return the specific order that was requested, but with updated status
      updatedOrder = {
        id: orderId,
        status: status,
        updated_at: currentTimestamp,
      };
    } else {
      // Single order update (legacy logic for non-combined orders)
      const UPDATE_ORDER_STATUS = gql`
        mutation UpdateOrderStatus($id: uuid!, $status: String!, $updated_at: timestamptz!) {
          update_Orders_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: $updated_at }) {
            id status updated_at
          }
        }
      `;
      const UPDATE_REEL_ORDER_STATUS = gql`
        mutation UpdateReelOrderStatus($id: uuid!, $status: String!, $updated_at: timestamptz!) {
          update_reel_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: $updated_at }) {
            id status updated_at
          }
        }
      `;
      const UPDATE_RESTAURANT_ORDER_STATUS = gql`
        mutation UpdateRestaurantOrderStatus($id: uuid!, $status: String!, $updated_at: timestamptz!) {
          update_restaurant_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: $updated_at }) {
            id status updated_at
          }
        }
      `;

      if (isReelOrder) {
        const result = await hasuraClient.request<any>(UPDATE_REEL_ORDER_STATUS, {
          id: orderId,
          status,
          updated_at: currentTimestamp,
        });
        updatedOrder = result.update_reel_orders_by_pk;
      } else if (isRestaurantOrder) {
        const result = await hasuraClient.request<any>(UPDATE_RESTAURANT_ORDER_STATUS, {
          id: orderId,
          status,
          updated_at: currentTimestamp,
        });
        updatedOrder = result.update_restaurant_orders_by_pk;
      } else {
        const result = await hasuraClient.request<any>(UPDATE_ORDER_STATUS, {
          id: orderId,
          status,
          updated_at: currentTimestamp,
        });
        updatedOrder = result.update_Orders_by_pk;
      }
    }

    // Handle cancelled status - process wallet operations directly
    if (status === "cancelled") {
      try {
        await processWalletOperation(
          userId,
          orderId,
          "cancelled",
          isReelOrder,
          isRestaurantOrder,
          req
        );
      } catch (walletError) {
        console.error("Error processing wallet operation:", walletError);
        return res.status(500).json({
          error:
            walletError instanceof Error
              ? walletError.message
              : "Failed to process wallet operation",
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
