import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import ActiveBatches from "@components/shopper/activeBatchesCard";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";

interface Order {
  id: string;
  OrderID: string;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  // Add order type and reel-specific fields
  orderType: "regular" | "reel";
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
  deliveryNote?: string | null;
  customerPhone?: string;
}

interface ActiveBatchesPageProps {
  activeOrders: Order[];
  error: string | null;
}

export default function ActiveBatchesPage({
  activeOrders,
  error,
}: ActiveBatchesPageProps) {
  return (
    <ShopperLayout>
      <ActiveBatches initialOrders={activeOrders} initialError={error} />
    </ShopperLayout>
  );
}

// TEMPORARY: Disable server-side authentication to test if it's causing the issue
export const getServerSideProps: GetServerSideProps<
  ActiveBatchesPageProps
> = async (context) => {
  return { props: { activeOrders: [], error: null } };
  
  // Original authentication code (disabled for testing)
  // const session = await getServerSession(context.req, context.res, authOptions);
  // const userId = (session as any)?.user?.id;
  // if (!userId) {
  //   return {
  //     props: {
  //       activeOrders: [],
  //       error: "You must be logged in as a shopper",
  //     },
  //   };
  // }
  // const userRole = (session as any)?.user?.role;
  // if (userRole !== "shopper") {
  //   return {
  //     props: {
  //       activeOrders: [],
  //       error: "This page is only accessible to shoppers",
  //     },
  //   };
  // }

  // Define GraphQL query to fetch active regular orders
  const GET_ACTIVE_ORDERS = gql`
    query GetActiveOrders($shopperId: uuid!) {
      Orders(
        where: {
          shopper_id: { _eq: $shopperId }
          _and: [
            { status: { _nin: ["null", "PENDING", "delivered"] } }
            { status: { _is_null: false } }
          ]
        }
        order_by: { created_at: desc }
      ) {
        id
        created_at
        status
        service_fee
        delivery_fee
        total
        delivery_time
        Shop {
          name
          address
          latitude
          longitude
        }
        User {
          id
          name
        }
        Address {
          latitude
          longitude
          street
          city
        }
        Order_Items_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  `;

  // Define GraphQL query to fetch active reel orders
  const GET_ACTIVE_REEL_ORDERS = gql`
    query GetActiveReelOrders($shopperId: uuid!) {
      reel_orders(
        where: {
          shopper_id: { _eq: $shopperId }
          _and: [
            { status: { _nin: ["null", "PENDING", "delivered"] } }
            { status: { _is_null: false } }
          ]
        }
        order_by: { created_at: desc }
      ) {
        id
        created_at
        status
        service_fee
        delivery_fee
        total
        delivery_time
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
        }
        user: User {
          id
          name
          phone
        }
        Address {
          latitude
          longitude
          street
          city
        }
      }
    }
  `;

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Fetch both regular and reel orders in parallel
    const [regularOrdersData, reelOrdersData] = await Promise.all([
      hasuraClient.request<{
        Orders: Array<{
          id: string;
          created_at: string;
          status: string;
          service_fee: string | null;
          delivery_fee: string | null;
          total: number | null;
          delivery_time: string | null;
          Shop: {
            name: string;
            address: string;
            latitude: string;
            longitude: string;
          };
          User: { id: string; name: string };
          Address: {
            latitude: string;
            longitude: string;
            street: string;
            city: string;
          };
          Order_Items_aggregate: {
            aggregate: {
              count: number | null;
            } | null;
          };
        }>;
      }>(GET_ACTIVE_ORDERS, { shopperId: userId }),
      hasuraClient.request<{
        reel_orders: Array<{
          id: string;
          created_at: string;
          status: string;
          service_fee: string | null;
          delivery_fee: string | null;
          total: string;
          delivery_time: string | null;
          quantity: string;
          delivery_note: string | null;
          Reel: {
            id: string;
            title: string;
            description: string;
            Price: string;
            Product: string;
            type: string;
            video_url: string;
          };
          user: {
            id: string;
            name: string;
            phone: string;
          };
          Address: {
            latitude: string;
            longitude: string;
            street: string;
            city: string;
          };
        }>;
      }>(GET_ACTIVE_REEL_ORDERS, { shopperId: userId }),
    ]);

    const regularOrders = regularOrdersData.Orders;
    const reelOrders = reelOrdersData.reel_orders;

    // Log the number of orders found
    console.log(
      `Found ${regularOrders.length} active regular orders and ${reelOrders.length} active reel orders for shopper ${userId} on server-side`
    );

    // Transform regular orders
    const transformedRegularOrders = regularOrders.map((o) => ({
      id: o.id,
      OrderID: o.id,
      status: o.status,
      createdAt: o.created_at,
      deliveryTime: o.delivery_time || undefined,
      shopName: o.Shop.name,
      shopAddress: o.Shop.address,
      shopLat: parseFloat(o.Shop.latitude),
      shopLng: parseFloat(o.Shop.longitude),
      customerName: o.User.name,
      customerAddress: `${o.Address.street}, ${o.Address.city}`,
      customerLat: parseFloat(o.Address.latitude),
      customerLng: parseFloat(o.Address.longitude),
      items: o.Order_Items_aggregate.aggregate?.count ?? 0,
      total: o.total ?? 0,
      estimatedEarnings: (
        parseFloat(o.service_fee || "0") + parseFloat(o.delivery_fee || "0")
      ).toFixed(2),
      orderType: "regular" as const,
    }));

    // Transform reel orders
    const transformedReelOrders = reelOrders.map((o) => ({
      id: o.id,
      OrderID: o.id,
      status: o.status,
      createdAt: o.created_at,
      deliveryTime: o.delivery_time || undefined,
      shopName: "Reel Order", // Reel orders don't have shops
      shopAddress: "From Reel Creator", // Reel orders come from reel creators
      shopLat: parseFloat(o.Address.latitude), // Use customer location as pickup point
      shopLng: parseFloat(o.Address.longitude),
      customerName: o.user.name,
      customerAddress: `${o.Address.street}, ${o.Address.city}`,
      customerLat: parseFloat(o.Address.latitude),
      customerLng: parseFloat(o.Address.longitude),
      items: 1, // Reel orders have 1 item
      total: parseFloat(o.total || "0"),
      estimatedEarnings: (
        parseFloat(o.service_fee || "0") + parseFloat(o.delivery_fee || "0")
      ).toFixed(2),
      orderType: "reel" as const,
      reel: o.Reel,
      quantity: parseInt(o.quantity) || 1,
      deliveryNote: o.delivery_note,
      customerPhone: o.user.phone,
    }));

    // Combine both types of orders
    const allActiveOrders = [
      ...transformedRegularOrders,
      ...transformedReelOrders,
    ];

    // If no orders were found, return an empty array but no error
    if (allActiveOrders.length === 0) {
      return {
        props: {
          activeOrders: [],
          error: null, // No error, just no orders found
        },
      };
    }

    return {
      props: {
        activeOrders: allActiveOrders,
        error: null,
      },
    };
  } catch (error) {
    console.error("Error fetching active batches:", error);
    return {
      props: {
        activeOrders: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to load active batches",
      },
    };
  }
};
