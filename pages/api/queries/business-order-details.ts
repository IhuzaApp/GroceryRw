import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_BUSINESS_ORDER = gql`
  query GetBusinessOrderForCustomer($id: uuid!, $ordered_by: uuid!) {
    businessProductOrders(
      where: { id: { _eq: $id }, ordered_by: { _eq: $ordered_by } }
      limit: 1
    ) {
      id
      store_id
      total
      transportation_fee
      service_fee
      status
      created_at
      delivered_time
      timeRange
      units
      pin
      deliveryAddress
      comment
      allProducts
      business_store {
        id
        name
        image
      }
      orderedBy {
        id
        name
        phone
        email
      }
    }
  }
`;

interface SessionUser {
  id: string;
  [key: string]: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = (await getServerSession(
    req,
    res,
    authOptions as any
  )) as { user: SessionUser } | null;

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Missing order id" });
  }

  try {
    if (!hasuraClient) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const data = await hasuraClient.request<{
      businessProductOrders: Array<{
        id: string;
        store_id: string;
        total: string;
        transportation_fee: string;
        service_fee: string;
        status: string | null;
        created_at: string;
        delivered_time: string | null;
        timeRange: string | null;
        units: string;
        pin?: number | null;
        deliveryAddress: string | null;
        comment: string | null;
        allProducts: any;
        business_store: {
          id: string;
          name: string;
          image: string | null;
        } | null;
        orderedBy: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
        } | null;
      }>;
    }>(GET_BUSINESS_ORDER, {
      id,
      ordered_by: session.user.id,
    });

    if (
      !data.businessProductOrders ||
      data.businessProductOrders.length === 0
    ) {
      return res.status(404).json({ error: "Order not found" });
    }

    const row = data.businessProductOrders[0];
    const baseTotal = parseFloat(row.total || "0");
    const transportFee = parseFloat(row.transportation_fee || "0");
    const serviceFee = parseFloat(row.service_fee || "0");
    const total = baseTotal + transportFee + serviceFee;
    const products = Array.isArray(row.allProducts) ? row.allProducts : [];
    const bs = row.business_store;

    const order = {
      id: row.id,
      OrderID: row.id.substring(0, 8).toUpperCase(),
      status: row.status || "Pending",
      created_at: row.created_at,
      delivery_time: row.delivered_time || row.created_at,
      timeRange: row.timeRange,
      total,
      transportation_fee: transportFee,
      service_fee: serviceFee,
      deliveryAddress: row.deliveryAddress,
      comment: row.comment,
      units: row.units,
      pin: row.pin != null ? String(row.pin) : "",
      shop: bs
        ? {
            id: bs.id,
            name: bs.name,
            image: bs.image,
            address: "",
          }
        : null,
      shop_id: row.store_id,
      allProducts: products,
      orderedBy: row.orderedBy,
      orderType: "business",
    };

    return res.status(200).json({ order });
  } catch (err) {
    console.error("Business order details error:", err);
    return res.status(500).json({ error: "Failed to fetch order" });
  }
}
