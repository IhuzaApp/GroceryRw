import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL query to get personal wallet by user ID
const GET_PERSONAL_WALLET = gql`
  query GetPersonalWallet($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
      user_id
      created_at
      updated_at
    }
  }
`;

// GraphQL mutation to create personal wallet if it doesn't exist
const CREATE_PERSONAL_WALLET = gql`
  mutation CreatePersonalWallet($user_id: uuid!) {
    insert_personalWallet_one(
      object: {
        user_id: $user_id
        balance: "0"
      }
    ) {
      id
      balance
      user_id
      created_at
      updated_at
    }
  }
`;

// GraphQL mutation to update personal wallet balance
const UPDATE_PERSONAL_WALLET_BALANCE = gql`
  mutation UpdatePersonalWalletBalance(
    $wallet_id: uuid!
    $balance: String!
  ) {
    update_personalWallet_by_pk(
      pk_columns: { id: $wallet_id }
      _set: {
        balance: $balance
        updated_at: "now()"
      }
    ) {
      id
      balance
      user_id
      updated_at
    }
  }
`;

interface AddMoneyRequest {
  amount: number;
  description?: string;
  card_number?: string;
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
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = session.user.id;
    const { amount, description, card_number }: AddMoneyRequest = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Validate card number
    if (!card_number || card_number.length < 13 || card_number.length > 16) {
      return res.status(400).json({ error: "Valid card number is required (13-16 digits)" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get or create personal wallet
    let walletData = await hasuraClient.request<{
      personalWallet: Array<{
        id: string;
        balance: string;
        user_id: string;
        created_at: string;
        updated_at: string;
      }>;
    }>(GET_PERSONAL_WALLET, { user_id });

    let wallet = walletData.personalWallet?.[0];

    // Create wallet if it doesn't exist
    if (!wallet) {
      const newWalletData = await hasuraClient.request<{
        insert_personalWallet_one: {
          id: string;
          balance: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
      }>(CREATE_PERSONAL_WALLET, { user_id });

      wallet = newWalletData.insert_personalWallet_one;
    }

    // Calculate new balance
    const currentBalance = parseFloat(wallet.balance || "0");
    const newBalance = currentBalance + amount;
    const newBalanceString = newBalance.toFixed(2);

    // Update wallet balance
    const updatedWallet = await hasuraClient.request<{
      update_personalWallet_by_pk: {
        id: string;
        balance: string;
        user_id: string;
        updated_at: string;
      };
    }>(UPDATE_PERSONAL_WALLET_BALANCE, {
      wallet_id: wallet.id,
      balance: newBalanceString,
    });

    return res.status(200).json({
      success: true,
      wallet: updatedWallet.update_personalWallet_by_pk,
      message: `Successfully added ${amount.toFixed(2)} to your wallet`,
    });
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to add money to wallet",
    });
  }
}
