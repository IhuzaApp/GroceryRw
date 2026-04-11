import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { barcode, sku, name, shopId } = req.body;

  if (!shopId) return res.status(400).json({ error: "shopId is required" });

  if (!hasuraClient)
    return res.status(500).json({ error: "Hasura client not initialized" });

  const hasSearchTerm = !!(barcode || sku || (name && name.trim()));

  try {
    // Always fetch suppliers for the shop
    const SUPPLIERS_QUERY = gql`
      query GetSuppliers($shopId: uuid!) {
        suppliers: Products(
          where: { shop_id: { _eq: $shopId }, supplier: { _is_null: false } }
          distinct_on: supplier
          order_by: { supplier: asc }
        ) {
          supplier
        }
      }
    `;

    const suppliersData: any = await hasuraClient.request(SUPPLIERS_QUERY, {
      shopId,
    });
    const suppliers: string[] = (suppliersData.suppliers || [])
      .map((s: any) => s.supplier)
      .filter(Boolean);

    // If no search term, just return suppliers
    if (!hasSearchTerm) {
      return res.status(200).json({
        found: false,
        matches: [],
        productName: null,
        existingStock: null,
        suppliers,
      });
    }

    // Build search conditions for global product names
    const orConditions: any[] = [];
    const identifier = barcode || sku;

    if (identifier) {
      orConditions.push({ barcode: { _eq: identifier } });
      orConditions.push({ sku: { _eq: identifier } });
    }

    if (name && name.trim()) {
      orConditions.push({ name: { _ilike: `%${name.trim()}%` } });
    }

    const LOOKUP_QUERY = gql`
      query LookupProduct(
        $orConditions: [productNames_bool_exp!]!
        $stockCondition: Products_bool_exp!
      ) {
        productNames(where: { _or: $orConditions }, limit: 5) {
          id
          name
          barcode
          sku
          image
          description
        }
        existingStock: Products(where: $stockCondition, limit: 1) {
          id
          quantity
          price
          final_price
          buying_price
          supplier
          category
          measurement_unit
          reorder_point
          sku
          productName_id
        }
      }
    `;

    // Dynamic condition for existing stock
    // Check global ProductName relationship AND the local SKU field
    const stockCondition: any = {
      shop_id: { _eq: shopId },
      _or: [{ ProductName: { _or: orConditions } }],
    };

    // Explicitly add local SKU match if an identifier was provided
    if (identifier) {
      stockCondition._or.push({ sku: { _eq: identifier } });
    }

    const data: any = await hasuraClient.request(LOOKUP_QUERY, {
      orConditions,
      stockCondition,
    });

    const matches: any[] = data.productNames || [];
    const existingStock = data.existingStock?.[0] || null;

    console.log("🔍 Product Lookup Debug:", {
      search: { barcode, sku, name },
      foundGlobal: matches.length,
      foundLocal: !!existingStock,
      localSku: existingStock?.sku,
    });
    if (matches.length > 0)
      console.log(
        "   - Global Matches:",
        matches.map((m) => `${m.name} (SKU: ${m.sku})`)
      );
    if (existingStock)
      console.log(
        "   - Local Stock ID:",
        existingStock.id,
        "SKU:",
        existingStock.sku
      );

    return res.status(200).json({
      found: matches.length > 0,
      matches,
      productName: matches[0] || null,
      existingStock,
      suppliers,
    });
  } catch (error: any) {
    console.error("Product lookup failed:", error);
    return res
      .status(500)
      .json({ error: "Lookup failed", details: error.message });
  }
}
