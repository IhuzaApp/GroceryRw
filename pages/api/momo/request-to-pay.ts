import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { randomUUID } from "crypto";

const CREATE_PENDING_TRANSACTION = gql`
  mutation CreatePendingMoMoTransaction($transaction: Wallet_Transactions_insert_input!) {
    insert_Wallet_Transactions_one(object: $transaction) {
      id
    }
  }
`;

const UPDATE_TRANSACTION_RESPONSE = gql`
  mutation UpdateMoMoResponse($id: uuid!, $mtn_response: String!) {
    update_Wallet_Transactions_by_pk(
      pk_columns: { id: $id },
      _set: { mtn_response: $mtn_response }
    ) {
      id
    }
  }
`;

const ACTIVATE_SUBSCRIPTION = gql`
  mutation ActivateSubscription($id: uuid!, $status: String!) {
    update_shop_subscriptions_by_pk(
      pk_columns: { id: $id },
      _set: { status: $status }
    ) {
      id
    }
  }
`;

const ENSURE_SUBSCRIPTION_SHELL = gql`
  mutation EnsureSubscriptionShell(
    $id: uuid!,
    $status: String!,
    $start_date: timestamptz!,
    $restaurant_id: uuid,
    $shop_id: uuid,
    $plan_id: uuid
  ) {
    insert_shop_subscriptions_one(
      object: {
        id: $id,
        status: $status,
        start_date: $start_date,
        billing_cycle: "monthly",
        plan_id: $plan_id,
        restaurant_id: $restaurant_id,
        shop_id: $shop_id
      }
      on_conflict: {
        constraint: shop_subscriptions_pkey
        update_columns: [status, updated_at, start_date, end_date]
      }
    ) {
      id
    }
  }
`;

const ADD_SUBSCRIPTION_TRANSACTION = gql`
  mutation addSubscriptionTransactions(
    $amount: String = "", 
    $currency: String = "", 
    $mtn_response: String = "", 
    $phone: String = "", 
    $reference_id: String = "", 
    $status: String = "", 
    $subscription_id: uuid = "", 
    $type: String = ""
  ) {
    insert_subscription_transactions(objects: {
      amount: $amount, 
      currency: $currency, 
      mtn_response: $mtn_response, 
      phone: $phone, 
      reference_id: $reference_id, 
      status: $status, 
      subscription_id: $subscription_id, 
      type: $type
    }) {
      affected_rows
      returning {
        id
      }
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
    walletId,
    orderId,
    businessOrderId,
    restaurantOrderId,
    reelOrderId,
    subscriptionId,
    planId, // Add planId to destructured body
  } = req.body;

  if (!amount || !payerNumber) {
    return res.status(400).json({
      error: "Missing required fields: amount, payerNumber",
    });
  }

  const referenceId = randomUUID();
  let dbTransactionId: string | null = null;
  let isSubscription = !!subscriptionId;

  try {
    if (hasuraClient) {
      // 1. Ensure parent record exists (Subscription Shell) to avoid FK violation
      if (isSubscription) {
        console.log("🛠️ [MoMo RequestToPay] Ensuring subscription shell exists for:", subscriptionId);
        try {
          await hasuraClient.request(ENSURE_SUBSCRIPTION_SHELL, {
            id: subscriptionId,
            status: "pending_payment",
            start_date: new Date().toISOString(),
            restaurant_id: restaurantOrderId || businessOrderId || null,
            shop_id: restaurantOrderId ? "00000000-0000-0000-0000-000000000000" : (businessOrderId || null),
            plan_id: planId || "00000000-0000-0000-0000-000000000000",
          });
        } catch (shellError: any) {
          console.error("⚠️ [MoMo RequestToPay] Note: Subscription shell check result (may already exist):", shellError.message || shellError);
        }
      }

      // 2. Create a PENDING transaction record BEFORE calling MoMo
      try {
        if (isSubscription) {
          const dbRes = await hasuraClient.request<any>(
            ADD_SUBSCRIPTION_TRANSACTION,
            {
              amount: String(amount),
              currency,
              phone: payerNumber,
              reference_id: referenceId,
              status: "PENDING",
              subscription_id: subscriptionId,
              type: "payment",
              mtn_response: "{}",
            }
          );
          dbTransactionId = dbRes.insert_subscription_transactions.returning[0].id;
          console.log("📝 [MoMo RequestToPay] PENDING subscription transaction created:", dbTransactionId);
        } else {
          const dbRes = await hasuraClient.request<{ insert_Wallet_Transactions_one: { id: string } }>(
            CREATE_PENDING_TRANSACTION, 
            {
              transaction: {
                wallet_id: walletId || null,
                related_order_id: orderId || null,
                relate_business_order_id: businessOrderId || null,
                related_restaurant_order_id: restaurantOrderId || null,
                related_reel_orderId: reelOrderId || null,
                amount: String(amount).toString(),
                currency,
                phone: payerNumber,
                reference_id: referenceId,
                type: "payment",
                status: "PENDING",
                description: payerMessage,
              },
            }
          );
          dbTransactionId = dbRes.insert_Wallet_Transactions_one.id;
          console.log("📝 [MoMo RequestToPay] PENDING wallet transaction created:", dbTransactionId);
        }
      } catch (dbError) {
        console.error("❌ [MoMo RequestToPay] Failed to create pending transaction:", dbError);
        // Important: If we fail to create the transaction record, we STILL proceed with MoMo? 
        // User says "You must create the transaction BEFORE calling MoMo". 
        // If it fails, maybe we should stop and let the user know.
        return res.status(500).json({ error: "Failed to initialize transaction in database" });
      }
    }

    // 2. Call MoMo API
    const momoResult = await momoService.requestToPay({
      amount,
      currency,
      externalId: externalId || orderId || `TX-${Date.now()}`,
      payerNumber,
      payerMessage,
      payeeNote,
      referenceId,
    });

    // 3. Update transaction with MoMo response
    if (hasuraClient && dbTransactionId) {
      try {
        if (isSubscription) {
          await hasuraClient.request(gql`
            mutation UpdateSubscriptionResponse($id: uuid!, $mtn_response: String!, $update_at: timestamptz!) {
              update_subscription_transactions_by_pk(
                pk_columns: { id: $id },
                _set: { mtn_response: $mtn_response, update_at: $update_at }
              ) { id }
            }
          `, {
            id: dbTransactionId,
            mtn_response: JSON.stringify(momoResult),
            update_at: new Date().toISOString()
          });
        } else {
          await hasuraClient.request(UPDATE_TRANSACTION_RESPONSE, {
            id: dbTransactionId,
            mtn_response: JSON.stringify(momoResult),
          });
        }
      } catch (updateError) {
        console.error("❌ [MoMo RequestToPay] Failed to update MTN response:", updateError);
      }
    }

    return res.status(200).json({
      referenceId,
      message: "Payment request sent – approve on your phone",
      status: "PENDING",
    });
  } catch (error: any) {
    console.error("💥 [MoMo RequestToPay] Exception:", error);
    
    // If it failed, we should probably update the DB status if we created a record
    if (hasuraClient && dbTransactionId) {
       try {
        if (isSubscription) {
          await hasuraClient.request(gql`
            mutation UpdateSubscriptionFailed($id: uuid!, $mtn_response: String!, $update_at: timestamptz!) {
              update_subscription_transactions_by_pk(
                pk_columns: { id: $id },
                _set: { status: "FAILED", mtn_response: $mtn_response, update_at: $update_at }
              ) { id }
            }
          `, {
            id: dbTransactionId,
            mtn_response: JSON.stringify({ error: error.message }),
            update_at: new Date().toISOString()
          });
        } else {
          await hasuraClient.request(gql`
            mutation UpdateTransactionFailed($id: uuid!, $mtn_response: String!) {
              update_Wallet_Transactions_by_pk(
                pk_columns: { id: $id },
                _set: { status: "FAILED", mtn_response: $mtn_response }
              ) { id }
            }
          `, {
            id: dbTransactionId,
            mtn_response: JSON.stringify({ error: error.message }),
          });
        }
      } catch (failError) {
        console.error("❌ [MoMo RequestToPay] Failed to record failure:", failError);
      }
    }

    return res.status(500).json({
      error: "MoMo request failed",
      details: error.message,
    });
  }
}


