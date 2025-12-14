import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_BUSINESS_PRODUCT_ORDERS = gql`
  query GetBusinessProductOrders($businessAccount_id: uuid!, $user_id: uuid!) {
    businessProductOrders(
      where: {
        business_store: {
          business_account: {
            id: { _eq: $businessAccount_id }
            user_id: { _eq: $user_id }
          }
        }
      }
      order_by: { created_at: desc }
    ) {
      id
      store_id
      allProducts
      total
      transportation_fee
      service_fee
      units
      deliveryAddress
      latitude
      longitude
      delivered_time
      timeRange
      comment
      status
      created_at
      business_store {
        id
        name
        image
        description
        category_id
        latitude
        longitude
        operating_hours
        is_active
        business_id
        created_at
      }
    }
  }
`;

const GET_BUSINESS_ACCOUNT = gql`
  query GetBusinessAccount($user_id: uuid!) {
    business_accounts(where: { user_id: { _eq: $user_id } }, limit: 1) {
      id
      user_id
    }
  }
`;

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const user_id = session.user.id;

    // Get business account
    const businessAccountResult = await hasuraClient.request<{
      business_accounts: Array<{ id: string; user_id: string }>;
    }>(GET_BUSINESS_ACCOUNT, { user_id });

    if (
      !businessAccountResult.business_accounts ||
      businessAccountResult.business_accounts.length === 0
    ) {
      return res.status(200).json({ orders: [] });
    }

    const businessAccount_id = businessAccountResult.business_accounts[0].id;

    console.log("🔍 Fetching orders with:", {
      businessAccount_id,
      user_id,
    });

    // Get orders directly by filtering business_store.business_id
    const ordersResult = await hasuraClient.request<{
      businessProductOrders: Array<{
        id: string;
        store_id: string;
        allProducts: any;
        total: string;
        transportation_fee: string;
        service_fee: string;
        units: string;
        deliveryAddress: string;
        latitude: string;
        longitude: string;
        delivered_time: string;
        timeRange: string;
        comment: string | null;
        status: string | null;
        created_at: string;
        business_store: {
          id: string;
          name: string;
          image: string | null;
          description: string | null;
          category_id: string | null;
          latitude: string | null;
          longitude: string | null;
          operating_hours: any;
          is_active: boolean;
          business_id: string;
          created_at: string;
        };
      }>;
    }>(GET_BUSINESS_PRODUCT_ORDERS, {
      businessAccount_id,
      user_id,
    });

    console.log("📦 Orders result:", {
      count: ordersResult.businessProductOrders?.length || 0,
      orders: ordersResult.businessProductOrders,
    });

    // Transform orders for frontend
    const orders = ordersResult.businessProductOrders.map((order) => {
      const products = Array.isArray(order.allProducts)
        ? order.allProducts
        : [];
      const itemsSummary =
        products.length > 0
          ? products
              .map((p: any) => `${p.name || "Item"} (${p.quantity || 0})`)
              .join(", ")
          : "No items";

      return {
        id: order.id,
        orderId: order.id.substring(0, 8).toUpperCase(),
        store: order.business_store?.name || "Unknown Store",
        items: itemsSummary,
        itemsCount: products.reduce(
          (sum: number, p: any) => sum + (p.quantity || 0),
          0
        ),
        value: parseFloat(order.total || "0"),
        status:
          order.status ||
          (order.delivered_time && new Date(order.delivered_time) > new Date()
            ? "Pending"
            : "Delivered"),
        deliveryDate: order.delivered_time
          ? new Date(order.delivered_time).toLocaleDateString()
          : new Date(order.created_at).toLocaleDateString(),
        deliveryTime: order.timeRange || "Pending",
        tracking: order.id.substring(0, 12).toUpperCase(),
        transportation_fee: parseFloat(order.transportation_fee || "0"),
        service_fee: parseFloat(order.service_fee || "0"),
        units: parseInt(order.units || "0"),
        deliveryAddress: order.deliveryAddress,
        comment: order.comment,
        created_at: order.created_at,
        store_image: order.business_store?.image || null,
      };
    });

    console.log("✅ Returning orders:", { count: orders.length });
    return res.status(200).json({ orders });
  } catch (error: any) {
    console.error("❌ Error fetching business product orders:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response,
      request: error.request,
    });
    return res.status(500).json({
      error: "Failed to fetch orders",
      message: error.message,
      details: error.response?.errors || error.message,
    });
  }
}

