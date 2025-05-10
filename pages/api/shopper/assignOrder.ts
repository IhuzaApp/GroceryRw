import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL mutation to assign a shopper and update status
const ASSIGN_ORDER = gql`
  mutation AssignOrder(
    $id: uuid!
    $shopper_id: uuid!
    $updated_at: timestamptz!
  ) {
    update_Orders_by_pk(
      pk_columns: { id: $id }
      _set: {
        shopper_id: $shopper_id
        status: "shopping"
        updated_at: $updated_at
      }
    ) {
      id
      shopper_id
      status
      updated_at
    }
  }
`;

// Define interface for session user
interface SessionUser {
  user?: {
    id?: string;
  };
}

// Define interface for order response
interface OrderResponse {
  update_Orders_by_pk: {
    id: string;
    shopper_id: string;
    status: string;
    updated_at: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Authenticate the shopper
  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as SessionUser;
  const userId = session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId } = req.body;
  if (typeof orderId !== "string") {
    return res.status(400).json({ error: "Missing or invalid orderId" });
  }

  try {
    // Get current timestamp for updated_at
    const currentTimestamp = new Date().toISOString();

    const data = await hasuraClient.request<OrderResponse>(ASSIGN_ORDER, {
      id: orderId,
      shopper_id: userId,
      updated_at: currentTimestamp,
    });

    return res
      .status(200)
      .json({ success: true, order: data.update_Orders_by_pk });
  } catch (error) {
    console.error("Error assigning order:", error);
    return res.status(500).json({ error: "Failed to assign order" });
  }
}
