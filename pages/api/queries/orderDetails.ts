import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to fetch a single order with nested details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: uuid!) {
    Orders(where: {id: {_eq: $id}}, limit: 1) {
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
        email
        phone
        profile_picture
        Ratings {
          created_at
          customer_id
          delivery_experience
          id
          order_id
          packaging_quality
          professionalism
          rating
          reel_order_id
          review
          reviewed_at
          shopper_id
          updated_at
        }
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

    const data = await hasuraClient.request<{ 
      Orders: Array<{
        id: string;
        OrderID: string;
        placedAt: string;
        estimatedDelivery: string | null;
        deliveryNotes: string | null;
        total: string;
        serviceFee: string;
        deliveryFee: string;
        status: string;
        deliveryPhotoUrl: string | null;
        discount: string | null;
        combinedOrderId: string | null;
        voucherCode: string | null;
        shop_id: string;
        user: {
          id: string;
          name: string;
          email: string;
          phone: string;
          profile_picture: string | null;
        };
        shop: {
          id: string;
          name: string;
          address: string;
          image: string | null;
          phone: string;
          latitude: number;
          longitude: number;
          operating_hours: string | null;
        };
        Order_Items: Array<{
          id: string;
          product_id: string;
          quantity: number;
          price: string;
          product: {
            id: string;
            price: string;
            final_price: string;
            measurement_unit: string;
            category: string;
            quantity: number;
            sku: string;
            image: string | null;
            productName_id: string;
            ProductName: {
              barcode: string | null;
              create_at: string;
              description: string | null;
              id: string;
              image: string | null;
              name: string;
              sku: string | null;
            };
            created_at: string;
            is_active: boolean;
            reorder_point: number;
            shop_id: string;
            supplier: string | null;
            updated_at: string;
          };
          order_id: string;
        }>;
        assignedTo: {
          id: string;
          name: string;
          email: string;
          phone: string;
          profile_picture: string | null;
          Ratings: Array<{
            created_at: string;
            customer_id: string;
            delivery_experience: string;
            id: string;
            order_id: string | null;
            packaging_quality: string;
            professionalism: string;
            rating: string;
            reel_order_id: string | null;
            review: string | null;
            reviewed_at: string | null;
            shopper_id: string;
            updated_at: string;
          }>;
        } | null;
        address: {
          id: string;
          street: string;
          city: string;
          postal_code: string;
          latitude: number;
          longitude: number;
          is_default: boolean;
        } | null;
        delivery_address_id: string | null;
        found: boolean;
        shopper_id: string | null;
        updated_at: string;
        user_id: string;
      }>;
    }>(
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
      // Calculate average rating and order count for assignedTo if available
      assignedTo: order.assignedTo ? {
        ...order.assignedTo,
        rating: order.assignedTo.Ratings.length > 0 
          ? order.assignedTo.Ratings.reduce((sum, rating) => sum + parseFloat(rating.rating), 0) / order.assignedTo.Ratings.length
          : 0,
        orders_aggregate: {
          aggregate: {
            count: order.assignedTo.Ratings.length
          }
        }
      } : null,
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
