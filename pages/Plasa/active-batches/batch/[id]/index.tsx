"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "@components/shopper/ShopperLayout";
import BatchDetails from "@components/shopper/batchDetails";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../api/auth/[...nextauth]";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../../../src/lib/firebase";
import { AuthGuard } from "../../../../../src/components/AuthGuard";

// Define interfaces for the order data
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string;
    final_price: string;
    measurement_unit?: string;
    category?: string;
    ProductName?: {
      id: string;
      name: string;
      description: string;
      barcode: string;
      sku: string;
      image: string;
      create_at: string;
    };
  };
}

interface BatchOrderDetailsType {
  id: string;
  OrderID: string;
  placedAt: string;
  estimatedDelivery: string;
  deliveryNotes: string;
  total: string;
  serviceFee: string;
  deliveryFee: string;
  status: string;
  deliveryPhotoUrl: string;
  discount: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profile_picture: string;
  };
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
  };
  shop_id: string;
  shopper_id: string | null;
  user_id: string;
  voucher_code: string | null;
  shop: {
    id: string;
    name: string;
    address: string;
    image: string;
    phone?: string;
    latitude?: string;
    longitude?: string;
    operating_hours?: any;
  };
  Order_Items: OrderItem[];
  address: {
    id: string;
    street: string;
    city: string;
    postal_code: string;
    latitude: string;
    longitude: string;
  };
  assignedTo: {
    id: string;
    name: string;
    profile_picture: string;
    orders: {
      aggregate: {
        count: number;
      };
    };
  };
  // Add order type and reel-specific fields
  orderType?: "regular" | "reel" | "restaurant";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
  };
  quantity?: number;
  deliveryNote?: string;
}

interface BatchDetailsPageProps {
  orderData: BatchOrderDetailsType | null;
  error: string | null;
}

function BatchDetailsPage({ orderData, error }: BatchDetailsPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Function to delete messages from Firebase for an order
  const deleteFirebaseMessages = async (orderId: string) => {
    try {
      // First, find the conversation for this order
      const conversationsRef = collection(db, "chat_conversations");
      const q = query(conversationsRef, where("orderId", "==", orderId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log(`No chat conversation found for order ${orderId}`);
        return;
      }

      // For each conversation (should be only one per order)
      for (const conversationDoc of querySnapshot.docs) {
        const conversationId = conversationDoc.id;
        console.log(`Deleting messages for conversation ${conversationId}`);

        // Get all messages in the subcollection
        const messagesRef = collection(
          db,
          "chat_conversations",
          conversationId,
          "messages"
        );
        const messagesSnapshot = await getDocs(messagesRef);

        // Delete each message
        const deletePromises = messagesSnapshot.docs.map((doc) =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);

        console.log(
          `Deleted ${messagesSnapshot.docs.length} messages for conversation ${conversationId}`
        );

        // Optionally: Update the conversation to show it's been cleared
        // You can either delete the conversation document or update it
        // Here we'll update it to indicate messages were cleared
        await updateDoc(conversationDoc.ref, {
          lastMessage: "Order completed - chat history cleared",
          unreadCount: 0,
        });
      }
    } catch (error) {
      console.error("Error deleting Firebase messages:", error);
      // Continue with status update even if message deletion fails
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setLoading(true);
    try {
      // If status is being updated to 'delivered', delete Firebase messages first
      if (newStatus === "delivered") {
        await deleteFirebaseMessages(orderId);
      }

      const response = await fetch("/api/shopper/updateOrderStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        const errorMessage =
          errorData.error || `Server returned ${response.status}`;
        console.error(`Error ${response.status}: ${errorMessage}`);
        throw new Error(`Failed to update order status: ${errorMessage}`);
      }

      const result = await response.json();

      return result;
    } catch (err) {
      console.error("Error updating order status:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transform the data to match BatchDetails expected format
  const transformedOrderData = orderData
    ? {
        ...orderData,
        total: parseFloat(orderData.total), // Convert string to number
        orderedBy: orderData.orderedBy,
        customerId: orderData.orderedBy?.id, // Customer is ALWAYS from orderedBy
      }
    : null;

  return (
    <ShopperLayout>
      <BatchDetails
        orderData={transformedOrderData as any}
        error={error}
        onUpdateStatus={handleUpdateStatus}
      />
    </ShopperLayout>
  );
}

export const getServerSideProps: GetServerSideProps<
  BatchDetailsPageProps
> = async (context) => {
  const { id } = context.params || {};

  // Check if order ID is provided
  if (!id || typeof id !== "string") {
    return {
      props: {
        orderData: null,
        error: "Order ID is required",
      },
    };
  }

  // Check authentication
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/Auth/Login",
        permanent: false,
      },
    };
  }

  // GraphQL query to fetch a single regular order with nested details
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
            image
            measurement_unit
            category
            quantity
            final_price
            ProductName {
              name
              description
            }
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

  // GraphQL query to fetch a single reel order with nested details
  const GET_REEL_ORDER_DETAILS = gql`
    query GetReelOrderDetails($id: uuid!) {
      reel_orders(where: { id: { _eq: $id } }, limit: 1) {
        id
        OrderID
        placedAt: created_at
        estimatedDelivery: delivery_time
        deliveryNotes: delivery_note
        total
        serviceFee: service_fee
        deliveryFee: delivery_fee
        status
        deliveryPhotoUrl: delivery_photo_url
        discount
        quantity
        shopper_id
        user_id
        user: User {
          id
          name
          email
          phone
          profile_picture
        }
        reel: Reel {
          id
          title
          description
          Price
          Product
          type
          video_url
          restaurant_id
          shop_id
          Restaurant {
            id
            name
            location
            lat
            long
            created_at
            email
            is_active
            phone
            profile
            relatedTo
            tin
            ussd
            verified
            logo
          }
          Shops {
            id
            name
            address
            image
            latitude
            longitude
            phone
            operating_hours
            logo
            category_id
            description
            created_at
            updated_at
            relatedTo
            ssd
            tin
          }
        }
        address: Address {
          id
          street
          city
          postal_code
          latitude
          longitude
          created_at
          updated_at
          user_id
          is_default
        }
        assignedTo: User {
          id
          name
          email
          phone
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

  try {
    console.log("🔍 Starting batch details fetch for ID:", id);
    
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // First try to fetch as a regular order
    console.log("🔄 Trying regular order query...");
    let data = await hasuraClient.request<{ Orders: any[] }>(
      GET_ORDER_DETAILS,
      { id }
    );

    let order = data.Orders[0];
    let orderType = "regular";
    console.log("📊 Regular order result:", { found: !!order, count: data.Orders.length });

    // If no regular order found, try as a reel order
    if (!order) {
      console.log("🔄 Trying reel order query...");
      const reelData = await hasuraClient.request<{ reel_orders: any[] }>(
        GET_REEL_ORDER_DETAILS,
        { id }
      );

      order = reelData.reel_orders[0];
      orderType = "reel";
      console.log("📊 Reel order result:", { found: !!order, count: reelData.reel_orders.length });
    }

    // If still no order found, try as a restaurant order
    if (!order) {
      console.log("🔄 Trying restaurant order query...");
      const GET_RESTAURANT_ORDER_DETAILS = gql`
        query GetRestaurantOrderDetails($id: uuid!) {
          restaurant_orders(where: { id: { _eq: $id } }, limit: 1) {
            id
            OrderID
            placedAt: created_at
            estimatedDelivery: delivery_time
            deliveryNotes: delivery_notes
            total
            deliveryFee: delivery_fee
            status
            deliveryPhotoUrl: delivery_photo_url
            discount
            shopper_id
            user_id
            restaurant_id
            Restaurant {
              id
              name
              location
              lat
              long
              phone
              logo
            }
            orderedBy {
              id
              name
              phone
              email
              profile_picture
            }
            address: Address {
              id
              street
              city
              postal_code
              latitude
              longitude
            }
            restaurant_dishe_orders {
              id
              quantity
              price
              restaurant_dishes {
                id
                name
                description
                image
                price
              }
            }
            shopper {
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

      const restaurantData = await hasuraClient.request<{ restaurant_orders: any[] }>(
        GET_RESTAURANT_ORDER_DETAILS,
        { id }
      );

      order = restaurantData.restaurant_orders[0];
      orderType = "restaurant";
      console.log("📊 Restaurant order result:", { found: !!order, count: restaurantData.restaurant_orders.length });
    }

    if (!order) {
      console.log("❌ No order found for ID:", id);
      return {
        props: {
          orderData: null,
          error: "Order not found",
        },
      };
    }

    console.log("✅ Order found:", { orderType, orderId: order.id });

    // Check if the user is authorized to view this order
    // User can view if they are assigned to the order or if they are the customer
    const isAssignedShopper = order.assignedTo?.id === session.user.id || order.shopper?.id === session.user.id;
    const isCustomer = order.orderedBy?.id === session.user.id;

    // For reel orders, also check if user is the customer via user field
    const isReelCustomer =
      orderType === "reel" && order.user?.id === session.user.id;

    // For reel orders, also check if user is the assigned shopper via shopper_id field
    const isReelShopper =
      orderType === "reel" && order.shopper_id === session.user.id;

    // For restaurant orders, check if user is the assigned shopper via shopper_id field
    const isRestaurantShopper =
      orderType === "restaurant" && order.shopper_id === session.user.id;

    // For restaurant orders, check if user is the customer via user_id field
    const isRestaurantCustomer =
      orderType === "restaurant" && order.user_id === session.user.id;

    console.log("🔐 Authorization check:", {
      isAssignedShopper,
      isCustomer,
      isReelCustomer,
      isReelShopper,
      isRestaurantShopper,
      isRestaurantCustomer,
      orderType,
      assignedToId: order.assignedTo?.id,
      shopperId: order.shopper?.id,
      sessionUserId: session.user.id
    });

    if (
      !isAssignedShopper &&
      !isCustomer &&
      !isReelCustomer &&
      !isReelShopper &&
      !isRestaurantShopper &&
      !isRestaurantCustomer
    ) {
      console.log("❌ User not authorized to view this order");
      return {
        props: {
          orderData: null,
          error: "You don't have permission to view this order",
        },
      };
    }

    // Format timestamps to human-readable strings
    console.log("🔄 Formatting order data...");
    const formattedOrder = {
      ...order,
      orderType,
      placedAt: new Date(order.placedAt).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
      estimatedDelivery: order.estimatedDelivery
        ? new Date(order.estimatedDelivery).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : null,
    };

    console.log("✅ Successfully formatted order:", { orderType, orderId: formattedOrder.id });
    return {
      props: {
        orderData: formattedOrder,
        error: null,
      },
    };
  } catch (err) {
    console.error("Error fetching order details:", err);
    return {
      props: {
        orderData: null,
        error:
          err instanceof Error ? err.message : "Failed to load order details",
      },
    };
  }
};

export default BatchDetailsPage;
