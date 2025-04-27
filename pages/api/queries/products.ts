import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PRODUCTS = gql`
  query GetProducts {
    Products {
      id
      name
      description
      price
      created_at
    }
  }
`;

interface ProductsResponse {
  Products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await hasuraClient.request<ProductsResponse>(GET_PRODUCTS);
    res.status(200).json({ products: data.Products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
