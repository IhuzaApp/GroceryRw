import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to fetch a single order with nested details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: uuid!) {
    Orders(where: { id: { _eq: $id } }, limit: 1) {
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
      user: User {
        id
        name
        email
        phone
        profile_picture
      }
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
      assignedTo: User {
        id
        name
        profile_picture
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
      found
      shopper_id
      updated_at
      user_id
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

  const { id } = req.query;
  if (!id || (Array.isArray(id) && id.length === 0)) {
    return res.status(400).json({ error: "Missing order ID" });
  }

  // Ensure we have a single string ID
  const orderId = Array.isArray(id) ? id[0] : id;

  // Validate the UUID format
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderId)) {
    return res.status(400).json({ error: "Invalid order ID format" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<{ Orders: any[] }>(
      GET_ORDER_DETAILS,
      { id: orderId }
    );

    // Check if order exists
    if (!data.Orders || data.Orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = data.Orders[0];

    // Format timestamps to human-readable strings
    const formattedOrder = {
      ...order,
      placedAt: new Date(order.placedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      // Handle case where estimatedDelivery might be null
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString()
        : null,
    };

    res.status(200).json({ order: formattedOrder });
  } catch (error) {
    console.error("Error in orderDetails API:", error);
    res.status(500).json({
      error: "Failed to fetch order details",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
