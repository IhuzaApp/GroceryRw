import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";

const GET_PERSONAL_WALLET = gql`
  query GetPersonalWallet($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
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

  try {
    const session = (await getServerSession(req, res, authOptions as any)) as any;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = session.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const walletData = await hasuraClient.request<{
      personalWallet: Array<{ id: string; balance: string }>;
    }>(GET_PERSONAL_WALLET, { user_id });

    const wallet = walletData.personalWallet?.[0];
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const currentBalance = parseFloat(wallet.balance || "0");
    if (currentBalance < amount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const newBalance = currentBalance - amount;
    const newBalanceString = newBalance.toFixed(2);

    const updatedWallet = await hasuraClient.request<{
      update_personalWallet_by_pk: { id: string; balance: string };
    }>(UPDATE_PERSONAL_WALLET_BALANCE, {
      user_id,
      balance: newBalanceString,
    });

    return res.status(200).json({
      success: true,
      wallet: updatedWallet.update_personalWallet_by_pk,
      message: `Successfully deducted ${amount.toFixed(2)} from your wallet`,
    });
  } catch (error) {
    await logErrorToSlack("user/deduct-money-from-wallet", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to deduct money",
    });
  }
}
