import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_TRANSACTION_STATUS = gql`
  query GetTransactionStatus($order_id: uuid!) {
    order_transactions(
      where: {
        _or: [
          { order_id: { _eq: $order_id } }
          { reel_order_id: { _eq: $order_id } }
          { business_order_id: { _eq: $order_id } }
          { restaurant_order_id: { _eq: $order_id } }
        ]
        status: { _eq: "SUCCESSFUL" }
      }
    ) {
      id
      status
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId } = req.query;
  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ error: "orderId is required" });
  }

  try {
    if (!hasuraClient) throw new Error("No hasura client");
    const transRes = await hasuraClient.request<{
      order_transactions: any[];
    }>(GET_TRANSACTION_STATUS, { order_id: orderId });

    if (transRes.order_transactions.length > 0) {
      return res.status(200).json({ isPaid: true });
    }
    return res.status(200).json({ isPaid: false });
  } catch (error) {
    console.error("Error fetching transaction status:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
