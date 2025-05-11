import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_SHOPS = gql`
  query GetShops {
    Shops {
      id
      name
      description
      created_at
      address
      category_id
      image
      is_active
      latitude
      longitude
      operating_hours
      updated_at
    }
  }
`;

interface ShopsResponse {
  Shops: Array<{
    id: string;
    name: string;
    description: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<ShopsResponse>(GET_SHOPS);
    res.status(200).json({ shops: data.Shops });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ error: "Failed to fetch shops" });
  }
}
