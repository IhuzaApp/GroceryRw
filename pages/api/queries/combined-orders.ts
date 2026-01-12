import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to fetch all orders with the same combined_order_id
const GET_COMBINED_ORDERS = gql`
  query GetCombinedOrders($combined_order_id: uuid!) {
    Orders(where: { combined_order_id: { _eq: $combined_order_id } }) {
      id
      OrderID
      placedAt: created_at
      estimatedDelivery: delivery_time
      deliveryNotes: delivery_notes
      total
      serviceFee: service_fee
      deliveryFee: delivery_fee
      status
      deliveryPhotoUrl: delivery_photo_url
      discount
      combinedOrderId: combined_order_id
      voucherCode: voucher_code
      shop_id
      pin
      shop: Shop {
        id
        name
        address
        image
        phone
        latitude
        longitude
        operating_hours
      }
      Order_Items {
        id
        product_id
        quantity
        price
        product: Product {
          id
          price
          final_price
          measurement_unit
          category
          quantity
          sku
          image
          productName_id
          ProductName {
            barcode
            create_at
            description
            id
            image
            name
            sku
          }
          created_at
          is_active
          reorder_point
          shop_id
          supplier
          updated_at
        }
        order_id
      }
      address: Address {
        id
        street
        city
        postal_code
        latitude
        longitude
        is_default
      }
      delivery_address_id
      shopper_id
      updated_at
      user_id
      assigned_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { combined_order_id } = req.query;
  if (
    !combined_order_id ||
    (Array.isArray(combined_order_id) && combined_order_id.length === 0)
  ) {
    return res.status(400).json({ error: "Missing combined_order_id" });
  }

  // Ensure we have a single string ID
  const combinedOrderId = Array.isArray(combined_order_id)
    ? combined_order_id[0]
    : combined_order_id;

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<{
      Orders: Array<any>;
    }>(GET_COMBINED_ORDERS, { combined_order_id: combinedOrderId });

    // Check if orders exist
    if (!data.Orders || data.Orders.length === 0) {
      return res
        .status(404)
        .json({ error: "No orders found for this combined_order_id" });
    }

    res.status(200).json({ orders: data.Orders });
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch combined orders",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
