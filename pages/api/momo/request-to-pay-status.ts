import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_TRANSACTION_BY_REF = gql`
  query GetTransactionByRef($reference_id: String!) {
    Wallet_Transactions(where: { reference_id: { _eq: $reference_id }, status: { _eq: "PENDING" } }) {
      id
      wallet_id
      amount
      related_order_id
      relate_business_order_id
      related_restaurant_order_id
      related_reel_orderId
    }
  }
`;

const UPDATE_TRANSACTION_STATUS = gql`
  mutation UpdateTransactionStatus($id: uuid!, $status: String!, $mtn_response: String!) {
    update_Wallet_Transactions_by_pk(
      pk_columns: { id: $id },
      _set: { status: $status, mtn_response: $mtn_response }
    ) {
      id
    }
  }
`;

const GET_SUBSCRIPTION_BY_REF = gql`
  query GetSubscriptionByRef($reference_id: String!) {
    subscription_transactions(where: { reference_id: { _eq: $reference_id }, status: { _eq: "PENDING" } }) {
      id
      subscription_id
      amount
    }
  }
`;

const UPDATE_SUBSCRIPTION_STATUS = gql`
  mutation UpdateSubscriptionStatus($id: uuid!, $status: String!, $mtn_response: String!, $update_at: timestamptz!) {
    update_subscription_transactions_by_pk(
      pk_columns: { id: $id },
      _set: { status: $status, mtn_response: $mtn_response, update_at: $update_at }
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

    // 2. Update the database - Check Wallet_Transactions first
    if (hasuraClient) {
      try {
        const transRes = await hasuraClient.request<{ Wallet_Transactions: any[] }>(GET_TRANSACTION_BY_REF, {
          reference_id: referenceId,
        });

        const transaction = transRes.Wallet_Transactions[0];
        const newStatus = data.status === "SUCCESSFUL" ? "SUCCESSFUL" : data.status === "PENDING" ? "PENDING" : "FAILED";

        if (transaction) {
          if (newStatus !== "PENDING") {
            await hasuraClient.request(UPDATE_TRANSACTION_STATUS, {
              id: transaction.id,
              status: newStatus,
              mtn_response: JSON.stringify(data),
            });
            console.log(`📝 [MoMo Status] Wallet Transaction ${transaction.id} updated to ${newStatus}`);

            // Trigger Business Logic if SUCCESSFUL
            if (newStatus === "SUCCESSFUL") {
              const orderId = transaction.related_order_id || transaction.relate_business_order_id || transaction.related_restaurant_order_id;
              if (orderId) {
                console.log(`🚀 [MoMo Status] Activating order/subscription: ${orderId}`);
              }
            }
          }
        } else {
          // 3. If not in Wallet_Transactions, check subscription_transactions
          const subRes = await hasuraClient.request<{ subscription_transactions: any[] }>(GET_SUBSCRIPTION_BY_REF, {
            reference_id: referenceId,
          });

          const subscription = subRes.subscription_transactions[0];
          if (subscription) {
            if (newStatus !== "PENDING") {
              await hasuraClient.request(UPDATE_SUBSCRIPTION_STATUS, {
                id: subscription.id,
                status: newStatus,
                mtn_response: JSON.stringify(data),
                update_at: new Date().toISOString(),
              });
              console.log(`📝 [MoMo Status] Subscription Transaction ${subscription.id} updated to ${newStatus}`);
              
              if (newStatus === "SUCCESSFUL") {
                console.log(`🚀 [MoMo Status] Activating shop subscription: ${subscription.subscription_id}`);
                await hasuraClient.request(ACTIVATE_SUBSCRIPTION, {
                  id: subscription.subscription_id,
                  status: "active"
                });
              }
            }
          } else {
            console.log(`⚠️ [MoMo Status] No pending transaction found for reference ${referenceId}`);
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
