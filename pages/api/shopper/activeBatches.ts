import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { logger } from "../../../src/utils/logger";

// Fetch active regular orders for a specific shopper
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

// Fetch active reel orders for a specific shopper
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Get session to identify the shopper
  const session = await getServerSession(req, res, authOptions as any);
  // Use optional chaining and type assertion for safety
  const userId = (session as any)?.user?.id;

  logger.info("ActiveBatches API called", "ActiveBatchesAPI", {
    userId,
    hasSession: !!session,
    userRole: (session as any)?.user?.role,
  });

  if (!userId) {
    logger.warn("Unauthorized access attempt", "ActiveBatchesAPI", {
      hasSession: !!session,
    });
    return res.status(401).json({
      batches: [],
      error: "You must be logged in as a shopper",
      message: "Authentication required. Please log in again.",
    });
  }

  // Check if the user is a shopper
  const userRole = (session as any)?.user?.role;
  if (userRole !== "shopper") {
    logger.warn("Non-shopper access attempt", "ActiveBatchesAPI", {
      userId,
      userRole,
    });
    return res.status(403).json({
      batches: [],
      error: "Access denied",
      message: "This API endpoint is only accessible to shoppers.",
    });
  }

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

    logger.info("Active batches query results", "ActiveBatchesAPI", {
      userId,
      regularOrdersCount: regularOrders.length,
      reelOrdersCount: reelOrders.length,
      totalOrders: regularOrders.length + reelOrders.length,
    });

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

    // If no orders were found, return a specific message but with 200 status code
    if (allActiveOrders.length === 0) {
      return res.status(200).json({
        batches: [],
        message: "No active batches found",
        noOrdersFound: true,
      });
    }

    res.status(200).json({
      batches: allActiveOrders,
      message: `Found ${allActiveOrders.length} active batches`,
    });
  } catch (error) {
    logger.error("Error fetching active batches", "ActiveBatchesAPI", {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return a more informative error response with correct format
    res.status(500).json({
      batches: [],
      error: "Failed to fetch active batches",
      message: error instanceof Error ? error.message : String(error),
      detail:
        "There was a problem connecting to the database or processing your request.",
    });
  }
}
