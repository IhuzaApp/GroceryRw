import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { insertSystemLog } from "../queries/system-logs";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const CREATE_ORDER_TRANSACTION = gql`
  mutation CreateOrderTransaction($object: order_transactions_insert_input!) {
    insert_order_transactions_one(object: $object) {
      id
    }
  }
`;

const UPDATE_ORDER_TRANSACTION_RESPONSE = gql`
  mutation UpdateOrderTransactionResponse($id: uuid!, $mtn_response: String!) {
    update_order_transactions_by_pk(
      pk_columns: { id: $id }
      _set: { mtn_response: $mtn_response }
    ) {
      id
    }
  }
`;

/**
 * MoMo Disbursement API - Transfer to Merchant
 * Pushes payment FROM the platform TO the store (payee).
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
    momoCode, // The merchant code
    orderId,
    orderType = "regular", // Add orderType (regular, business, restaurant, reel, package)
    externalId,
    payerMessage = "Shopper Payment for Items",
    payeeNote = "Payment via Plas Grocery",
    walletId,
  } = req.body;

  console.log("📝 [MoMo Disbursement] Payload:", {
    amount,
    momoCode,
    orderId,
    orderType,
    walletId,
  });

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  const userId = session?.user?.id;

  if (!amount || !momoCode) {
    return res.status(400).json({
      error: "Missing required fields: amount, momoCode",
    });
  }

  const referenceId = randomUUID();
  let dbTransactionId: string | null = null;

  try {
    // 1. Create a PENDING transaction record
    if (hasuraClient) {
      try {
        // Map orderId to the correct column based on orderType
        const transactionObject: any = {
          wallet_id: walletId || null,
          amount: String(amount),
          currency,
          phone: momoCode,
          reference_id: referenceId,
          type: "disbursement",
          status: "PENDING",
          mtn_response: JSON.stringify({
            status: "INITIATED",
            referenceId,
            momoCode,
          }),
          user_id: userId || null,
        };

        if (orderType === "business") {
          transactionObject.business_order_id = orderId;
        } else if (orderType === "restaurant") {
          transactionObject.restaurant_order_id = orderId;
        } else if (orderType === "reel") {
          transactionObject.reel_order_id = orderId;
        } else if (orderType === "package") {
          transactionObject.package_id = orderId;
        } else {
          transactionObject.order_id = orderId;
        }

        const dbRes = await hasuraClient.request<{
          insert_order_transactions_one: { id: string };
        }>(CREATE_ORDER_TRANSACTION, {
          object: transactionObject,
        });
        dbTransactionId = dbRes.insert_order_transactions_one.id;
      } catch (dbError: any) {
        console.error("❌ [MoMo Disbursement] DB Init Error:", dbError);
        await insertSystemLog(
          "error",
          `MoMo Disburse DB Init Error: ${dbError.message || "Unknown"}`,
          "MomoDisburseToMerchantAPI:DBInit",
          { orderId, momoCode, error: dbError.message || dbError }
        );
      }
    }

    // 2. Call MoMo Transfer API (Disbursement)
    const momoResult = await momoService.transfer({
      amount,
      currency,
      payeeId: momoCode,
      partyIdType: "MSISDN", // Merchant codes often work as MSISDN in MTNR
      externalId: externalId || orderId || `DISB-${Date.now()}`,
      payerMessage,
      payeeNote,
      referenceId,
    });

    // 3. Update transaction with response
    if (hasuraClient && dbTransactionId) {
      try {
        await hasuraClient.request(UPDATE_ORDER_TRANSACTION_RESPONSE, {
          id: dbTransactionId,
          mtn_response: JSON.stringify(momoResult),
        });
      } catch (updateError: any) {
        console.error("❌ [MoMo Disbursement] DB Update Error:", updateError);
        await insertSystemLog(
          "error",
          `MoMo Disburse DB Update Error: ${updateError.message || "Unknown"}`,
          "MomoDisburseToMerchantAPI:DBUpdate",
          { dbTransactionId, error: updateError.message || updateError }
        );
      }
    }

    return res.status(200).json({
      referenceId,
      message: "Disbursement request sent to merchant",
      status: "PENDING",
    });
  } catch (error: any) {
    console.error("💥 [MoMo Disbursement] Exception:", error);

    if (hasuraClient && dbTransactionId) {
      try {
        await hasuraClient.request(
          gql`
            mutation UpdateOrderTransactionFailed(
              $id: uuid!
              $mtn_response: String!
            ) {
              update_order_transactions_by_pk(
                pk_columns: { id: $id }
                _set: { status: "FAILED", mtn_response: $mtn_response }
              ) {
                id
              }
            }
          `,
          {
            id: dbTransactionId,
            mtn_response: JSON.stringify({ error: error.message }),
          }
        );
      } catch (e) {}
    }

    await insertSystemLog(
      "error",
      `MoMo Disburse Exception: ${error.message || "Unknown"}`,
      "MomoDisburseToMerchantAPI:Main",
      { orderId, momoCode, error: error.message || error }
    );

    return res.status(500).json({
      error: "MoMo disbursement failed",
      details: error.message,
    });
  }
}
