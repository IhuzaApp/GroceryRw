import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL mutation to update order status
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
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    // First verify this shopper is assigned to this order
    const CHECK_ASSIGNMENT = gql`
      query CheckOrderAssignment($orderId: uuid!, $shopperId: uuid!) {
        Orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
        }
      }
    `;

    console.log("Checking assignment for shopper:", userId, "order:", orderId);

    const assignmentCheck = await hasuraClient.request<{
      Orders: Array<{ id: string; status: string }>;
    }>(CHECK_ASSIGNMENT, {
      orderId,
      shopperId: userId,
    });

    console.log("Assignment check result:", JSON.stringify(assignmentCheck));

    if (!assignmentCheck.Orders || assignmentCheck.Orders.length === 0) {
      console.error("Authorization failed: Shopper not assigned to this order");
      return res
        .status(403)
        .json({ error: "You are not assigned to this order" });
    }

    // Get current timestamp for updated_at
    const currentTimestamp = new Date().toISOString();

    // Update the order status
    const data = await hasuraClient.request<{
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

    console.log("Order status updated successfully:", data.update_Orders_by_pk);

    return res.status(200).json({
      success: true,
      order: data.update_Orders_by_pk,
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
