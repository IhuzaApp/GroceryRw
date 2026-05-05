import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";
import { sendPaymentRequestToSlack } from "../../../src/lib/slackSupportNotifier";
import { momoService } from "../../../src/lib/momoService";
import { recordPaymentTransactions } from "../../../src/lib/walletTransactions";
import { insertSystemLog } from "../queries/system-logs";
import { logger } from "../../../src/utils/logger";

const GET_MERCHANT_WALLET = gql`
  query GetMerchantWallet($shop_id: uuid!) {
    merchant_wallets(where: { shop_id: { _eq: $shop_id } }) {
      id
      balance
      reserved_balance
      shop_id
    }
  }
`;

const UPDATE_MERCHANT_WALLET = gql`
  mutation UpdateMerchantWallet(
    $balance: String = ""
    $update_at: timestamptz = ""
    $_eq: uuid = ""
  ) {
    update_merchant_wallets(
      _set: { balance: $balance, update_at: $update_at }
      where: { shop_id: { _eq: $_eq } }
    ) {
      affected_rows
    }
  }
`;

const INSERT_PAYMENT_REQUEST = gql`
  mutation InsertPaymentRequest($object: payment_requests_insert_input!) {
    insert_payment_requests_one(object: $object) {
      id
      status
    }
  }
`;

const CREATE_ORDER_TRANSACTION = gql`
  mutation CreateOrderTransaction($object: order_transactions_insert_input!) {
    insert_order_transactions_one(object: $object) {
      id
    }
  }
`;

const GET_SHOPPER_ID = gql`
  query GetShopperId($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      id
      phone_number
      User {
        name
      }
    }
  }
`;

const GET_SHOP_DETAILS = gql`
  query GetShopDetails($id: uuid!) {
    Shops_by_pk(id: $id) {
      id
      name
      ssd
      has_wallet
    }
  }
`;

const CHECK_EXISTING_REQUEST = gql`
  query CheckExistingRequest($order_id: uuid!) {
    payment_requests(where: { order_id: { _eq: $order_id } }) {
      id
      status
      transactionCode
    }
  }
`;

const GET_RESERVED_FUNDS = gql`
  query GetReservedFunds($order_id: uuid!) {
    Wallet_Transactions(where: { 
      related_order_id: { _eq: $order_id }, 
      type: { _eq: "reserve" } 
    }) {
      amount
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId, shopId, shopName, amount, hasWallet } = req.body;

  if (!orderId || !shopId || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("GraphQL client is not initialized.");
    }

    // Fetch the correct shopper_id from the users table id
    const shopperDataRes = await hasuraClient.request<{
      shoppers: Array<{ id: string; phone_number: string; User: { name: string } }>;
    }>(GET_SHOPPER_ID, { user_id: userId });
    const shopperId = shopperDataRes.shoppers[0]?.id;

    if (!shopperId) {
      throw new Error("Shopper profile not found for this user.");
    }

    // Fetch shop details to check for SSD (MoMo Merchant ID)
    const shopDetailsRes = await hasuraClient.request<{ Shops_by_pk: any }>(
      GET_SHOP_DETAILS,
      { id: shopId }
    );
    const shop = shopDetailsRes.Shops_by_pk;

    if (!shop) {
      throw new Error("Shop not found.");
    }

    const numericAmount = parseFloat(amount.toString());

    // Check for existing payment requests to prevent duplicates
    const existingReqRes = await hasuraClient.request<any>(CHECK_EXISTING_REQUEST, {
      order_id: orderId,
    });
    const existingReq = existingReqRes.payment_requests[0];

    if (existingReq) {
      if (existingReq.status === "APPROVED") {
        return res.status(200).json({
          success: true,
          status: "AUTOMATED_PAYMENT_SUCCESSFUL",
          message: "Payment was already processed and approved.",
          referenceId: existingReq.transactionCode,
        });
      }
      if (existingReq.status === "PENDING_PAYMENT") {
        return res.status(200).json({
          success: true,
          status: "PENDING_PAYMENT",
          message: "A payment request is already pending approval.",
        });
      }
    }

    // BUDGET VALIDATION: Ensure payout does not exceed reserved funds for this order
    const reservedFundsRes = await hasuraClient.request<any>(GET_RESERVED_FUNDS, {
      order_id: orderId,
    });
    
    const reservedAmount = reservedFundsRes.Wallet_Transactions.reduce(
      (sum: number, tx: any) => sum + parseFloat(tx.amount),
      0
    );

    if (numericAmount > reservedAmount) {
      logger.warn(`🛑 Budget Violation: Requested ${numericAmount} but only ${reservedAmount} was reserved for order ${orderId}`, "PaymentAPI", { orderId, numericAmount, reservedAmount });
      return res.status(400).json({
        error: "payout_exceeds_budget",
        message: `The requested amount (${numericAmount} RWF) exceeds the budget reserved for this order (${reservedAmount} RWF).`,
        reservedAmount
      });
    }

    if (hasWallet || shop.has_wallet) {
      // Path 1: Shop has an internal wallet - Direct payout
      const walletRes = await hasuraClient.request<any>(GET_MERCHANT_WALLET, {
        shop_id: shopId,
      });

      const currentWallet = walletRes.merchant_wallets[0];

      if (currentWallet) {
        const newBalance = (
          parseFloat(currentWallet.balance || "0") +
          parseFloat(amount.toString())
        ).toString();

        await hasuraClient.request(UPDATE_MERCHANT_WALLET, {
          balance: newBalance,
          update_at: new Date().toISOString(),
          _eq: shopId,
        });

        return res.status(200).json({
          success: true,
          status: "WALLET_UPDATED",
          message: `Merchant wallet updated with ${amount} RWF.`,
        });
      } else {
        // Fallback: If wallet not found but hasWallet was true, proceed to check for SSD or manual request
        logger.warn(`Wallet flag was true but no wallet found for shop ${shopId}`, "PaymentAPI", { shopId });
      }
    }

    // Path 2: Check if shop has MoMo SSD (Merchant ID) for automated transfer
    // AUTOMATED PAYMENT RULES:
    // 1. Shop must have SSD (Merchant ID)
    // 2. Amount must be <= 100,000 RWF
    if (shop.ssd && numericAmount <= 100000) {
      try {
        console.log(`💰 [Payment API] Initiating automated MoMo transfer to ${shop.name} (${shop.ssd}) for ${numericAmount} RWF`);
        
        const transferRes = await momoService.transfer({
          amount: numericAmount,
          currency: "RWF",
          payeeId: shop.ssd,
          partyIdType: "ALIAS",
          externalId: Date.now().toString(),
          payerMessage: `Order ${orderId.toString().slice(-8)}`,
          payeeNote: `Platform Payment`,
        });

        console.log(`✨ [Payment API] MoMo transfer successful! Reference: ${transferRes.referenceId}`);
        
        // 1. Record Payment Request
        await hasuraClient.request(INSERT_PAYMENT_REQUEST, {
          object: {
            order_id: orderId,
            shop_id: shopId,
            shopper_id: shopperId,
            amount: numericAmount.toString(),
            status: "APPROVED",
            agent_approved_id: null,
            transactionCode: transferRes.referenceId,
          },
        });

        // 2. Record Wallet Transaction (Deduct from shopper's reserved balance)
        try {
          await recordPaymentTransactions(
            shopperId,
            orderId,
            numericAmount,
            undefined, // We don't have originalOrderTotal here, it will use numericAmount
            transferRes.referenceId,
            true
          );
          console.log(`✅ [Payment API] Wallet transaction recorded for shopper ${shopperId}`);
        } catch (walletError) {
          logger.error("⚠️ [Payment API] Failed to record wallet transaction", "PaymentAPI", { error: walletError, shopperId, orderId });
          // Don't fail the whole request if wallet recording fails, but log it
        }

        // 3. Record Order Transaction (For financial monitoring)
        try {
          await hasuraClient.request(CREATE_ORDER_TRANSACTION, {
            object: {
              amount: numericAmount.toString(),
              currency: "RWF",
              phone: shop.ssd,
              type: "disbursement",
              status: "SUCCESSFUL",
              reference_id: transferRes.referenceId,
              order_id: orderId,
              user_id: userId || null,
              mtn_response: JSON.stringify({ status: "SUCCESSFUL", referenceId: transferRes.referenceId })
            },
          });
          console.log(`✅ [Payment API] Order transaction recorded for order ${orderId}`);
        } catch (orderTxError) {
          logger.error("⚠️ [Payment API] Failed to record order transaction", "PaymentAPI", { error: orderTxError, orderId });
        }

        return res.status(200).json({
          success: true,
          status: "AUTOMATED_PAYMENT_SUCCESSFUL",
          message: "Payment transferred successfully via MoMo.",
          referenceId: transferRes.referenceId,
        });
      } catch (transferError: any) {
        logger.error("❌ MoMo Transfer failed, falling back to manual request", "PaymentAPI", { error: transferError, orderId });
        // Log to Slack but continue to manual request fallback
        await logErrorToSlack("shopper/processPaymentRequest:momoTransfer", transferError, {
          orderId,
          shopId,
          amount,
          ssd: shop.ssd,
        });
      }
    } else if (shop.ssd && numericAmount > 100000) {
      console.log(`⚠️ Amount ${numericAmount} exceeds 100k limit. Falling back to manual request.`);
    }

    // Path 3: Fallback to manual Payment Request
    await hasuraClient.request(INSERT_PAYMENT_REQUEST, {
      object: {
        order_id: orderId,
        shop_id: shopId,
        shopper_id: shopperId,
        amount: amount.toString(),
        status: "PENDING_PAYMENT",
        agent_approved_id: null,
        transactionCode: null,
      },
    });

    // Notify Slack
    const shopperData = shopperDataRes.shoppers[0];
    await sendPaymentRequestToSlack({
      orderId,
      shopName: shopName || "Unknown Merchant",
      amount: amount.toString(),
      shopperName: shopperData?.User?.name || "Unknown Shopper",
      shopperPhone: shopperData?.phone_number || "Unknown Phone",
    });

    return res.status(200).json({
      success: true,
      status: "PENDING_PAYMENT",
      message: "Payment request created successfully (Manual approval required).",
    });
  } catch (error) {
    await logErrorToSlack("shopper/processPaymentRequest", error, {
      orderId,
      shopId,
      amount,
      hasWallet,
    });
    logger.error("Payment request processing failed", "PaymentAPI", { error, orderId });
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to process payment request",
    });
  }
}
