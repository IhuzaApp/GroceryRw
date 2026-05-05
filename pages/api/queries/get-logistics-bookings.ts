import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_LOGISTICS_BOOKINGS = gql`
  query GetLogisticsBookings($logisticAccount_id: uuid!) {
    vehicleBookings(
      where: {
        RentalVehicles: { logisticAccount_id: { _eq: $logisticAccount_id } }
      }
      order_by: { created_at: desc }
    ) {
      id
      amount
      status
      pickup_date
      return_date
      customer_id
      driving_license
      guests
      refundable_fee
      carVideo_Status
      created_at
      orderedBy: User {
        id
        name
        email
        profile_picture
        phone
      }
      RentalVehicles {
        id
        name
        main_photo
        category
        price
        platNumber
      }
      Ratings {
        id
        rating
        review
        professionalism
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { logisticAccount_id } = req.query;
    if (!logisticAccount_id) {
      return res.status(400).json({ error: "Missing logisticAccount_id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ vehicleBookings: any[] }>(
      GET_LOGISTICS_BOOKINGS,
      {
        logisticAccount_id,
      }
    );

    return res.status(200).json({
      bookings: result.vehicleBookings,
    });
  } catch (error: any) {
    console.error("Error fetching logistics bookings:", error);
    return res.status(500).json({
      error: "Failed to fetch bookings",
      details: error.message,
    });
  }
}
