import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const GET_PERSONAL_WALLET = gql`
  query GetPersonalWallet($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
      user_id
    }
  }
`;

const UPDATE_PERSONAL_WALLET_BALANCE = gql`
  mutation UpdatePersonalWalletBalance($user_id: uuid!, $balance: String!) {
    update_personalWallet_by_pk(
      pk_columns: { user_id: $user_id }
      _set: { balance: $balance, updated_at: "now()" }
    ) {
      id
      balance
      user_id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = session.user.id;
    const { amount } = req.body;

    const deductAmount = parseFloat(amount);
    if (!amount || isNaN(deductAmount) || deductAmount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!hasuraClient) {
      throw new Error("Database client not available");
    }

    const walletData = await hasuraClient.request<{
      personalWallet: Array<{ id: string; balance: string }>;
    }>(GET_PERSONAL_WALLET, { user_id });

    const wallet = walletData.personalWallet?.[0];
    if (!wallet) {
      return res.status(400).json({ error: "Wallet not found" });
    }

    const currentBalance = parseFloat(wallet.balance || "0");
    if (currentBalance < deductAmount) {
      return res.status(400).json({
        error: "Insufficient wallet balance",
        available: currentBalance,
        required: deductAmount,
      });
    }

    const newBalance = (currentBalance - deductAmount).toFixed(2);

    await hasuraClient.request(UPDATE_PERSONAL_WALLET_BALANCE, {
      user_id,
      balance: newBalance,
    });

    return res.status(200).json({
      success: true,
      deducted: deductAmount,
      newBalance: parseFloat(newBalance),
    });
  } catch (error) {
    console.error("Error deducting from wallet:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to deduct from wallet",
    });
  }
}
