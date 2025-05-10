import React from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import ActiveBatches from "@components/shopper/activeBatchesCard";
import { GetServerSideProps } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getSession } from "next-auth/react";

interface Order {
  id: string;
  status: string;
  createdAt: string;
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

export const getServerSideProps: GetServerSideProps<
  ActiveBatchesPageProps
> = async (context) => {
  // Get session to identify the shopper
  const session = await getSession(context);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return {
      props: {
        activeOrders: [],
        error: "You must be logged in as a shopper",
      },
    };
  }

  // Define GraphQL query to fetch active orders directly
  const GET_ACTIVE_ORDERS = gql`
    query GetActiveOrders($shopperId: uuid!) {
      Orders(
        where: {
          shopper_id: { _eq: $shopperId }
          status: {
            _in: [
              "accepted"
              "picked"
              "in_progress"
              "at_customer"
              "shopping"
            ]
          }
        }
        order_by: { created_at: desc }
      ) {
        id
        created_at
        status
        service_fee
        delivery_fee
        total
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

  try {
    const data = await hasuraClient.request<{
      Orders: Array<{
        id: string;
        created_at: string;
        status: string;
        service_fee: string | null;
        delivery_fee: string | null;
        total: number | null;
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
    }>(GET_ACTIVE_ORDERS, { shopperId: userId });

    type OrderData = typeof data.Orders[number];

    const activeOrders = data.Orders.map((o: OrderData) => ({
      id: o.id,
      status: o.status,
      createdAt: o.created_at,
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
    }));

    return {
      props: {
        activeOrders,
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
