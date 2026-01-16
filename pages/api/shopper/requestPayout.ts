import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// GraphQL query to get shopper wallet
const GET_SHOPPER_WALLET = gql`
  query GetShopperWallet($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
      reserved_balance
      shopper_id
    }
  }
`;

// GraphQL mutation to update wallet balance
const UPDATE_WALLET_BALANCE = gql`
  mutation UpdateWalletBalance($wallet_id: uuid!, $available_balance: String!) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { available_balance: $available_balance, last_updated: "now()" }
    ) {
      id
      available_balance
      reserved_balance
      last_updated
    }
  }
`;

// GraphQL mutation to create payout request
const CREATE_PAYOUT_REQUEST = gql`
  mutation CreatePayoutRequest(
    $wallet_id: uuid!
    $user_id: uuid!
    $amount: String!
    $status: String!
    $created_at: timestamptz!
  ) {
    insert_payouts_one(
      object: {
        wallet_id: $wallet_id
        user_id: $user_id
        amount: $amount
        status: $status
        created_at: $created_at
      }
    ) {
      id
      amount
      status
      created_at
      wallet_id
      user_id
    }
  }
`;

// GraphQL mutation to create wallet transaction (optional - for tracking)
const CREATE_WALLET_TRANSACTION = gql`
  mutation CreateWalletTransaction(
    $wallet_id: uuid!
    $amount: String!
    $type: String!
    $status: String!
    $description: String!
  ) {
    insert_Wallet_Transactions_one(
      object: {
        wallet_id: $wallet_id
        amount: $amount
        type: $type
        status: $status
        description: $description
        related_order_id: null
        related_reel_orderId: null
        related_restaurant_order_id: null
      }
    ) {
      id
      amount
      type
      status
      description
      created_at
    }
  }
`;

interface Wallet {
  id: string;
  available_balance: string;
  reserved_balance: string;
  shopper_id: string;
}

interface GraphQLWalletResponse {
  Wallets: Wallet[];
}

interface UpdateWalletResponse {
  update_Wallets_by_pk: {
    id: string;
    available_balance: string;
    reserved_balance: string;
    last_updated: string;
  };
}

interface CreatePayoutResponse {
  insert_payouts_one: {
    id: string;
    amount: string;
    status: string;
    created_at: string;
    wallet_id: string;
    user_id: string;
  };
}

interface CreateTransactionResponse {
  insert_Wallet_Transactions_one: {
    id: string;
    amount: string;
    type: string;
    status: string;
    description: string;
    created_at: string;
  };
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
    // Authenticate the shopper
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as any;

    if (!session?.user?.id) {
      logger.error("Unauthorized payout request", "RequestPayoutAPI", {
        hasSession: !!session,
      });
      return res.status(401).json({ error: "Unauthorized" });
    }

    const shopperId = session.user.id;
    const { amount: rawAmount } = req.body;

    // Log the incoming request for debugging
    logger.info("Payout request received", "RequestPayoutAPI", {
      shopperId,
      amount: rawAmount,
    });

    // Validate and parse amount
    const amount =
      typeof rawAmount === "string" ? parseFloat(rawAmount) : rawAmount;

    if (!amount || typeof amount !== "number" || isNaN(amount) || amount <= 0) {
      logger.error("Invalid payout amount", "RequestPayoutAPI", {
        rawAmount,
        parsedAmount: amount,
      });
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be a positive number",
      });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get shopper's wallet
    const walletData = await hasuraClient.request<GraphQLWalletResponse>(
      GET_SHOPPER_WALLET,
      {
        shopper_id: shopperId,
      }
    );

    if (!walletData.Wallets || walletData.Wallets.length === 0) {
      logger.error("Wallet not found", "RequestPayoutAPI", { shopperId });
      return res.status(404).json({
        error: "Wallet not found",
        message: "No wallet found for this shopper",
      });
    }

    const wallet = walletData.Wallets[0];
    const currentAvailableBalance = parseFloat(wallet.available_balance || "0");

    // Check if sufficient balance
    if (currentAvailableBalance < amount) {
      logger.error("Insufficient balance", "RequestPayoutAPI", {
        shopperId,
        requestedAmount: amount,
        availableBalance: currentAvailableBalance,
      });
      return res.status(400).json({
        error: "Insufficient balance",
        message: `Requested amount (${amount.toFixed(
          2
        )}) exceeds available balance (${currentAvailableBalance.toFixed(2)})`,
      });
    }

    // Calculate new available balance
    const newAvailableBalance = (currentAvailableBalance - amount).toFixed(2);

    // Update wallet balance
    await hasuraClient.request<UpdateWalletResponse>(UPDATE_WALLET_BALANCE, {
      wallet_id: wallet.id,
      available_balance: newAvailableBalance,
    });

    // Create payout request in the payouts table with timestamp
    const payout = await hasuraClient.request<CreatePayoutResponse>(
      CREATE_PAYOUT_REQUEST,
      {
        wallet_id: wallet.id,
        user_id: shopperId,
        amount: amount.toFixed(2),
        status: "pending",
        created_at: new Date().toISOString(),
      }
    );

    // Create wallet transaction for tracking
    const transaction = await hasuraClient.request<CreateTransactionResponse>(
      CREATE_WALLET_TRANSACTION,
      {
        wallet_id: wallet.id,
        amount: amount.toFixed(2),
        type: "withdrawal",
        status: "pending",
        description: `Payout request #${payout.insert_payouts_one.id.substring(
          0,
          8
        )} - Processing`,
      }
    );

    logger.info("Payout request created successfully", "RequestPayoutAPI", {
      shopperId,
      amount,
      payoutId: payout.insert_payouts_one.id,
      transactionId: transaction.insert_Wallet_Transactions_one.id,
      previousBalance: currentAvailableBalance,
      newBalance: newAvailableBalance,
    });

    return res.status(200).json({
      success: true,
      message: "Payout request submitted successfully",
      data: {
        payoutId: payout.insert_payouts_one.id,
        transactionId: transaction.insert_Wallet_Transactions_one.id,
        amount,
        previousBalance: currentAvailableBalance,
        newBalance: parseFloat(newAvailableBalance),
        status: "pending",
        estimatedProcessingTime: "1-3 business days",
      },
    });
  } catch (error) {
    console.error("Error processing payout request:", error);
    logger.error("Error processing payout request", "RequestPayoutAPI", error);

    return res.status(500).json({
      error: "Internal server error",
      message:
        error instanceof Error
          ? error.message
          : "Failed to process payout request",
    });
  }
}
