import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

const GET_REFUNDS = gql`
  query GetRefunds($user_id: uuid!) {
    Refunds(where: { user_id: { _eq: $user_id }, status: { _eq: "pending" } }) {
      id
      amount
      status
      created_at
    }
  }
`;

interface RefundResponse {
  Refunds: Array<{
    id: string;
    amount: string;
    status: string;
    created_at: string;
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
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const response = await hasuraClient.request<RefundResponse>(GET_REFUNDS, {
      user_id,
    });

    return res.status(200).json({ refunds: response.Refunds || [] });
  } catch (error) {
    console.error("Error fetching refunds:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
} 