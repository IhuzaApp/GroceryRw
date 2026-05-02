import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_BOOKING_DETAILS = gql`
  query GetBookingDetails($id: uuid!) {
    vehicleBookings_by_pk(id: $id) {
      id
      status
      pickup_date
      return_date
      amount
      refundable_fee
      services_fee
      carVideo_Status
      customer_id
      created_at
      RentalVehicles {
        id
        name
        main_photo
        platNumber
        category
        fuel_type
        passenger
        price
        location
        logisticAccount_id
        logisticsAccounts {
          businessName
          fullname
          Users {
            phone
          }
        }
      }
      Issuecomplains {
        id
        title
        description
        amount
        status
        vehicleVideo
        created_at
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!hasuraClient) {
    return res
      .status(500)
      .json({ error: "System error: Database client not initialized" });
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as any;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing booking id" });
    }

    const data = await hasuraClient.request<any>(GET_BOOKING_DETAILS, {
      id: id,
    });

    const booking = data.vehicleBookings_by_pk;
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Check authorization: must be either customer or owner
    const isCustomer = booking.customer_id === session.user.id;
    const isOwner =
      booking.RentalVehicles?.logisticAccount_id === session.user.id ||
      booking.RentalVehicles?.logisticAccount_id ===
        (session.user as any).logisticsAccountId;

    if (!isCustomer && !isOwner) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this booking" });
    }

    return res.status(200).json({ booking });
  } catch (error: any) {
    console.error("Error fetching booking details:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to fetch booking details" });
  }
}
