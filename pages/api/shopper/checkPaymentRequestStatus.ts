import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PAYMENT_REQUEST_STATUS = gql`
  query GetPaymentRequestStatus($order_id: uuid!) {
    payment_requests(
      where: { order_id: { _eq: $order_id } }
      order_by: { created_at: desc }
      limit: 1
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
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", ["POST", "GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const orderId = req.method === "POST" ? req.body.orderId : req.query.orderId;

  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("GraphQL client is not initialized.");
    }

    const response = await hasuraClient.request<any>(
      GET_PAYMENT_REQUEST_STATUS,
      {
        order_id: orderId,
      }
    );

    const paymentRequest = response.payment_requests[0];

    if (!paymentRequest) {
      return res.status(200).json({
        exists: false,
        status: null,
      });
    }

    return res.status(200).json({
      exists: true,
      status: paymentRequest.status,
      id: paymentRequest.id,
    });
  } catch (error) {
    console.error("Failed to fetch payment request status:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch status",
    });
  }
}
