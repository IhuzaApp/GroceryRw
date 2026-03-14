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
      shop_subscription {
        restaurant_id
        shop_id
      }
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

const ACTIVATE_RESTAURANT = gql`
  mutation ActivateRestaurant($id: uuid!) {
    update_Restaurants_by_pk(pk_columns: { id: $id }, _set: { is_active: true, verified: true }) {
      id
    }
  }
`;

const ACTIVATE_SHOP = gql`
  mutation ActivateShop($id: uuid!) {
    update_Shops_by_pk(pk_columns: { shop_id: $id }, _set: { is_active: true }) {
      shop_id
    }
  }
`;

const ACTIVATE_INVOICE = gql`
  mutation ActivateInvoice($subscription_id: uuid!) {
    update_subscription_invoices(
      where: { shopSubscription_id: { _eq: $subscription_id } },
      _set: { status: "paid", paid_at: "now()" }
    ) {
      affected_rows
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

                // Also activate the business shell
                const restaurantId = subscription.shop_subscription?.restaurant_id;
                const shopId = subscription.shop_subscription?.shop_id;

                if (restaurantId && restaurantId !== "00000000-0000-0000-0000-000000000000") {
                  console.log(`🚀 [MoMo Status] Activating Restaurant shell: ${restaurantId}`);
                  await hasuraClient.request(ACTIVATE_RESTAURANT, { id: restaurantId });
                } else if (shopId && shopId !== "00000000-0000-0000-0000-000000000000") {
                  console.log(`🚀 [MoMo Status] Activating Shop shell: ${shopId}`);
                  await hasuraClient.request(ACTIVATE_SHOP, { id: shopId });
                }

                // Also activate invoice
                console.log(`🚀 [MoMo Status] Marking invoice as paid for sub: ${subscription.subscription_id}`);
                await hasuraClient.request(ACTIVATE_INVOICE, { subscription_id: subscription.subscription_id });
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
