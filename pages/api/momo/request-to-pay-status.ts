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
  mutation UpdateSubscriptionStatus($id: uuid!, $status: String!, $mtn_response: String!, $update_at: String!) {
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

const UPDATE_REEL_ORDER_STATUS = gql`
  mutation UpdateReelOrderStatus($id: uuid!, $status: String!) {
    update_reel_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

const GET_ORDER_TRANSACTION_BY_REF = gql`
  query GetOrderTransactionByRef($reference_id: String!) {
    order_transactions(where: { reference_id: { _eq: $reference_id } }) {
      id
      status
      order_id
      restaurant_order_id
      business_order_id
      reel_order_id
      amount
      user_id
    }
  }
`;

const UPDATE_ORDER_TRANSACTION_STATUS = gql`
  mutation UpdateOrderTransactionStatus($id: uuid!, $status: String!, $mtn_response: String!, $updated_at: String!) {
    update_order_transactions(
      where: { id: { _eq: $id }, status: { _neq: "SUCCESSFUL" } },
      _set: { status: $status, mtn_response: $mtn_response, updated_at: $updated_at }
    ) {
      affected_rows
      returning {
        id
        status
      }
    }
  }
`;

const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: uuid!) {
  Orders_by_pk(id: $id) {
    user_id
    shop_id
  }
}
`;

const GET_FOOD_ORDER_DETAILS = gql`
  query GetFoodOrderDetails($id: uuid!) {
  restaurant_orders_by_pk(id: $id) {
    user_id
    restaurant_id
  }
}
`;

const GET_ORDERS_BY_COMBINED_ID = gql`
  query GetOrdersByCombinedId($combined_id: uuid!) {
  Orders(where: { combined_order_id: { _eq: $combined_id } }) {
    user_id
    shop_id
  }
}
`;

const CLEAR_CART = gql`
  mutation ClearCart($user_id: uuid!, $shop_id: uuid!) {
  delete_Cart_Items(
    where: {
    Cart: {
      user_id: { _eq: $user_id },
      shop_id: { _eq: $shop_id }
    }
  }
  ) {
    affected_rows
  }
  delete_Carts(
    where: {
    user_id: { _eq: $user_id },
    shop_id: { _eq: $shop_id },
    is_active: { _eq: true }
  }
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

    const newStatus = data.status === "SUCCESSFUL" ? "SUCCESSFUL" : data.status === "PENDING" ? "PENDING" : "FAILED";

    if (hasuraClient) {
      try {
        // 1. Check order_transactions first (New standard for shopping)
        const orderTransRes = await hasuraClient.request<{ order_transactions: any[] }>(GET_ORDER_TRANSACTION_BY_REF, {
          reference_id: referenceId,
        });

        const orderTransaction = orderTransRes.order_transactions[0];

        if (orderTransaction) {
          // Idempotency check: if already successful, skip
          if (orderTransaction.status === "SUCCESSFUL") {
            console.log(`ℹ️[MoMo Status] Order Transaction ${ orderTransaction.id } already SUCCESSFUL.Skipping.`);
            return res.status(200).json(data);
          }

          if (newStatus !== "PENDING") {
            const updateRes = await hasuraClient.request<{ update_order_transactions: { affected_rows: number } }>(UPDATE_ORDER_TRANSACTION_STATUS, {
              id: orderTransaction.id,
              status: newStatus,
              mtn_response: JSON.stringify(data),
              updated_at: new Date().toISOString(),
            });

            if (updateRes.update_order_transactions.affected_rows === 0 && newStatus === "SUCCESSFUL") {
              console.log(`ℹ️[MoMo Status] Order Transaction ${ orderTransaction.id } was already updated by another process.Skipping activation.`);
              return res.status(200).json(data);
            }

            console.log(`📝[MoMo Status] Order Transaction ${ orderTransaction.id } updated to ${ newStatus } `);

            const orderId = orderTransaction.order_id;
            const restaurantOrderId = orderTransaction.restaurant_order_id;
            const businessOrderId = orderTransaction.business_order_id;
            const reelOrderId = orderTransaction.reel_order_id;

            if (newStatus === "SUCCESSFUL") {
              // SUCCESS: Activate orders and CLEAR CART
              if (orderId) {
                console.log(`🚀[MoMo Status] Activating grocery order: ${ orderId } `);
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: orderId, status: "PENDING" });
                await hasuraClient.request(UPDATE_COMBINED_ORDER_STATUS, { combined_id: orderId, status: "PENDING" });

                // Clear cart for grocery
                const orderDetails = await hasuraClient.request<{ Orders_by_pk: any }>(GET_ORDER_DETAILS, { id: orderId });
                if (orderDetails.Orders_by_pk) {
                  const { user_id, shop_id } = orderDetails.Orders_by_pk;
                  console.log(`🧹[MoMo Status] Clearing grocery cart for User ${ user_id }, Shop ${ shop_id } `);
                  await hasuraClient.request(CLEAR_CART, { user_id, shop_id });
                } else {
                  // If not a direct order ID, it might be a combined order ID
                  const combinedOrders = await hasuraClient.request<{ Orders: any[] }>(GET_ORDERS_BY_COMBINED_ID, { combined_id: orderId });
                  if (combinedOrders.Orders && combinedOrders.Orders.length > 0) {
                    console.log(`🧹[MoMo Status] Clearing carts for combined order: ${ orderId } (${ combinedOrders.Orders.length } stores)`);
                    for (const order of combinedOrders.Orders) {
                      await hasuraClient.request(CLEAR_CART, { user_id: order.user_id, shop_id: order.shop_id });
                    }
                  }
                }
              }

              if (restaurantOrderId) {
                console.log(`🚀[MoMo Status] Activating food order: ${ restaurantOrderId } `);
                await hasuraClient.request(UPDATE_FOOD_ORDER_STATUS, { id: restaurantOrderId, status: "WAITING_FOR_CONFIRMATION" });

                // Clear cart for food
                const foodDetails = await hasuraClient.request<{ restaurant_orders_by_pk: any }>(GET_FOOD_ORDER_DETAILS, { id: restaurantOrderId });
                if (foodDetails.restaurant_orders_by_pk) {
                  const { user_id, restaurant_id } = foodDetails.restaurant_orders_by_pk;
                  console.log(`🧹[MoMo Status] Clearing food cart for User ${ user_id }, Restaurant ${ restaurant_id } `);
                  await hasuraClient.request(CLEAR_CART, { user_id, shop_id: restaurant_id });
                }
              }

              if (businessOrderId) {
                console.log(`🚀[MoMo Status] Activating business order: ${ businessOrderId } `);
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: businessOrderId, status: "PENDING" });
              }

              if (reelOrderId) {
                console.log(`🚀[MoMo Status] Activating reel order: ${ reelOrderId } `);
                await hasuraClient.request(UPDATE_REEL_ORDER_STATUS, { id: reelOrderId, status: "PENDING" });
              }
            } else if (newStatus === "FAILED") {
              // FAILURE: Mark orders as PAYMENT_FAILED
              if (orderId) {
                console.log(`❌[MoMo Status] Payment FAILED for grocery order: ${ orderId } `);
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: orderId, status: "PAYMENT_FAILED" });
                await hasuraClient.request(UPDATE_COMBINED_ORDER_STATUS, { combined_id: orderId, status: "PAYMENT_FAILED" });
              }
              if (restaurantOrderId) {
                console.log(`❌[MoMo Status] Payment FAILED for food order: ${ restaurantOrderId } `);
                await hasuraClient.request(UPDATE_FOOD_ORDER_STATUS, { id: restaurantOrderId, status: "PAYMENT_FAILED" });
              }
              if (businessOrderId) {
                console.log(`❌[MoMo Status] Payment FAILED for business order: ${ businessOrderId } `);
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: businessOrderId, status: "PAYMENT_FAILED" });
              }
              if (reelOrderId) {
                console.log(`❌[MoMo Status] Payment FAILED for reel order: ${ reelOrderId } `);
                await hasuraClient.request(UPDATE_REEL_ORDER_STATUS, { id: reelOrderId, status: "PAYMENT_FAILED" });
              }
            }
          }
          return res.status(200).json(data);
        }

        // 2. Check Wallet_Transactions (Legacy shopping/Other)
        const transRes = await hasuraClient.request<{ Wallet_Transactions: any[] }>(GET_TRANSACTION_BY_REF, {
          reference_id: referenceId,
        });

        const transaction = transRes.Wallet_Transactions[0];

        if (transaction) {
          if (newStatus !== "PENDING") {
            await hasuraClient.request(UPDATE_TRANSACTION_STATUS, {
              id: transaction.id,
              status: newStatus,
              mtn_response: JSON.stringify(data),
            });
            console.log(`📝[MoMo Status] Wallet Transaction ${ transaction.id } updated to ${ newStatus } `);

            if (newStatus === "SUCCESSFUL") {
              const orderId = transaction.related_order_id;
              const restaurantOrderId = transaction.related_restaurant_order_id;
              const businessOrderId = transaction.relate_business_order_id;

              if (orderId) {
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: orderId, status: "PENDING" });
                await hasuraClient.request(UPDATE_COMBINED_ORDER_STATUS, { combined_id: orderId, status: "PENDING" });
              }
              if (restaurantOrderId) {
                await hasuraClient.request(UPDATE_FOOD_ORDER_STATUS, { id: restaurantOrderId, status: "WAITING_FOR_CONFIRMATION" });
              }
              if (businessOrderId) {
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: businessOrderId, status: "PENDING" });
              }
            } else if (newStatus === "FAILED") {
              const orderId = transaction.related_order_id;
              const restaurantOrderId = transaction.related_restaurant_order_id;
              const businessOrderId = transaction.relate_business_order_id;

              if (orderId) {
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: orderId, status: "PAYMENT_FAILED" });
                await hasuraClient.request(UPDATE_COMBINED_ORDER_STATUS, { combined_id: orderId, status: "PAYMENT_FAILED" });
              }
              if (restaurantOrderId) {
                await hasuraClient.request(UPDATE_FOOD_ORDER_STATUS, { id: restaurantOrderId, status: "PAYMENT_FAILED" });
              }
              if (businessOrderId) {
                await hasuraClient.request(UPDATE_ORDER_STATUS, { id: businessOrderId, status: "PAYMENT_FAILED" });
              }
            }

            // Wallet balance update logic (Personal Wallet)
            if (newStatus === "SUCCESSFUL" && transaction.wallet_id) {
              // ... (Existing wallet balance update logic remains same)
              try {
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
                  console.log(`✅[MoMo Status] Wallet ${ transaction.wallet_id } updated: ${ currentBalance } -> ${ newBalance } `);
                }
              } catch (walletError) {
                console.error("❌ [MoMo Status] Failed to update wallet balance:", walletError);
              }
            }
          }
          return res.status(200).json(data);
        }

        // 3. Check personalWalletTransactions (Direct top-up)
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

            if (newStatus === "SUCCESSFUL") {
              // Update balance logic...
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
                  console.log(`✅[MoMo Status] Personal Wallet ${ personalTransaction.wallet_id } updated: ${ currentBalance } -> ${ newBalance } `);
                }
              } catch (walletError) {
                console.error("❌ [MoMo Status] Failed to update personal wallet balance:", walletError);
              }
            }
          }
          return res.status(200).json(data);
        }

        // 4. Check subscription_transactions (POS Registration/Plan)
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

            if (newStatus === "SUCCESSFUL") {
              await hasuraClient.request(ACTIVATE_SUBSCRIPTION, {
                id: subscription.subscription_id,
                status: "active"
              });

              const subDetailRes = await hasuraClient.request<{ shop_subscriptions_by_pk: any }>(GET_SUBSCRIPTION_DETAILS, {
                id: subscription.subscription_id
              });

              const subDetails = subDetailRes.shop_subscriptions_by_pk;
              const restaurantId = subDetails?.restaurant_id;
              const shopId = subDetails?.shop_id;

              if (restaurantId && restaurantId !== "00000000-0000-0000-0000-000000000000") {
                await hasuraClient.request(ACTIVATE_RESTAURANT, { id: restaurantId });
              } else if (shopId && shopId !== "00000000-0000-0000-0000-000000000000") {
                await hasuraClient.request(ACTIVATE_SHOP, { id: shopId });
              }

              await hasuraClient.request(ACTIVATE_INVOICE, { subscription_id: subscription.subscription_id });
            }
          }
          return res.status(200).json(data);
        }

        console.log(`⚠️[MoMo Status] No pending transaction found for reference ${ referenceId }`);
      } catch (dbError: any) {
        console.error("❌ [MoMo Status] Failed to update transaction in DB:", dbError);
        return res.status(500).json({ error: "Database update failed", details: dbError.message });
      }
    }

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("💥 [MoMo Status] Exception:", error);
    return res.status(500).json({ error: "Status check failed", details: error.message, referenceId });
  }
}

