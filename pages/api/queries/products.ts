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

export const INSERT_PRODUCT_NAME = gql`
  mutation InsertProductName(
    $image: String = ""
    $name: String = ""
    $sku: String = ""
    $barcode: String = ""
    $description: String = ""
  ) {
    insert_productNames(
      objects: {
        image: $image
        name: $name
        sku: $sku
        barcode: $barcode
        description: $description
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export const INSERT_PRODUCT = gql`
  mutation InsertProduct(
    $category: String = ""
    $expiry_date: String = ""
    $final_price: String = ""
    $price: String = ""
    $measurement_unit: String = ""
    $productName_id: uuid = ""
    $quantity: Int = 10
    $reorder_point: Int = 10
    $sku: String = ""
    $supplier: String = ""
    $updated_at: String = ""
    $shop_id: uuid = ""
    $image: String = ""
    $buying_price: String = ""
    $created_at: timestamptz = ""
  ) {
    insert_Products(
      objects: {
        category: $category
        expiry_date: $expiry_date
        final_price: $final_price
        price: $price
        measurement_unit: $measurement_unit
        is_active: true
        productName_id: $productName_id
        quantity: $quantity
        reorder_point: $reorder_point
        sku: $sku
        supplier: $supplier
        updated_at: $updated_at
        shop_id: $shop_id
        image: $image
        buying_price: $buying_price
        created_at: $created_at
      }
    ) {
      affected_rows
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
