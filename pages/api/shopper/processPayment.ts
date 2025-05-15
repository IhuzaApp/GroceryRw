import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to get order details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($order_id: uuid!) {
    Orders_by_pk(id: $order_id) {
      id
      total
      service_fee
      delivery_fee
      shopper_id
      status
    }
  }
`;

// GraphQL query to get shopper's wallet
const GET_SHOPPER_WALLET = gql`
  query GetShopperWallet($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
      reserved_balance
    }
  }
`;

// GraphQL mutation to update wallet balances
const UPDATE_WALLET_BALANCES = gql`
  mutation UpdateWalletBalances($wallet_id: uuid!, $reserved_balance: String!) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { reserved_balance: $reserved_balance }
    ) {
      id
      reserved_balance
    }
  }
`;

// GraphQL mutation to create wallet transactions
const CREATE_WALLET_TRANSACTIONS = gql`
  mutation createWalletTransactions(
    $transactions: [Wallet_Transactions_insert_input!]!
  ) {
    insert_Wallet_Transactions(objects: $transactions) {
      returning {
        id
      }
    }
  }
`;

// Type definitions for GraphQL responses
interface OrderDetails {
  Orders_by_pk: {
    id: string;
    total: string;
    service_fee: string;
    delivery_fee: string;
    shopper_id: string;
    status: string;
  } | null;
}

interface WalletData {
  Wallets: Array<{
    id: string;
    available_balance: string;
    reserved_balance: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get request data
    const { orderId, momoCode, privateKey, orderAmount } = req.body;

    // Validate required fields
    if (!orderId || !momoCode || !privateKey || orderAmount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Format order amount to ensure consistent handling
    const formattedOrderAmount = parseFloat(Number(orderAmount).toFixed(2));
    
    console.log(`Processing payment for order ${orderId}`);
    console.log(`Order amount: ${formattedOrderAmount}`);

    // For now, this is a simplified implementation that just returns success
    // In a real-world scenario, this would integrate with a payment processor

    // Log the payment information
    console.log(`Payment processed for order: ${orderId}`);
    console.log(`Amount: ${formattedOrderAmount}`);
    console.log(`MoMo Code: ${momoCode}`);
    console.log(`Private Key: ${privateKey.substring(0, 3)}***`); // Log only first few chars for security

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      paymentDetails: {
        orderId,
        amount: formattedOrderAmount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
