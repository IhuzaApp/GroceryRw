import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { momoService } from "../../../src/lib/momoService";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { insertSystemLog } from "../queries/system-logs";
import { randomUUID } from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const CREATE_PENDING_TRANSACTION = gql`
  mutation CreatePendingMoMoTransaction(
    $transaction: Wallet_Transactions_insert_input!
  ) {
    insert_Wallet_Transactions_one(object: $transaction) {
      id
    }
  }
`;

const CREATE_PENDING_PERSONAL_TRANSACTION = gql`
  mutation CreatePendingPersonalTransaction(
    $transaction: personalWalletTransactions_insert_input!
  ) {
    insert_personalWalletTransactions_one(object: $transaction) {
      id
    }
  }
`;

const UPDATE_TRANSACTION_RESPONSE = gql`
  mutation UpdateMoMoResponse($id: uuid!, $mtn_response: String!) {
    update_Wallet_Transactions_by_pk(
      pk_columns: { id: $id }
      _set: { mtn_response: $mtn_response }
    ) {
      id
    }
  }
`;

const UPDATE_PERSONAL_TRANSACTION_RESPONSE = gql`
  mutation UpdatePersonalMoMoResponse($id: uuid!, $mtn_response: String!) {
    update_personalWalletTransactions_by_pk(
      pk_columns: { id: $id }
      _set: { mtn_response: $mtn_response }
    ) {
      id
    }
  }
`;

const ACTIVATE_SUBSCRIPTION = gql`
  mutation ActivateSubscription($id: uuid!, $status: String!) {
    update_shop_subscriptions_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
    }
  }
`;

const ENSURE_SUBSCRIPTION_SHELL = gql`
  mutation EnsureSubscriptionShell(
    $id: uuid!
    $status: String!
    $start_date: timestamptz!
    $end_date: timestamptz!
    $billing_cycle: String!
    $restaurant_id: uuid
    $shop_id: uuid
    $plan_id: uuid
  ) {
    insert_shop_subscriptions_one(
      object: {
        id: $id
        status: $status
        start_date: $start_date
        end_date: $end_date
        billing_cycle: $billing_cycle
        plan_id: $plan_id
        restaurant_id: $restaurant_id
        shop_id: $shop_id
      }
      on_conflict: {
        constraint: shop_subscriptions_pkey
        update_columns: [
          status
          updated_at
          start_date
          end_date
          billing_cycle
        ]
      }
    ) {
      id
    }
  }
`;

const ADD_SUBSCRIPTION_TRANSACTION = gql`
  mutation addSubscriptionTransactions(
    $amount: String = ""
    $currency: String = ""
    $mtn_response: String = ""
    $phone: String = ""
    $reference_id: String = ""
    $status: String = ""
    $subscription_id: uuid = ""
    $user_id: uuid = null
    $type: String = ""
  ) {
    insert_subscription_transactions(
      objects: {
        amount: $amount
        currency: $currency
        mtn_response: $mtn_response
        phone: $phone
        reference_id: $reference_id
        status: $status
        subscription_id: $subscription_id
        user_id: $user_id
        type: $type
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const CREATE_ORDER_TRANSACTION = gql`
  mutation CreateOrderTransaction($objects: [order_transactions_insert_input!]!) {
    insert_order_transactions(objects: $objects) {
      returning {
        id
      }
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
    petAdoptionId,
    packageId,
    businessOrderId,
    restaurantOrderId,
    reelOrderId,
    subscriptionId,
    planId,
    billingCycle = "monthly",
    businessId, // For POS Registration
    businessType, // For POS Registration
    orderType, // For payment type
  } = req.body;

  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as Session | null;
  const userId = session?.user?.id;

  if (!amount || !payerNumber) {
    return res.status(400).json({
      error: "Missing required fields: amount, payerNumber",
    });
  }

  const referenceId = randomUUID();
  let dbTransactionId: string | null = null;
  let isSubscription = !!subscriptionId;
  let isPersonalWallet =
    !!walletId &&
    !orderId &&
    !petAdoptionId &&
    !businessOrderId &&
    !restaurantOrderId &&
    !reelOrderId &&
    !isSubscription;
  let isOrderPayment = !!(
    orderId ||
    petAdoptionId ||
    restaurantOrderId ||
    businessOrderId ||
    reelOrderId ||
    packageId
  );

  try {
    if (hasuraClient) {
      // 0. Verify subscription existence for subscription payments
      if (isSubscription) {
        const checkRes = await hasuraClient.request<{
          shop_subscriptions_by_pk: any;
        }>(
          gql`
            query CheckSubscription($id: uuid!) {
              shop_subscriptions_by_pk(id: $id) {
                id
              }
            }
          `,
          { id: subscriptionId }
        );

        if (!checkRes.shop_subscriptions_by_pk) {
          console.error(
            `❌ [MoMo RequestToPay] Subscription ${subscriptionId} not found.`
          );
          return res.status(400).json({
            error: "Subscription not found",
            details: `The subscription record ${subscriptionId} must be created before initiating payment.`,
          });
        }
      }

      // 1. Create a PENDING transaction record BEFORE calling MoMo
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
              user_id: userId || null,
              type: "payment",
              mtn_response: JSON.stringify({
                status: "INITIATED",
                referenceId,
              }),
            }
          );
          dbTransactionId =
            dbRes.insert_subscription_transactions.returning[0].id;
          console.log(
            "📝 [MoMo RequestToPay] PENDING subscription transaction created:",
            dbTransactionId
          );
        } else if (isPersonalWallet) {
          const dbRes = await hasuraClient.request<{
            insert_personalWalletTransactions_one: { id: string };
          }>(CREATE_PENDING_PERSONAL_TRANSACTION, {
            transaction: {
              wallet_id: walletId,
              received_wallet: walletId, // Fund the same wallet
              amount: String(amount),
              currency,
              phone: payerNumber,
              reference_id: referenceId,
              status: "PENDING",
              mtn_response: JSON.stringify({
                status: "INITIATED",
                referenceId,
              }),
              action: "top-up",
              doneBy: userId || null,
            },
          });
          dbTransactionId = dbRes.insert_personalWalletTransactions_one.id;
          console.log(
            "📝 [MoMo RequestToPay] PENDING personal wallet transaction created:",
            dbTransactionId
          );
        } else if (petAdoptionId) {
          // Use order_transactions for pet adoptions to avoid Wallet_Transactions' wallet_id requirement
          const dbRes = await hasuraClient.request<{
            insert_order_transactions: { returning: Array<{ id: string }> };
          }>(CREATE_ORDER_TRANSACTION, {
            objects: [{
              wallet_id: null,
              order_id: null,
              business_order_id: null,
              restaurant_order_id: null,
              reel_order_id: null,
              package_id: null,
              petAdoptionId: petAdoptionId, // Match user's provided mutation field
              amount: String(amount).toString(),
              currency,
              phone: payerNumber,
              reference_id: referenceId,
              type: "pet_adoption",
              status: "PENDING",
              user_id: userId || null,
              mtn_response: JSON.stringify({
                status: "INITIATED",
                referenceId,
              }),
            }],
          });
          dbTransactionId = dbRes.insert_order_transactions.returning[0].id;
          console.log(
            "📝 [MoMo RequestToPay] PENDING pet adoption order_transaction created:",
            dbTransactionId
          );
        } else if (isOrderPayment) {
          // Use order_transactions table for orders
          const dbRes = await hasuraClient.request<{
            insert_order_transactions: { returning: Array<{ id: string }> };
          }>(CREATE_ORDER_TRANSACTION, {
            objects: [{
              wallet_id: walletId || null,
              order_id: orderId || null,
              package_id: packageId || null,
              business_order_id: businessOrderId || businessId || null,
              restaurant_order_id:
                restaurantOrderId ||
                (businessType === "RESTAURANT" ? businessId : null),
              reel_order_id: reelOrderId || null,
              amount: String(amount).toString(),
              currency,
              phone: payerNumber,
              reference_id: referenceId,
              type: orderType || "payment",
              status: "PENDING",
              mtn_response: JSON.stringify({
                status: "INITIATED",
                referenceId,
              }),
              user_id: userId || null,
            }],
          });
          dbTransactionId = dbRes.insert_order_transactions.returning[0].id;
          console.log(
            "📝 [MoMo RequestToPay] PENDING order transaction created:",
            dbTransactionId
          );
        } else {
          // Fallback to Wallet_Transactions for any other generic shopping payment
          const dbRes = await hasuraClient.request<{
            insert_Wallet_Transactions_one: { id: string };
          }>(CREATE_PENDING_TRANSACTION, {
            transaction: {
              wallet_id: walletId || null,
              related_order_id: orderId || null,
              relate_business_order_id: businessOrderId || businessId || null,
              related_restaurant_order_id:
                restaurantOrderId ||
                (businessType === "RESTAURANT" ? businessId : null),
              related_reel_orderId: reelOrderId || null,
              amount: String(amount).toString(),
              currency,
              phone: payerNumber,
              reference_id: referenceId,
              type: "payment",
              status: "PENDING",
              description: payerMessage,
            },
          });
          dbTransactionId = dbRes.insert_Wallet_Transactions_one.id;
          console.log(
            "📝 [MoMo RequestToPay] PENDING wallet transaction created:",
            dbTransactionId
          );
        }
      } catch (dbError: any) {
        console.error(
          "❌ [MoMo RequestToPay] Failed to create pending transaction:",
          dbError
        );
        await insertSystemLog(
          "error",
          `MoMo RequestToPay DB Init failure: ${dbError.message || "Unknown"}`,
          "MomoRequestToPayAPI:DBInit",
          { amount, payerNumber, error: dbError.message || dbError }
        );
        return res
          .status(500)
          .json({ error: "Failed to initialize transaction in database" });
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
          await hasuraClient.request(
            gql`
              mutation UpdateSubscriptionResponse(
                $id: uuid!
                $mtn_response: String!
                $update_at: timestamptz!
              ) {
                update_subscription_transactions_by_pk(
                  pk_columns: { id: $id }
                  _set: { mtn_response: $mtn_response, update_at: $update_at }
                ) {
                  id
                }
              }
            `,
            {
              id: dbTransactionId,
              mtn_response: JSON.stringify(momoResult),
              update_at: new Date().toISOString(),
            }
          );
        } else if (isPersonalWallet) {
          await hasuraClient.request(UPDATE_PERSONAL_TRANSACTION_RESPONSE, {
            id: dbTransactionId,
            mtn_response: JSON.stringify(momoResult),
          });
        } else if (isOrderPayment) {
          await hasuraClient.request(UPDATE_ORDER_TRANSACTION_RESPONSE, {
            id: dbTransactionId,
            mtn_response: JSON.stringify(momoResult),
          });
        } else {
          await hasuraClient.request(UPDATE_TRANSACTION_RESPONSE, {
            id: dbTransactionId,
            mtn_response: JSON.stringify(momoResult),
          });
        }
      } catch (updateError) {
        console.error(
          "❌ [MoMo RequestToPay] Failed to update MTN response:",
          updateError
        );
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
          await hasuraClient.request(
            gql`
              mutation UpdateSubscriptionFailed(
                $id: uuid!
                $mtn_response: String!
                $update_at: timestamptz!
              ) {
                update_subscription_transactions_by_pk(
                  pk_columns: { id: $id }
                  _set: {
                    status: "FAILED"
                    mtn_response: $mtn_response
                    update_at: $update_at
                  }
                ) {
                  id
                }
              }
            `,
            {
              id: dbTransactionId,
              mtn_response: JSON.stringify({ error: error.message }),
              update_at: new Date().toISOString(),
            }
          );
        } else if (isPersonalWallet) {
          await hasuraClient.request(
            gql`
              mutation UpdatePersonalFailed(
                $id: uuid!
                $mtn_response: String!
              ) {
                update_personalWalletTransactions_by_pk(
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
        } else if (isOrderPayment) {
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
        } else {
          await hasuraClient.request(
            gql`
              mutation UpdateTransactionFailed(
                $id: uuid!
                $mtn_response: String!
              ) {
                update_Wallet_Transactions_by_pk(
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
        }
      } catch (failError) {
        console.error(
          "❌ [MoMo RequestToPay] Failed to record failure:",
          failError
        );
      }
    }

    await insertSystemLog(
      "error",
      `MoMo RequestToPay Exception: ${error.message || "Unknown"}`,
      "MomoRequestToPayAPI:Main",
      { amount, payerNumber, error: error.message || error }
    );
    return res.status(500).json({
      error: "MoMo request failed",
      details: error.message,
    });
  }
}
