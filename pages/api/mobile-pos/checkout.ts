import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    shop_id,
    Processed_By,
    cartItems,
    subtotal,
    tax,
    total,
    tin,
    payment_method,
    number,
  } = req.body;

  if (!hasuraClient) {
    return res.status(500).json({ error: "Hasura client not initialized" });
  }

  try {
    // 1. Parse cart items to generate quantity updates
    const items = typeof cartItems === "string" ? JSON.parse(cartItems) : cartItems;
    
    // 2. Build the multi-mutation for atomicity
    // We insert the checkout and decrement each product's quantity
    let quantityUpdates = "";
    const variables: any = {
      checkout: {
        shop_id,
        Processed_By,
        cartItems: JSON.stringify(items), // Stored as a stringified JSON string
        subtotal: String(subtotal),
        tax: String(tax),
        total: String(total),
        tin: tin || "",
        payment_method,
        number: number || Math.floor(Math.random() * 100000),
        created_on: new Date().toISOString(),
      }
    };

    items.forEach((item: any, index: number) => {
      const idVar = `id_${index}`;
      const qtyVar = `qty_${index}`;
      variables[idVar] = item.id;
      variables[qtyVar] = -Math.abs(item.quantity); // Ensure we decrement

      quantityUpdates += `
        item_${index}: update_Products_by_pk(
          pk_columns: { id: $${idVar} },
          _inc: { quantity: $${qtyVar} }
        ) {
          id
          quantity
        }
      `;
    });

    const CHECKOUT_MUTATION = gql`
      mutation POSCheckout(
        $checkout: shopCheckouts_insert_input!,
        ${items.map((_: any, i: number) => `$id_${i}: uuid!, $qty_${i}: Int!`).join(",\n")}
      ) {
        insert_shopCheckouts_one(object: $checkout) {
          id
          number
        }
        ${quantityUpdates}
      }
    `;

    const data = await hasuraClient.request<{
      insert_shopCheckouts_one: { id: string; number: number }
    }>(CHECKOUT_MUTATION, variables);

    if (!data || !data.insert_shopCheckouts_one) {
      throw new Error("No response from database");
    }

    return res.status(200).json({ 
      success: true, 
      checkoutId: data.insert_shopCheckouts_one.id,
      orderNumber: data.insert_shopCheckouts_one.number
    });

  } catch (error: any) {
    console.error("Checkout transaction failed:", error);
    return res.status(500).json({ 
      error: "Checkout failed", 
      details: error.message 
    });
  }
}
