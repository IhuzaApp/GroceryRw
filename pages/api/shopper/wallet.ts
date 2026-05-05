import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";
import { insertSystemLog } from "../queries/system-logs";

// GraphQL query to get wallet information
const GET_WALLET_BY_SHOPPER_ID = gql`
  query GetWalletByShopperId($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
      reserved_balance
      shopper_id
    }
  }
`;

// GraphQL mutation to update wallet information
const UPDATE_WALLET = gql`
  mutation UpdateWallet(
    $available_balance: String!
    $reserved_balance: String!
    $last_updated: timestamptz!
    $shopper_id: uuid!
  ) {
    update_Wallets(
      _set: {
        available_balance: $available_balance
        reserved_balance: $reserved_balance
        last_updated: $last_updated
      }
      where: { shopper_id: { _eq: $shopper_id } }
    ) {
      affected_rows
      returning {
        id
        available_balance
        reserved_balance
      }
    }
  }
`;

// Type definition for wallet data
interface WalletData {
  Wallets: Array<{
    id: string;
    available_balance: string;
    reserved_balance: string;
    shopper_id: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Allow GET and POST methods
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as any;

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if hasuraClient is available
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    if (req.method === "GET") {
      const { shopperId } = req.query;

      // Validate required fields
      if (!shopperId) {
        return res
          .status(400)
          .json({ error: "Missing required field: shopperId" });
      }

      // Verify the authenticated user matches the shopperId
      if (session.user.id !== shopperId) {
        return res
          .status(403)
          .json({ error: "Not authorized to access this wallet" });
      }

      // Get wallet information
      const walletResponse = await hasuraClient.request<WalletData>(
        GET_WALLET_BY_SHOPPER_ID,
        {
          shopper_id: shopperId,
        }
      );

      if (!walletResponse.Wallets || walletResponse.Wallets.length === 0) {
        return res
          .status(404)
          .json({ error: "Wallet not found for this shopper" });
      }

      return res.status(200).json({
        success: true,
        wallet: walletResponse.Wallets[0],
      });
    }

    if (req.method === "POST") {
      const { shopperId, available_balance, reserved_balance } = req.body;

      // Validate required fields
      if (!shopperId) {
        return res
          .status(400)
          .json({ error: "Missing required field: shopperId" });
      }

      // Verify authorization
      if (session.user.id !== shopperId) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this wallet" });
      }

      // Update wallet
      const updateResponse = await hasuraClient.request<any>(UPDATE_WALLET, {
        shopper_id: shopperId,
        available_balance: available_balance?.toString() || "0",
        reserved_balance: reserved_balance?.toString() || "0",
        last_updated: new Date().toISOString(),
      });

      if (updateResponse.update_Wallets.affected_rows === 0) {
        return res.status(404).json({ error: "Wallet not found for update" });
      }

      return res.status(200).json({
        success: true,
        wallet: updateResponse.update_Wallets.returning[0],
      });
    }
  } catch (error: any) {
    await insertSystemLog(
      "error",
      `Wallet API failure: ${error.message || "Unknown"}`,
      "ShopperWalletAPI",
      {
        method: req.method,
        shopperId:
          req.method === "GET" ? req.query.shopperId : req.body.shopperId,
        error: error.message || error,
      }
    );
    await logErrorToSlack("shopper/wallet", error, {
      method: req.method,
      shopperId:
        req.method === "GET" ? req.query.shopperId : req.body.shopperId,
    });
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
