import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_SHOP_BY_ID = gql`
  query GetShopById($id: uuid!) {
    Shops_by_pk(id: $id) {
      id
      name
      address
      description
      image
      logo
      phone
      latitude
      longitude
      is_active
      created_at
    }
  }
`;

interface ShopResponse {
    Shops_by_pk: {
        id: string;
        name: string;
        address?: string;
        description?: string;
        image?: string;
        logo?: string;
        phone?: string;
        latitude?: string;
        longitude?: string;
        is_active?: boolean;
        created_at: string;
    } | null;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        if (!hasuraClient) {
            throw new Error("Hasura client is not initialized");
        }

        const { id } = req.query;

        if (!id || typeof id !== "string") {
            return res.status(400).json({ error: "Shop ID is required" });
        }

        const data = await hasuraClient.request<ShopResponse>(
            GET_SHOP_BY_ID,
            { id }
        );

        if (!data.Shops_by_pk) {
            return res.status(404).json({ error: "Shop not found" });
        }

        res.status(200).json({ shop: data.Shops_by_pk });
    } catch (error) {
        console.error("Error fetching shop:", error);
        res.status(500).json({ error: "Failed to fetch shop" });
    }
}
