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
        id: string;
        image: string;
        final_price: string;
        ProductName: {
          id: string;
          name: string;
          description: string;
          barcode: string;
          sku: string;
          image: string;
          create_at: string;
        } | null;
      } | null;
    }>;
    Order_Items_aggregate: {
      aggregate: {
        count: number;
      };
    };
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      profile_picture: string;
    } | null;
    orderedBy: {
      created_at: string;
      email: string;
      gender: string;
      id: string;
      is_active: boolean;
      name: string;
      password_hash: string;
      phone: string;
      profile_picture: string;
      updated_at: string;
      role: string;
    } | null;
    shop_id: string;
    shopper_id: string | null;
    total: string;
    user_id: string;
    voucher_code: string | null;
  } | null;
}

// Define session type
interface UserSession {
  user?: {
    name?: string;
    email?: string;
  };
}

// Query to fetch regular order details by ID
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
          id
          image
          final_price
          ProductName {
            id
            name
            description
            barcode
            sku
            image
            create_at
          }
        }
      }
      Order_Items_aggregate {
        aggregate {
          count
        }
      }
      user: User {
        id
        name
        email
        phone
        profile_picture
      }
      orderedBy {
        created_at
        email
        gender
        id
        is_active
        name
        password_hash
        phone
        profile_picture
        updated_at
        role
      }
      shop_id
      shopper_id
      total
      user_id
      voucher_code
    }
  }
`;

// Query to fetch reel order details by ID
const GET_REEL_ORDER_DETAILS = gql`
  query GetReelOrderDetails($orderId: uuid!) {
    reel_orders_by_pk(id: $orderId) {
      id
      created_at
      updated_at
      status
      service_fee
      delivery_fee
      total
      quantity
      delivery_note
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
        Restaurant {
          id
          name
          location
          lat
          long
        }
      }
      user: User {
        id
        name
        email
        phone
        profile_picture
      }
      address: Address {
        latitude
        longitude
        street
        city
        postal_code
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
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get orderId from query params
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Missing or invalid order ID" });
      return;
    }

    // Get user session for authentication
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as UserSession | null;

    if (!session || !session.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Fetch order details from Hasura
    if (!hasuraClient) {
      res.status(500).json({ error: "Failed to initialize Hasura client" });
      return;
    }

    let orderData: any = null;
    let orderType: "regular" | "reel" = "regular";

    try {
      // First try to fetch as a regular order
      const regularOrderData = await hasuraClient.request<OrderDetailsResponse>(
        GET_ORDER_DETAILS,
        {
          orderId: id,
        }
      );

      if (regularOrderData.Orders_by_pk) {
        orderData = regularOrderData.Orders_by_pk;
        orderType = "regular";
      } else {
        // If regular order not found, try reel order
        try {
          const reelOrderData = await hasuraClient.request<any>(
            GET_REEL_ORDER_DETAILS,
            {
              orderId: id,
            }
          );

          if (reelOrderData.reel_orders_by_pk) {
            orderData = reelOrderData.reel_orders_by_pk;
            orderType = "reel";
          }
        } catch (reelError) {
          console.error("Error fetching reel order:", reelError);
        }
      }
    } catch (error) {
      // If regular order query fails, try reel order
      console.error("Error fetching regular order:", error);
      try {
        const reelOrderData = await hasuraClient.request<any>(
          GET_REEL_ORDER_DETAILS,
          {
            orderId: id,
          }
        );

        if (reelOrderData.reel_orders_by_pk) {
          orderData = reelOrderData.reel_orders_by_pk;
          orderType = "reel";
        }
      } catch (reelError) {
        console.error("Error fetching reel order:", reelError);
      }
    }

    if (!orderData) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Format the order data for the frontend based on order type
    let formattedOrder: any;

    if (orderType === "regular") {
      // Handle regular orders
      const formattedOrderItems = orderData.Order_Items.map((item: any) => ({
        id: item.id,
        name: item.Product?.ProductName?.name || "Unknown Product",
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

      formattedOrder = {
        id: orderData.id,
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at,
        status: orderData.status,
        orderType: "regular",
        shopName: orderData.shop?.name || "Unknown Shop",
        shopAddress: orderData.shop?.address || "No Address",
        shopLatitude: orderData.shop?.latitude
          ? parseFloat(orderData.shop.latitude)
          : null,
        shopLongitude: orderData.shop?.longitude
          ? parseFloat(orderData.shop.longitude)
          : null,
        address: orderData.address, // Include raw address object
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
        user: orderData.user, // Include user data
        orderedBy: orderData.orderedBy, // Include orderedBy data (actual customer)
        customerId: orderData.orderedBy?.id, // Customer is ALWAYS from orderedBy
      };
    } else {
      // Handle reel orders
      const serviceFee = parseFloat(orderData.service_fee || "0");
      const deliveryFee = parseFloat(orderData.delivery_fee || "0");
      const totalEarnings = serviceFee + deliveryFee;
      const reelPrice = parseFloat(orderData.Reel?.Price || "0");
      const quantity = parseInt(orderData.quantity || "1");
      const subTotal = reelPrice * quantity;

      formattedOrder = {
        id: orderData.id,
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at,
        status: orderData.status,
        orderType: "reel",
        shopName: orderData.Reel?.Restaurant?.name || "Reel Order",
        shopAddress:
          orderData.Reel?.Restaurant?.location || "From Reel Creator",
        shopLatitude: orderData.Reel?.Restaurant?.lat || null,
        shopLongitude: orderData.Reel?.Restaurant?.long || null,
        address: orderData.address, // Include raw address object
        customerAddress: orderData.address
          ? `${orderData.address.street || ""}, ${orderData.address.city || ""}`
          : "No Address",
        customerLatitude: orderData.address?.latitude
          ? parseFloat(orderData.address.latitude)
          : null,
        customerLongitude: orderData.address?.longitude
          ? parseFloat(orderData.address.longitude)
          : null,
        items: [
          {
            id: orderData.Reel?.id || orderData.id,
            name: orderData.Reel?.Product || "Reel Product",
            quantity: quantity,
            price: reelPrice,
          },
        ],
        itemCount: 1,
        subTotal,
        serviceFee,
        deliveryFee,
        total: parseFloat(orderData.total || "0"),
        estimatedEarnings: totalEarnings,
        reel: orderData.Reel,
        quantity: quantity,
        deliveryNote: orderData.delivery_note,
        customerName: orderData.user?.name,
        customerPhone: orderData.user?.phone,
        user: orderData.user, // Include full user data
      };
    }

    res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
}
