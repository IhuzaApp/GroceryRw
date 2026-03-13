import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_TRANSACTION_BY_REF = gql`
  query GetTransactionByRef($refPattern: String!) {
    Wallet_Transactions(where: { description: { _like: $refPattern }, status: { _eq: "pending" } }) {
      id
      wallet_id
      amount
      related_order_id
    }
  }
`;

const UPDATE_TRANSACTION_STATUS = gql`
  mutation UpdateTransactionStatus($id: uuid!, $status: String!, $description: String!) {
    update_Wallet_Transactions_by_pk(
      pk_columns: { id: $id },
      _set: { status: $status, description: $description }
    ) {
      id
    }
  }
`;

/**
 * Check MoMo Collection API RequestToPay status.
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
    const data = await momoService.getPaymentStatus(referenceId);
    console.log("✅ [MoMo Status] Real status received:", data.status);

    // Update the database if we find a matching pending transaction
    if (hasuraClient) {
      try {
        const transRes = await hasuraClient.request<{ Wallet_Transactions: any[] }>(GET_TRANSACTION_BY_REF, {
          refPattern: `%${referenceId}%`,
        });

        const transaction = transRes.Wallet_Transactions[0];
        if (transaction) {
          const newStatus = data.status === "SUCCESSFUL" ? "completed" : data.status === "PENDING" ? "pending" : "failed";
          
          if (newStatus !== "pending") {
            await hasuraClient.request(UPDATE_TRANSACTION_STATUS, {
              id: transaction.id,
              status: newStatus,
              description: `MoMo Payment ${data.status} | Ref: ${referenceId} | Date: ${new Date().toISOString()}`,
            });
            console.log(`📝 [MoMo Status] Transaction ${transaction.id} updated to ${newStatus}`);
          }
        }
      } catch (dbError) {
        console.error("❌ [MoMo Status] Failed to update transaction in DB:", dbError);
      }
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("💥 [MoMo Status] Exception:", error);
    return res.status(500).json({
      error: "Status check failed",
      details: error.message,
      referenceId,
    });
  }
}
