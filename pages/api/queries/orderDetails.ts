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
      user: userByUserId {
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
          name
          image
          price
          final_price
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

    // If shop data is missing or incomplete, fetch it separately
    let shopData = order.shop;
    
    if (!shopData || !shopData.phone || !shopData.latitude || !shopData.longitude) {
      if (order.shop_id) {
        try {
          const shopQuery = gql`
            query GetShopById($id: uuid!) {
              Shops_by_pk(id: $id) {
                id
                name
                address
                image
                phone
                latitude
                longitude
                operating_hours
              }
            }
          `;
          
          const shopResponse = await hasuraClient.request<{ Shops_by_pk: any }>(shopQuery, { id: order.shop_id });
          
          if (shopResponse.Shops_by_pk) {
            shopData = shopResponse.Shops_by_pk;
          }
        } catch (shopError) {
          // Shop data fetch failed, continue with existing data
        }
      }
    }

    // Format timestamps to human-readable strings
    const formattedOrder = {
      ...order,
      shop: shopData,
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
    res.status(500).json({ error: "Failed to fetch order details" });
  }
}
