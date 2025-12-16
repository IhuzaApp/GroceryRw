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

// Query to find shopper by user ID (regardless of active status)
const GET_SHOPPER_BY_USER_ID = gql`
  query GetShopperByUserId($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      id
    }
  }
`;

// Query to get shopper wallet available balance
const GET_SHOPPER_WALLET = gql`
  query GetShopperWallet($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
    }
  }
`;

// Mutation to create a wallet for a shopper
const CREATE_SHOPPER_WALLET = gql`
  mutation CreateShopperWallet($shopper_id: uuid!) {
    insert_Wallets_one(
      object: {
        shopper_id: $shopper_id
        available_balance: "0"
        reserved_balance: "0"
      }
    ) {
      id
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

    // Fetch shopper wallet available balance (for Earnings)
    // Note: Wallets.shopper_id foreign key references Users.id, not shoppers.id
    let walletBalance = 0;
    try {
      // First, check if user is a shopper
      const shopperData = await hasuraClient.request<{
        shoppers: Array<{ id: string }>;
      }>(GET_SHOPPER_BY_USER_ID, { user_id });

      if (shopperData.shoppers && shopperData.shoppers.length > 0) {
        // Wallets.shopper_id references Users.id, not shoppers.id
        // So we use user_id directly as the shopper_id
        
        // Fetch the shopper wallet using user_id (which is what shopper_id references)
        let walletData = await hasuraClient.request<{
          Wallets: Array<{ available_balance: string }>;
        }>(GET_SHOPPER_WALLET, { shopper_id: user_id });

        // If wallet doesn't exist, create one using user_id
        if (!walletData.Wallets || walletData.Wallets.length === 0) {
          try {
            const newWallet = await hasuraClient.request<{
              insert_Wallets_one: { available_balance: string };
            }>(CREATE_SHOPPER_WALLET, { shopper_id: user_id });
            
            if (newWallet.insert_Wallets_one) {
              walletData = {
                Wallets: [newWallet.insert_Wallets_one]
              };
            }
          } catch (createError) {
            // Wallet creation failed, continue with default balance
          }
        }

        // Get available balance from shopper wallet
        if (walletData.Wallets && walletData.Wallets.length > 0) {
          const balanceStr = walletData.Wallets[0].available_balance;
          walletBalance = parseFloat(balanceStr || "0");
        }
      }
    } catch (error) {
      // Error fetching wallet balance, default to 0
      walletBalance = 0;
    }

    return res.status(200).json({ user, orderCount, walletBalance });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ error: "Failed to fetch current user info" });
  }
}
