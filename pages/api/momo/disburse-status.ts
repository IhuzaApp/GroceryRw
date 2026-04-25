import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ORDER_TRANSACTION_BY_REF = gql`
  query GetOrderTransactionByRef($reference_id: String!) {
    order_transactions(where: { reference_id: { _eq: $reference_id } }) {
      id
      status
      order_id
      amount
    }
  }
`;

const UPDATE_ORDER_TRANSACTION_STATUS = gql`
  mutation UpdateOrderTransactionStatus(
    $id: uuid!
    $status: String!
    $mtn_response: String!
    $updated_at: timestamptz!
  ) {
    update_order_transactions(
      where: { id: { _eq: $id }, status: { _neq: "SUCCESSFUL" } }
      _set: {
        status: $status
        mtn_response: $mtn_response
        updated_at: $updated_at
      }
    ) {
      affected_rows
      returning {
        id
        status
      }
    }
  }
`;

/**
 * Check MoMo Disbursement API Transfer status.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { referenceId } = req.query;

  if (!referenceId || typeof referenceId !== "string") {
    return res.status(400).json({ error: "referenceId is required" });
  }

  try {
    const data = await momoService.getTransferStatus(referenceId);
    console.log("✅ [MoMo Disbursement Status] Real status received:", data.status);

    const newStatus =
      data.status === "SUCCESSFUL"
        ? "SUCCESSFUL"
        : data.status === "PENDING"
          ? "PENDING"
          : "FAILED";

    if (hasuraClient) {
      try {
        const orderTransRes = await hasuraClient.request<{
          order_transactions: any[];
        }>(GET_ORDER_TRANSACTION_BY_REF, {
          reference_id: referenceId,
        });

        const orderTransaction = orderTransRes.order_transactions[0];

        if (orderTransaction && orderTransaction.status !== "SUCCESSFUL") {
          if (newStatus !== "PENDING") {
            await hasuraClient.request(UPDATE_ORDER_TRANSACTION_STATUS, {
              id: orderTransaction.id,
              status: newStatus,
              mtn_response: JSON.stringify(data),
              updated_at: new Date().toISOString(),
            });
            console.log(`📝 [MoMo Disbursement Status] Order Transaction ${orderTransaction.id} updated to ${newStatus}`);
          }
        }
      } catch (dbError) {
        console.error("❌ [MoMo Disbursement Status] DB Update Error:", dbError);
      }
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("💥 [MoMo Disbursement Status] Exception:", error);
    return res.status(500).json({
      error: "MoMo status check failed",
      details: error.message,
    });
  }
}
