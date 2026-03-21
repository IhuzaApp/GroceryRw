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

const GET_PERSONAL_TRANSACTION_BY_REF = gql`
  query GetPersonalTransactionByRef($reference_id: String!) {
    personalWalletTransactions(where: { reference_id: { _eq: $reference_id }, status: { _eq: "PENDING" } }) {
      id
      wallet_id
      amount
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

const UPDATE_PERSONAL_TRANSACTION_STATUS = gql`
  mutation UpdatePersonalTransactionStatus($id: uuid!, $status: String!, $mtn_response: String!) {
    update_personalWalletTransactions_by_pk(
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

const GET_SUBSCRIPTION_DETAILS = gql`
  query GetSubscriptionDetails($id: uuid!) {
    shop_subscriptions_by_pk(id: $id) {
      restaurant_id
      shop_id
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
    update_Shops_by_pk(pk_columns: { id: $id }, _set: { is_active: true }) {
      id
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

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: uuid!, $status: String!) {
    update_Orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

const UPDATE_FOOD_ORDER_STATUS = gql`
  mutation UpdateFoodOrderStatus($id: uuid!, $status: String!) {
    update_restaurant_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

const UPDATE_COMBINED_ORDER_STATUS = gql`
  mutation UpdateCombinedOrderStatus($combined_id: uuid!, $status: String!) {
    update_Orders(where: { combined_order_id: { _eq: $combined_id } }, _set: { status: $status }) {
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
              const orderId = transaction.related_order_id;
              const restaurantOrderId = transaction.related_restaurant_order_id;
              const businessOrderId = transaction.relate_business_order_id;

              if (orderId) {
                console.log(`🚀 [MoMo Status] Activating grocery order: ${orderId}`);
                // Try updating as single order first, then as combined if that's what it is
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: orderId, status: "PENDING" });
                await hasuraClient.request(UPDATE_COMBINED_ORDER_STATUS, { combined_id: orderId, status: "PENDING" });
              }

              if (restaurantOrderId) {
                console.log(`🚀 [MoMo Status] Activating food order: ${restaurantOrderId}`);
                await hasuraClient.request(UPDATE_FOOD_ORDER_STATUS, { id: restaurantOrderId, status: "WAITING_FOR_CONFIRMATION" });
              }

              if (businessOrderId) {
                console.log(`🚀 [MoMo Status] Activating business order: ${businessOrderId}`);
                // Add business order activation if needed, for now similar to regular orders
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: businessOrderId, status: "PENDING" });
              }

              // Update personal wallet balance if wallet_id is present
              if (transaction.wallet_id) {
                console.log(`💰 [MoMo Status] Updating wallet ${transaction.wallet_id} balance...`);
                try {
                  // Fetch current balance
                  const walletRes = await hasuraClient.request<{ personalWallet: Array<{ balance: string }> }>(
                    gql`
                      query GetWalletBalance($id: uuid!) {
                        personalWallet(where: { id: { _eq: $id } }) {
                          balance
                        }
                      }
                    `,
                    { id: transaction.wallet_id }
                  );

                  if (walletRes.personalWallet && walletRes.personalWallet.length > 0) {
                    const currentBalance = parseFloat(walletRes.personalWallet[0].balance || "0");
                    const amountToAdd = parseFloat(transaction.amount || "0");
                    const newBalance = currentBalance + amountToAdd;

                    await hasuraClient.request(
                      gql`
                        mutation UpdateWalletBalance($id: uuid!, $balance: String!) {
                          update_personalWallet(
                            where: { id: { _eq: $id } },
                            _set: { balance: $balance, updated_at: "now()" }
                          ) {
                            affected_rows
                          }
                        }
                      `,
                      {
                        id: transaction.wallet_id,
                        balance: newBalance.toFixed(2)
                      }
                    );
                    console.log(`✅ [MoMo Status] Wallet ${transaction.wallet_id} updated: ${currentBalance} -> ${newBalance}`);
                  }
                } catch (walletError) {
                  console.error("❌ [MoMo Status] Failed to update wallet balance:", walletError);
                }
              }
            }
          }
        } else {
          // 2b. Check personalWalletTransactions
          const personalRes = await hasuraClient.request<{ personalWalletTransactions: any[] }>(GET_PERSONAL_TRANSACTION_BY_REF, {
            reference_id: referenceId,
          });
          const personalTransaction = personalRes.personalWalletTransactions[0];

          if (personalTransaction) {
            if (newStatus !== "PENDING") {
              await hasuraClient.request(UPDATE_PERSONAL_TRANSACTION_STATUS, {
                id: personalTransaction.id,
                status: newStatus,
                mtn_response: JSON.stringify(data),
              });
              console.log(`📝 [MoMo Status] Personal Wallet Transaction ${personalTransaction.id} updated to ${newStatus}`);

              if (newStatus === "SUCCESSFUL") {
                console.log(`💰 [MoMo Status] Updating personal wallet ${personalTransaction.wallet_id} balance...`);
                try {
                  const walletRes = await hasuraClient.request<{ personalWallet: Array<{ balance: string }> }>(
                    gql`
                      query GetPersonalWalletBalance($id: uuid!) {
                        personalWallet(where: { id: { _eq: $id } }) {
                          balance
                        }
                      }
                    `,
                    { id: personalTransaction.wallet_id }
                  );

                  if (walletRes.personalWallet && walletRes.personalWallet.length > 0) {
                    const currentBalance = parseFloat(walletRes.personalWallet[0].balance || "0");
                    const amountToAdd = parseFloat(personalTransaction.amount || "0");
                    const newBalance = currentBalance + amountToAdd;

                    await hasuraClient.request(
                      gql`
                        mutation UpdatePersonalWalletBalance($id: uuid!, $balance: String!) {
                          update_personalWallet(
                            where: { id: { _eq: $id } },
                            _set: { balance: $balance, updated_at: "now()" }
                          ) {
                            affected_rows
                          }
                        }
                      `,
                      {
                        id: personalTransaction.wallet_id,
                        balance: newBalance.toFixed(2)
                      }
                    );
                    console.log(`✅ [MoMo Status] Personal Wallet ${personalTransaction.wallet_id} updated: ${currentBalance} -> ${newBalance}`);
                  }
                } catch (walletError) {
                  console.error("❌ [MoMo Status] Failed to update personal wallet balance:", walletError);
                }
              }
            }
          } else {
            // 3. If not in Wallet_Transactions or personalWalletTransactions, check subscription_transactions
            const subRes = await hasuraClient.request<{ subscription_transactions: any[] }>(GET_SUBSCRIPTION_BY_REF, {
              reference_id: referenceId,
            });
            // ... (rest of the existing logic for subscription_transactions)

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

                  // Fetch subscription details separately to avoid missing relationship
                  const subDetailRes = await hasuraClient.request<{ shop_subscriptions_by_pk: any }>(GET_SUBSCRIPTION_DETAILS, {
                    id: subscription.subscription_id
                  });

                  const subDetails = subDetailRes.shop_subscriptions_by_pk;

                  // Also activate the business shell
                  const restaurantId = subDetails?.restaurant_id;
                  const shopId = subDetails?.shop_id;

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
        }
      } catch (dbError: any) {
        console.error("❌ [MoMo Status] Failed to update transaction in DB:", dbError);
        return res.status(500).json({
          error: "Database update failed",
          details: dbError.message,
          status: data.status
        });
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
