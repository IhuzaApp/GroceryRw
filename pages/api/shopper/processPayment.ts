import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to get order details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      total
      service_fee
      delivery_fee
      shopper_id
    }
  }
`;

// GraphQL query to get shopper wallet
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
  mutation UpdateWalletBalances(
    $wallet_id: uuid!
    $available_balance: String!
    $reserved_balance: String!
  ) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { 
        available_balance: $available_balance,
        reserved_balance: $reserved_balance,
        last_updated: "now()"
      }
    ) {
      id
      available_balance
      reserved_balance
      last_updated
    }
  }
`;

// GraphQL mutation to create wallet transactions
const CREATE_WALLET_TRANSACTIONS = gql`
  mutation CreateWalletTransactions(
    $transactions: [Wallet_Transactions_insert_input!]!
  ) {
    insert_Wallet_Transactions(objects: $transactions) {
      affected_rows
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

  // Authenticate the shopper
  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId, momoCode, privateKey, orderAmount } = req.body;

  if (!orderId || !momoCode || !privateKey) {
    return res.status(400).json({ 
      error: "Missing required fields: orderId, momoCode, and privateKey are required" 
    });
  }

  try {
    // Verify this shopper is assigned to this order
    const CHECK_ASSIGNMENT = gql`
      query CheckOrderAssignment($orderId: uuid!, $shopperId: uuid!) {
        Orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
        }
      }
    `;

    const assignmentCheck = await hasuraClient.request<{
      Orders: Array<{ id: string; status: string }>;
    }>(CHECK_ASSIGNMENT, {
      orderId,
      shopperId: userId,
    });

    if (!assignmentCheck.Orders || assignmentCheck.Orders.length === 0) {
      return res.status(403).json({ error: "You are not assigned to this order" });
    }

    // Get order details with fees
    const orderDetails = await hasuraClient.request<{
      Orders_by_pk: {
        id: string;
        total: string;
        service_fee: string;
        delivery_fee: string;
        shopper_id: string;
      };
    }>(GET_ORDER_DETAILS, {
      orderId,
    });

    if (!orderDetails.Orders_by_pk) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orderDetails.Orders_by_pk;
    
    // Get shopper wallet
    const walletData = await hasuraClient.request<{
      Wallets: Array<{
        id: string;
        available_balance: string;
        reserved_balance: string;
      }>;
    }>(GET_SHOPPER_WALLET, {
      shopper_id: userId,
    });

    if (!walletData.Wallets || walletData.Wallets.length === 0) {
      return res.status(400).json({ error: "Shopper wallet not found" });
    }

    const wallet = walletData.Wallets[0];
    
    // Calculate new balances
    const serviceFee = parseFloat(order.service_fee || "0");
    const deliveryFee = parseFloat(order.delivery_fee || "0");
    const orderTotal = parseFloat(orderAmount);
    
    const currentAvailableBalance = parseFloat(wallet.available_balance);
    const currentReservedBalance = parseFloat(wallet.reserved_balance);
    
    // Keep available balance as is (it was already updated when shopping started)
    const newAvailableBalance = currentAvailableBalance.toFixed(2);
    
    // Subtract order total from reserved balance
    const newReservedBalance = (currentReservedBalance - orderTotal).toFixed(2);

    if (parseFloat(newReservedBalance) < 0) {
      return res.status(400).json({ 
        error: "Insufficient reserved balance to process this payment" 
      });
    }

    // Verify MoMo code (in a real app, you'd verify with a payment processor)
    if (momoCode.length < 5) {
      return res.status(400).json({ error: "Invalid MoMo code" });
    }

    // Update wallet balances
    await hasuraClient.request(UPDATE_WALLET_BALANCES, {
      wallet_id: wallet.id,
      available_balance: newAvailableBalance,
      reserved_balance: newReservedBalance,
    });

    // Create wallet transactions
    const transactions = [
      {
        wallet_id: wallet.id,
        amount: orderTotal.toFixed(2),
        type: "payment",
        status: "completed",
        related_order_id: orderId,
      }
    ];

    await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });

    // Return success
    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      wallet: {
        available_balance: newAvailableBalance,
        reserved_balance: newReservedBalance,
      },
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to process payment",
    });
  }
} 