import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PRODUCTS = gql`
  query GetProducts {
    Products {
      id
      ProductName {
        name
        description
      }
      price
      final_price
      created_at
      category
      image
      is_active
      measurement_unit
      quantity
      shop_id
      updated_at
    }
  }
`;

interface ProductsResponse {
  Products: Array<{
    id: string;
    ProductName: {
      name: string;
      description: string;
    };
    price: string;
    final_price: string;
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

    const data = await hasuraClient.request<ProductsResponse>(GET_PRODUCTS);
    res.status(200).json({ products: data.Products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
}
