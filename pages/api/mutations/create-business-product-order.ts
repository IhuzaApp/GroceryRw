import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CREATE_BUSINESS_PRODUCT_ORDER = gql`
  mutation CreateBusinessProductOrder(
    $store_id: uuid!
    $allProducts: jsonb!
    $total: String!
    $transportation_fee: String!
    $service_fee: String!
    $units: String!
    $latitude: String!
    $longitude: String!
    $deliveryAddress: String!
    $comment: String
    $delivered_time: String
    $timeRange: String
  ) {
    insert_businessProductOrders(
      objects: {
        store_id: $store_id
        allProducts: $allProducts
        total: $total
        transportation_fee: $transportation_fee
        service_fee: $service_fee
        units: $units
        latitude: $latitude
        longitude: $longitude
        deliveryAddress: $deliveryAddress
        comment: $comment
        delivered_time: $delivered_time
        timeRange: $timeRange
      }
    ) {
      affected_rows
      returning {
        id
      }
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
  if (req.method !== "POST") {
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

    const {
      store_id,
      allProducts,
      total,
      transportation_fee,
      service_fee,
      units,
      latitude,
      longitude,
      deliveryAddress,
      comment,
      delivered_time,
      timeRange,
    } = req.body;

    if (!store_id || !allProducts || !total) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["store_id", "allProducts", "total"],
      });
    }

    const result = await hasuraClient.request<{
      insert_businessProductOrders: {
        affected_rows: number;
        returning: Array<{ id: string }>;
      };
    }>(CREATE_BUSINESS_PRODUCT_ORDER, {
      store_id,
      allProducts: Array.isArray(allProducts) ? allProducts : [],
      total: total.toString(),
      transportation_fee: transportation_fee?.toString() || "0",
      service_fee: service_fee?.toString() || "0",
      units: units?.toString() || "0",
      latitude: latitude || "",
      longitude: longitude || "",
      deliveryAddress: deliveryAddress || "",
      comment: comment || null,
      delivered_time: delivered_time || null,
      timeRange: timeRange || null,
    });

    if (result.insert_businessProductOrders.affected_rows === 0) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    return res.status(200).json({
      success: true,
      orderId: result.insert_businessProductOrders.returning[0]?.id,
      affected_rows: result.insert_businessProductOrders.affected_rows,
    });
  } catch (error: any) {
    console.error("Error creating business product order:", error);
    return res.status(500).json({
      error: "Failed to create order",
      message: error.message,
    });
  }
}
