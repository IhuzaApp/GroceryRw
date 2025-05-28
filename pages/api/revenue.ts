import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { RevenueResponse, RevenueWithMetrics } from "../../src/types/Revenue";

const GET_REVENUE = gql`
  query GetRevenue {
    Revenue {
      id
      amount
      type
      created_at
      order_id
      Order {
        OrderID
        combined_order_id
        created_at
        delivery_address_id
        delivery_fee
        delivery_notes
        delivery_photo_url
        delivery_time
        discount
        found
        total
        updated_at
        status
        shopper_id
        shop_id
        service_fee
        id
        user_id
        voucher_code
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

  // Authenticate user
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<RevenueResponse>(GET_REVENUE);

    // Calculate additional metrics
    const revenueData: RevenueWithMetrics[] = data.Revenue.map((rev) => ({
      ...rev,
      commission_percentage: (
        (parseFloat(rev.amount) / parseFloat(rev.Order.total)) *
        100
      ).toFixed(2),
    }));

    return res.status(200).json(revenueData);
  } catch (err: any) {
    console.error("Revenue fetch error:", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to fetch revenue data" });
  }
}
