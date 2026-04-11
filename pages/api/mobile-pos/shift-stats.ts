import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { shopId, employeeId } = req.body;

  if (!shopId || !employeeId) {
    return res
      .status(400)
      .json({ error: "shopId and employeeId are required" });
  }

  if (!hasuraClient) {
    return res.status(500).json({ error: "Hasura client not initialized" });
  }

  try {
    // Current date at 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const SHIFT_STATS_QUERY = gql`
      query GetShiftStats(
        $shopId: uuid!
        $employeeId: uuid!
        $today: timestamptz!
      ) {
        shopCheckouts(
          where: {
            shop_id: { _eq: $shopId }
            Processed_By: { _eq: $employeeId }
            created_on: { _gte: $today }
          }
        ) {
          total
          cartItems
        }
        SalesRecordings(
          where: { shop_id: { _eq: $shopId } }
          order_by: { update_at: desc }
          limit: 1
        ) {
          closing_stock
        }
      }
    `;

    const data: any = await hasuraClient.request(SHIFT_STATS_QUERY, {
      shopId,
      employeeId,
      today: todayIso,
    });

    const checkouts = data.shopCheckouts || [];
    const lastClosingStock = data.SalesRecordings?.[0]?.closing_stock || "0";

    // Aggregate stats
    let totalItems = 0;
    let totalSales = 0;

    checkouts.forEach((c: any) => {
      totalSales += parseFloat(c.total || "0");
      const items =
        typeof c.cartItems === "string" ? JSON.parse(c.cartItems) : c.cartItems;
      if (Array.isArray(items)) {
        items.forEach((it: any) => {
          totalItems += it.quantity || 0;
        });
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalItems,
        totalSales,
        lastClosingStock,
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch shift stats:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
