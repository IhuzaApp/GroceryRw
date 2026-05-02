import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_USER_BOOKINGS = gql`
  query GetUserBookings($user_id: uuid!) {
    vehicleBookings(
      where: { customer_id: { _eq: $user_id } }
      order_by: { created_at: desc }
    ) {
      id
      status
      pickup_date
      return_date
      amount
      services_fee
      refundable_fee
      guests
      driving_license
      created_at
      vehicle_id
      RentalVehicles {
        id
        name
        main_photo
        location
        category
        fuel_type
        price
        refundable_amount
        platNumber
        logisticsAccounts {
          id
          businessName
          fullname
        }
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

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as any;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = await hasuraClient.request<any>(GET_USER_BOOKINGS, {
      user_id: session.user.id,
    });

    const bookings = (data.vehicleBookings || []).map((b: any) => ({
      id: b.id,
      bookingId: b.id,
      status: b.status,
      pickup_date: b.pickup_date,
      return_date: b.return_date,
      startDate: b.pickup_date ? b.pickup_date.split("T")[0] : "",
      endDate: b.return_date ? b.return_date.split("T")[0] : "",
      amount: b.amount,
      services_fee: b.services_fee,
      refundable_fee: b.refundable_fee,
      guests: b.guests,
      created_at: b.created_at,
      // Vehicle info
      vehicle_id: b.vehicle_id,
      name: b.RentalVehicles?.name || "Vehicle",
      image: b.RentalVehicles?.main_photo || "",
      location: b.RentalVehicles?.location || "",
      type: b.RentalVehicles?.category || "",
      fuelType: b.RentalVehicles?.fuel_type || "",
      price: b.RentalVehicles?.price || 0,
      total: parseFloat(b.amount || "0") + parseFloat(b.services_fee || "0"),
      securityDeposit: parseFloat(b.refundable_fee || "0"),
      platNumber: b.RentalVehicles?.platNumber || "",
      ownerName:
        b.RentalVehicles?.logisticsAccounts?.businessName ||
        b.RentalVehicles?.logisticsAccounts?.fullname ||
        "Host",
    }));

    return res.status(200).json({ bookings });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to fetch bookings" });
  }
}
