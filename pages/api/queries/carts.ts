import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_CARTS = gql`
  query GetCarts {
    Carts {
      id
      user_id
      created_at
    }
  }
`;

interface CartsResponse {
  Carts: Array<{
    id: string;
    user_id: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await hasuraClient.request<CartsResponse>(GET_CARTS);
    res.status(200).json({ carts: data.Carts });
  } catch (error) {
    console.error("Error fetching carts:", error);
    res.status(500).json({ error: "Failed to fetch carts" });
  }
}
