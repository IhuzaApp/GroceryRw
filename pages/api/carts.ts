import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import type { Session } from "next-auth";

// Query to fetch all active carts for a user along with item counts
const GET_USER_CARTS = gql`
  query GetUserCarts($user_id: uuid!) {
    Carts(where: { user_id: { _eq: $user_id }, is_active: { _eq: true } }) {
      shop_id
      Cart_Items_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

// Query to fetch shop metadata for a list of shop IDs
const GET_SHOPS_BY_IDS = gql`
  query GetShopsByIds($ids: [uuid!]!) {
    Shops(where: { id: { _in: $ids } }) {
      id
      name
      latitude
      longitude
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
  const user_id = session.user.id;

  try {
    // 1) Get all active carts for this user with item counts
    const data = await hasuraClient.request<{
      Carts: Array<{
        shop_id: string;
        Cart_Items_aggregate: { aggregate: { count: number } };
      }>;
    }>(GET_USER_CARTS, { user_id });
    const shopIds = Array.from(new Set(data.Carts.map((c) => c.shop_id)));
    // Map shop_id to item count
    const countsMap: Record<string, number> = data.Carts.reduce((acc, c) => {
      acc[c.shop_id] = c.Cart_Items_aggregate.aggregate.count;
      return acc;
    }, {} as Record<string, number>);

    // 2) Fetch shop metadata
    let carts: Array<{
      id: string;
      name: string;
      count: number;
      latitude: string;
      longitude: string;
    }> = [];
    if (shopIds.length > 0) {
      const shopsData = await hasuraClient.request<{
        Shops: Array<{
          id: string;
          name: string;
          latitude: string;
          longitude: string;
        }>;
      }>(GET_SHOPS_BY_IDS, { ids: shopIds });
      carts = shopsData.Shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        count: countsMap[shop.id] ?? 0,
        latitude: shop.latitude,
        longitude: shop.longitude,
      }));
    }

    return res.status(200).json({ carts });
  } catch (error) {
    console.error("Error fetching user carts:", error);
    return res.status(500).json({ error: "Failed to fetch user carts" });
  }
}
