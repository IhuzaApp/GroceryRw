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
        delivery_notes
        delivery_photo_url
        delivery_time
        created_at
        delivery_address_id
        delivery_fee
        combined_order_id
        pin
        id
        assigned_at
        OrderID
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
        relatedTo
        phone
        ssd
        tin
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
        longitude
        mutual_StatusCertificate
        latitude
        mutual_status
        guarantorPhone
        Police_Clearance_Cert
      }
      Restaurants {
        created_at
        email
        id
        is_active
        lat
        location
        logo
        long
        name
        phone
        profile
        relatedTo
        tin
        ussd
        verified
      }
      businessProductOrders {
        OrderID
        allProducts
        comment
        combined_order_id
        created_at
        deliveryAddress
        delivered_time
        delivery_proof
        id
        latitude
        longitude
        ordered_by
        shopper_id
        status
        store_id
        timeRange
        total
        transportation_fee
        units
        orderedBy {
          phone
          gender
          email
          id
          name
          updated_at
          is_active
          is_guest
          created_at
        }
      }
      reel_order_id
      restaurant_order_id
      reel_orders {
        OrderID
        combined_order_id
        assigned_at
        created_at
        delivery_fee
        delivery_address_id
        discount
        found
        delivery_time
        delivery_note
        delivery_photo_url
        status
        total
        user_id
        updated_at
      }
      restaurant_orders {
        OrderID
        assigned_at
        combined_order_id
        delivery_address_id
        created_at
        discount
        delivery_time
        delivery_notes
        pin
        restaurant_id
        found
        id
        shopper_id
        status
        total
        updated_at
        user_id
      }
      businessOrder_Id
      Plasbusiness_id
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

    // Calculate additional metrics (Order for regular, businessProductOrders for business, reel_orders/restaurant_orders for reel/restaurant)
    const revenueData: RevenueWithMetrics[] = data.Revenue.map((rev) => {
      const orderTotal = rev.Order?.total
        ? parseFloat(rev.Order.total)
        : rev.businessProductOrders?.total
        ? parseFloat(String(rev.businessProductOrders.total))
        : rev.reel_orders?.total
        ? parseFloat(String(rev.reel_orders.total))
        : rev.restaurant_orders?.total
        ? parseFloat(String(rev.restaurant_orders.total))
        : 0;
      const amountNum = parseFloat(rev.amount || "0");
      const calculated_commission_percentage =
        orderTotal > 0 ? ((amountNum / orderTotal) * 100).toFixed(2) : "0.00";
      return {
        ...rev,
        calculated_commission_percentage,
      };
    });

    return res.status(200).json(revenueData);
  } catch (err: any) {
    console.error("Revenue fetch error:", err);
    return res.status(500).json({
      error: err.message || "Failed to fetch revenue data",
    });
  }
}
