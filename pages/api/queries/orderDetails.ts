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
      user: userByUserId {
        id
        name
        email
        profile_picture
      }
      shop: Shop {
        id
        name
        address
        image
      }
      Order_Items {
        id
        product_id
        quantity
        price
        product: Product {
          id
          name
          image
          price
          description
          measurement_unit
          category
          quantity
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
      assignedTo: User {
        id
        name
        profile_picture
        orders: Orders_aggregate {
          aggregate {
            count
          }
        }
      }
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

  const { orderId } = req.query;
  if (typeof orderId !== "string") {
    return res.status(400).json({ error: "Missing or invalid orderId" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<{ Orders: any[] }>(
      GET_ORDER_DETAILS,
      { id: orderId }
    );
    const order = data.Orders[0];
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    // Format timestamps to human-readable strings
    const formattedOrder = {
      ...order,
      placedAt: new Date(order.placedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      estimatedDelivery: new Date(order.estimatedDelivery).toLocaleString(
        "en-US",
        { dateStyle: "medium", timeStyle: "short" }
      ),
    };
    res.status(200).json({ order: formattedOrder });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
}
