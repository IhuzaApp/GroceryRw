import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CREATE_PENDING_TRANSACTION = gql`
  mutation CreatePendingMoMoTransaction($transaction: Wallet_Transactions_insert_input!) {
    insert_Wallet_Transactions_one(object: $transaction) {
      id
    }
  }
`;

/**
 * MoMo Collection API - RequestToPay
 * Collects payment FROM the customer (payer) to the merchant.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    amount,
    currency = "RWF",
    payerNumber,
    externalId,
    payerMessage = "Payment for your order",
    payeeNote = "Thank you for your order",
    walletId, // Optional: if provided, we'll link the transaction to a wallet
    orderId,  // Optional: link to order
  } = req.body;

  if (!amount || !payerNumber) {
    return res.status(400).json({
      error: "Missing required fields: amount, payerNumber",
    });
  }

  try {
    const { referenceId } = await momoService.requestToPay({
      amount,
      currency,
      externalId: externalId || `ORDER-${Date.now()}`,
      payerNumber,
      payerMessage,
      payeeNote,
    });

    // Record the pending transaction in the database if walletId or orderId is provided
    if (hasuraClient && (walletId || orderId)) {
      try {
        await hasuraClient.request(CREATE_PENDING_TRANSACTION, {
          transaction: {
            wallet_id: walletId || null,
            related_order_id: orderId || null,
            amount: String(amount),
            type: "payment",
            status: "pending",
            description: `MoMo Payment Pending | Ref: ${referenceId} | Phone: ${payerNumber}`,
          },
        });
        console.log("📝 [MoMo RequestToPay] Pending transaction recorded");
      } catch (dbError) {
        console.error("❌ [MoMo RequestToPay] Failed to record pending transaction:", dbError);
        // We still return the referenceId because the MoMo request was successful
      }
    }

    return res.status(200).json({
      referenceId,
      message: "Payment request sent – approve on your phone",
      status: "PENDING",
    });
  } catch (error: any) {
    console.error("💥 [MoMo RequestToPay] Exception:", error);
    return res.status(500).json({
      error: "MoMo request failed",
      details: error.message,
    });
  }
}


