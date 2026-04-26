import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";
import { sendPaymentRequestToSlack } from "../../../src/lib/slackSupportNotifier";

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

const GET_SHOPPER_ID = gql`
  query GetShopperId($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      id
      phone_number
      user {
        name
      }
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
    const shopperRes = await hasuraClient.request<any>(GET_SHOPPER_ID, {
      user_id: userId,
    });

    const shopperId = shopperRes.shoppers[0]?.id;

    if (!shopperId) {
      throw new Error("Shopper profile not found for this user.");
    }

    if (hasWallet) {
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
        throw new Error("Merchant wallet not found for the provided shop ID.");
      }
    } else {
      // Path 2: Shop does NOT have wallet - Create Payment Request
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
      const shopperData = shopperRes.shoppers[0];
      await sendPaymentRequestToSlack({
        orderId,
        shopName: shopName || "Unknown Merchant",
        amount: amount.toString(),
        shopperName: shopperData?.user?.name || "Unknown Shopper",
        shopperPhone: shopperData?.phone_number || "Unknown Phone",
      });

      return res.status(200).json({
        success: true,
        status: "PENDING_PAYMENT",
        message: "Payment request created successfully.",
      });
    }
  } catch (error) {
    await logErrorToSlack("shopper/processPaymentRequest", error, {
      orderId,
      shopId,
      amount,
      hasWallet,
    });
    console.error("Payment request processing failed:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to process payment request",
    });
  }
}
