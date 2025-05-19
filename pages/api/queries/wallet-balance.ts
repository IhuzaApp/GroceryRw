import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

const GET_WALLET_BALANCE = gql`
  query GetWalletBalance($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
      reserved_balance
      last_updated
    }
  }
`;

interface WalletResponse {
  Wallets: Array<{
    id: string;
    available_balance: string;
    reserved_balance: string;
    last_updated: string;
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
    const { shopper_id } = req.body;

    if (!shopper_id) {
      return res.status(400).json({ error: "Shopper ID is required" });
    }

    const response = await hasuraClient.request<WalletResponse>(
      GET_WALLET_BALANCE,
      {
        shopper_id,
      }
    );

    const wallet = response.Wallets?.[0] || null;

    return res.status(200).json({ wallet });
  } catch (error) {
    console.error("Error fetching wallet balance:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
