import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PRODUCTS = gql`
  query GetProducts {
    Products {
      id
      ProductName {
        id
        name
        description
        barcode
        sku
        image
        create_at
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
      id: string;
      name: string;
      description: string;
      barcode: string;
      sku: string;
      image: string;
      create_at: string;
    };
    price: string;
    final_price: string;
    created_at: string;
    category: string;
    image: string;
    is_active: boolean;
    measurement_unit: string;
    quantity: number;
    shop_id: string;
    updated_at: string;
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
