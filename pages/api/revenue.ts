import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { RevenueResponse, RevenueWithMetrics } from "../../src/types/Revenue";

const GET_REVENUE = gql`
  query GetRevenue {
    Revenue {
      type
      shopper_id
      shop_id
      products
      order_id
      id
      created_at
      commission_percentage
      amount
      Order {
        user_id
        voucher_code
        updated_at
        total
        status
        shopper_id
        shop_id
        service_fee
        discount
        found
        delivery_notes
        delivery_photo_url
        delivery_time
        created_at
        delivery_address_id
        delivery_fee
        combined_order_id
      }
      Shop {
        logo
        longitude
        name
        operating_hours
        updated_at
        category_id
        created_at
        description
        id
        image
        is_active
        latitude
        address
      }
      shopper {
        Employment_id
        address
        active
        created_at
        background_check_completed
        full_name
        driving_license
        id
        phone_number
        user_id
        updated_at
        status
        profile_photo
        onboarding_step
        national_id
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
      calculated_commission_percentage: rev.Order 
        ? ((parseFloat(rev.amount) / parseFloat(rev.Order.total)) * 100).toFixed(2)
        : "0.00",
    }));

    return res.status(200).json(revenueData);
  } catch (err: any) {
    console.error("Revenue fetch error:", err);
    return res.status(500).json({ 
      error: err.message || "Failed to fetch revenue data" 
    });
  }
}
