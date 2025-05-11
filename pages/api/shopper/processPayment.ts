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
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId, momoCode, privateKey, orderAmount } = req.body;

    // Validate required fields
    if (!orderId || !momoCode || !privateKey || orderAmount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if hasuraClient is available (it should be on server side)
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    // Verify the shopper is authorized to process this order
    const orderResponse = await hasuraClient.request<OrderDetails>(
      GET_ORDER_DETAILS,
      {
        order_id: orderId,
      }
    );

    const order = orderResponse.Orders_by_pk;
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the user is the assigned shopper
    if (order.shopper_id !== session.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to process this order" });
    }

    // Get the shopper's wallet
    const walletResponse = await hasuraClient.request<WalletData>(
      GET_SHOPPER_WALLET,
      {
        shopper_id: session.user.id,
      }
    );

    const wallets = walletResponse.Wallets;
    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const wallet = wallets[0];

    // Validate the momoCode (In a real app, this would connect to a payment service)
    // For this example, we'll accept any non-empty code
    if (!momoCode || momoCode.trim() === "") {
      return res.status(400).json({ error: "MoMo code cannot be empty" });
    }

    // Validate private key matches session storage (in a real app, this would be more secure)
    // For this example, we'll just make sure it's not empty
    if (!privateKey || privateKey.length < 4) {
      return res.status(400).json({ error: "Invalid private key" });
    }

    // Calculate new balances
    const currentReserved = parseFloat(wallet.reserved_balance);

    // The reserved balance should be sufficient for the order amount
    if (currentReserved < orderAmount) {
      return res.status(400).json({ error: "Insufficient reserved balance" });
    }

    // Calculate the new reserved balance after deducting only the order amount
    // (excluding service fee and delivery fee which were already added to available balance)
    const newReserved = currentReserved - orderAmount;
    console.log(
      `Updating reserved balance: ${currentReserved} - ${orderAmount} = ${newReserved}`
    );

    // Update the wallet balances - only change the reserved balance
    await hasuraClient.request(UPDATE_WALLET_BALANCES, {
      wallet_id: wallet.id,
      reserved_balance: newReserved.toString(),
    });

    // Create wallet transaction records for the found items only
    const transactions = [
      {
        wallet_id: wallet.id,
        amount: orderAmount.toFixed(2),
        type: "payment",
        status: "completed",
        related_order_id: orderId,
        description:
          "Payment for found order items (excluding service and delivery fees)",
      },
    ];

    await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      newBalance: {
        reserved: newReserved,
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
