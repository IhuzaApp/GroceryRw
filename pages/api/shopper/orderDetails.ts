import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Define type for GraphQL response
interface OrderDetailsResponse {
  Orders_by_pk: {
    id: string;
    created_at: string;
    updated_at: string;
    status: string;
    service_fee: string;
    delivery_fee: string;
    shop: {
      name: string;
      address: string;
      latitude: string;
      longitude: string;
    } | null;
    address: {
      latitude: string;
      longitude: string;
      street: string;
      city: string;
    } | null;
    Order_Items: Array<{
      id: string;
      product_id: string;
      quantity: number;
      price: string;
      Product: {
        name: string;
      } | null;
    }>;
    Order_Items_aggregate: {
      aggregate: {
        count: number;
        sum: {
          price: number;
        };
      };
    };
  } | null;
}

// Define session type
interface UserSession {
  user?: {
    name?: string;
    email?: string;
  };
}

// Query to fetch order details by ID
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      created_at
      updated_at
      status
      service_fee
      delivery_fee
      shop: Shop {
        name
        address
        latitude
        longitude
      }
      address: Address {
        latitude
        longitude
        street
        city
      }
      Order_Items {
        id
        product_id
        quantity
        price
        Product {
          name
        }
      }
      Order_Items_aggregate {
        aggregate {
          count
          sum {
            price
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
  // Handle only GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get orderId from query params
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing or invalid order ID" });
    }

    // Get user session for authentication
    const session = await getServerSession(req, res, authOptions as any) as UserSession | null;
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch order details from Hasura
    if (!hasuraClient) {
      return res.status(500).json({ error: "Failed to initialize Hasura client" });
    }
    
    const data = await hasuraClient.request<OrderDetailsResponse>(GET_ORDER_DETAILS, {
      orderId: id,
    });

    const orderData = data.Orders_by_pk;

    if (!orderData) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Format the order data for the frontend
    const formattedOrderItems = orderData.Order_Items.map((item: any) => ({
      id: item.id,
      name: item.Product?.name || "Unknown Product",
      quantity: item.quantity,
      price: parseFloat(item.price) || 0,
    }));

    // Calculate totals
    const subTotal = formattedOrderItems.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    
    const serviceFee = parseFloat(orderData.service_fee || "0");
    const deliveryFee = parseFloat(orderData.delivery_fee || "0");
    const totalEarnings = serviceFee + deliveryFee;
    
    const formattedOrder = {
      id: orderData.id,
      createdAt: orderData.created_at,
      updatedAt: orderData.updated_at,
      status: orderData.status,
      shopName: orderData.shop?.name || "Unknown Shop",
      shopAddress: orderData.shop?.address || "No Address",
      shopLatitude: orderData.shop?.latitude
        ? parseFloat(orderData.shop.latitude)
        : null,
      shopLongitude: orderData.shop?.longitude
        ? parseFloat(orderData.shop.longitude)
        : null,
      customerAddress: orderData.address
        ? `${orderData.address.street || ""}, ${orderData.address.city || ""}`
        : "No Address",
      customerLatitude: orderData.address?.latitude
        ? parseFloat(orderData.address.latitude)
        : null,
      customerLongitude: orderData.address?.longitude
        ? parseFloat(orderData.address.longitude)
        : null,
      items: formattedOrderItems,
      itemCount: orderData.Order_Items_aggregate?.aggregate?.count || 0,
      subTotal,
      serviceFee,
      deliveryFee,
      total: subTotal + serviceFee + deliveryFee,
      estimatedEarnings: totalEarnings,
    };

    return res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error: any) {
    console.error("Error fetching order details:", error);
    
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch order details",
    });
  }
} 