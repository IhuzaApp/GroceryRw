import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import type { Session } from "next-auth";

// Query to get user profile
const GET_CURRENT_USER = gql`
  query GetCurrentUser($id: uuid!) {
    Users_by_pk(id: $id) {
      id
      name
      email
      phone
      profile_picture
      created_at
    }
  }
`;

// Query to count orders for the user
const GET_ORDER_COUNT = gql`
  query GetOrderCount($user_id: uuid!) {
    Orders_aggregate(where: { user_id: { _eq: $user_id } }) {
      aggregate {
        count
      }
    }
  }
`;

// Query to get shopper ID and wallet balance
const GET_SHOPPER_AND_WALLET = gql`
  query GetShopperAndWallet($user_id: uuid!) {
    # First get the shopper ID for this user
    shoppers(where: { user_id: { _eq: $user_id }, active: { _eq: true } }) {
      id
    }
    # Get wallet for this user
    Wallets(where: { shopper_id: { _eq: $user_id } }) {
      available_balance
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as Session | null;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id = (session.user as any).id as string;

  try {
    // Fetch user profile
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const userData = await hasuraClient.request<{ Users_by_pk: any }>(
      GET_CURRENT_USER,
      { id: user_id }
    );
    const user = userData.Users_by_pk;

    // Fetch order count
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const orderData = await hasuraClient.request<{
      Orders_aggregate: { aggregate: { count: number } };
    }>(GET_ORDER_COUNT, { user_id });
    const orderCount = orderData.Orders_aggregate.aggregate.count;

    // Fetch shopper and wallet data
    const shopperData = await hasuraClient.request<{
      shoppers: Array<{ id: string }>;
      Wallets: Array<{ available_balance: string }>;
    }>(GET_SHOPPER_AND_WALLET, { user_id });

    // Get wallet balance
    const walletBalance = shopperData.Wallets.length > 0
      ? parseFloat(shopperData.Wallets[0].available_balance)
      : 0;

    return res.status(200).json({ user, orderCount, walletBalance });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ error: "Failed to fetch current user info" });
  }
}
