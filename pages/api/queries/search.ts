import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const SEARCH_ITEMS = gql`
  query SearchItems($searchTerm: String!) {
    Products(
      where: { 
        ProductName: { name: { _ilike: $searchTerm } },
        is_active: { _eq: true },
        quantity: { _gt: 0 }
      }
      limit: 20
      order_by: { final_price: asc }
    ) {
      id
      ProductName {
        name
        description
      }
      price
      final_price
      image
      category
      shop_id
      is_active
      quantity
      measurement_unit
      Shop {
        id
        name
        image
        is_active
        address
      }
    }
    Shops(
      where: { 
        name: { _ilike: $searchTerm },
        is_active: { _eq: true }
      }, 
      limit: 5
    ) {
      id
      name
      description
      image
      is_active
      address
      category_id
      operating_hours
    }
  }
`;

interface SearchResponse {
  Products: Array<{
    id: string;
    ProductName: {
      name: string;
      description: string;
    };
    price: string;
    final_price: string;
    image: string;
    category: string;
    shop_id: string;
    is_active: boolean;
    quantity: number;
    measurement_unit: string;
    Shop: {
      name: string;
      image: string;
      is_active: boolean;
    };
  }>;
  Shops: Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    is_active: boolean;
    address: string;
    category_id: string;
    operating_hours: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const searchTerm = req.query.term as string;

    if (!searchTerm) {
      return res.status(400).json({ message: "Search term is required" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<SearchResponse>(SEARCH_ITEMS, {
      searchTerm: `%${searchTerm}%`,
    });

    // Transform products with enhanced details
    const products = data.Products.map((product) => ({
      id: product.id,
      name: product.ProductName.name,
      type: "product" as const,
      image: product.image,
      price: parseFloat(product.final_price),
      description: product.ProductName.description,
      shopId: product.shop_id,
      category: product.category,
      inStock: product.is_active && product.quantity > 0,
      quantity: product.quantity,
      measurementUnit: product.measurement_unit,
      shopName: product.Shop?.name,
      shopImage: product.Shop?.image,
      shopAddress: product.Shop?.address,
    }));

    // Transform shops
    const shops = data.Shops.map((shop) => ({
      id: shop.id,
      name: shop.name,
      type: "shop" as const,
      logo: shop.image,
      description: shop.description,
      isOpen: shop.is_active,
      address: shop.address,
      categoryId: shop.category_id,
      operatingHours: shop.operating_hours,
    }));

    // Group products by name to show all supermarkets selling the same product
    const productGroups = new Map<string, typeof products>();
    products.forEach(product => {
      const key = product.name.toLowerCase();
      if (!productGroups.has(key)) {
        productGroups.set(key, []);
      }
      productGroups.get(key)!.push(product);
    });

    // Sort products within each group by price (lowest first)
    productGroups.forEach(group => {
      group.sort((a, b) => a.price! - b.price!);
    });

    // Flatten grouped products and combine with shops
    const sortedProducts = Array.from(productGroups.values()).flat();
    const results = [...sortedProducts, ...shops].sort((a, b) => {
      // Exact matches first
      const aExactMatch = a.name.toLowerCase() === searchTerm.toLowerCase();
      const bExactMatch = b.name.toLowerCase() === searchTerm.toLowerCase();
      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // Products before shops
      if (a.type === "product" && b.type === "shop") return -1;
      if (a.type === "shop" && b.type === "product") return 1;

      // Then by name
      return a.name.localeCompare(b.name);
    });

    return res.status(200).json({
      results,
      total: results.length,
      productsCount: products.length,
      shopsCount: shops.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
