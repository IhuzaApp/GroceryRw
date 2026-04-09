import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { INSERT_PRODUCT_NAME, INSERT_PRODUCT } from "../queries/products";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const {
    mode,            // "new_product" | "add_to_shop" | "top_up"
    shopId,
    // Product identity (for new product)
    productName,
    barcode,
    sku,
    description,
    productImage,
    // productNames ID (for add_to_shop flow)
    productNameId,
    // Products record ID (for top_up flow)
    productId,
    // Stock details (all flows)
    quantity,
    price,
    final_price,
    buying_price,
    supplier,
    category,
    measurement_unit,
    reorder_point,
    expiry_date,
  } = req.body;

  if (!shopId || !quantity) {
    return res.status(400).json({ error: "shopId and quantity are required" });
  }

  if (!hasuraClient) return res.status(500).json({ error: "Hasura client not initialized" });

  const now = new Date().toISOString();

  try {
    let finalProductNameId = productNameId;

    // ── Mode: new_product ────────────────────────────────────────────────────
    // Create in productNames first, then add to Products
    if (mode === "new_product") {
      if (!productName) return res.status(400).json({ error: "productName is required" });

      const nameResult: any = await hasuraClient.request(INSERT_PRODUCT_NAME, {
        name: productName,
        barcode: barcode || "",
        sku: sku || "",
        description: description || "",
        image: productImage || "",
      });

      finalProductNameId = nameResult.insert_productNames?.returning?.[0]?.id;
      if (!finalProductNameId) throw new Error("Failed to create product name record");
    }

    // ── Mode: top_up ─────────────────────────────────────────────────────────
    if (mode === "top_up" && productId) {
      const UPDATE_STOCK = gql`
        mutation UpdateStock(
          $id: uuid!, $addQty: Int!, $supplier: String,
          $price: String, $final_price: String, $buying_price: String, $updated_at: String
        ) {
          update_Products_by_pk(
            pk_columns: { id: $id },
            _inc: { quantity: $addQty },
            _set: {
              supplier: $supplier,
              price: $price,
              final_price: $final_price,
              buying_price: $buying_price,
              updated_at: $updated_at
            }
          ) { id quantity }
        }
      `;

      const result: any = await hasuraClient.request(UPDATE_STOCK, {
        id: productId,
        addQty: parseInt(String(quantity), 10),
        supplier: supplier || null,
        price: price || null,
        final_price: final_price || null,
        buying_price: buying_price || null,
        updated_at: now,
      });

      return res.status(200).json({ success: true, updated: result.update_Products_by_pk });
    }

    // ── Update Product Identity (SKU/Barcode) if they were empty ─────────────
    if (finalProductNameId && (barcode || sku)) {
      const UPDATE_PRODUCT_NAME_ID = gql`
        mutation UpdateProductNameIdentity($id: uuid!, $barcode: String, $sku: String) {
          update_productNames_by_pk(
            pk_columns: { id: $id },
            _set: { barcode: $barcode, sku: $sku }
          ) { id }
        }
      `;
      await hasuraClient.request(UPDATE_PRODUCT_NAME_ID, {
        id: finalProductNameId,
        barcode: barcode || undefined,
        sku: sku || undefined
      }).catch(err => {
        console.warn("Minor: Failed to update product global identity:", err.message);
      });
    }

    // ── Mode: new_product OR add_to_shop ────────────────────────────────────
    const result: any = await hasuraClient.request(INSERT_PRODUCT, {
      shop_id: shopId,
      productName_id: finalProductNameId,
      quantity: parseInt(String(quantity), 10),
      price: price || "0",
      final_price: final_price || "0",
      buying_price: buying_price || "0",
      supplier: supplier || "",
      category: category || "other",
      measurement_unit: measurement_unit || "item",
      reorder_point: reorder_point ? parseInt(String(reorder_point), 10) : 10,
      sku: sku || "",
      expiry_date: expiry_date || "",
      image: productImage || "",
      updated_at: now,
      created_at: now,
    });

    return res.status(200).json({
      success: true,
      affected_rows: result.insert_Products?.affected_rows,
    });
  } catch (error: any) {
    console.error("Add stock failed:", error);
    return res.status(500).json({ error: "Add stock failed", details: error.message });
  }
}
