import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: uuid!, $status: String!) {
    update_vehicleBookings_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
      RentalVehicles {
        name
        platNumber
      }
      user {
        phone
        name
      }
      pickup_date
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { bookingId, status } = req.body;

  if (!bookingId || !status) {
    return res.status(400).json({ error: "Missing bookingId or status" });
  }

  try {
    if (!hasuraClient) {
      return res.status(500).json({ error: "Hasura client not initialized" });
    }

    const data = await hasuraClient.request<any>(UPDATE_BOOKING_STATUS, {
      id: bookingId,
      status: status,
    });

    const booking = data.update_vehicleBookings_by_pk;
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Send SMS Notification to Customer
    try {
      const customerPhone = booking.user?.phone;
      const vehicleName = booking.RentalVehicles?.name;
      const pickupDate = booking.pickup_date
        ? new Date(booking.pickup_date).toLocaleDateString()
        : "";

      if (customerPhone) {
        let message = "";
        if (status === "approved") {
          const platNum = booking.RentalVehicles?.platNumber
            ? `(${booking.RentalVehicles.platNumber})`
            : "";
          message = `Hello ${booking.user.name}, your booking for "${vehicleName}" ${platNum} on ${pickupDate} has been CONFIRMED! Please pickup your car on the scheduled date.`;
        } else if (status === "CANCELLED") {
          message = `Hello ${booking.user.name}, unfortunately your booking for "${vehicleName}" on ${pickupDate} was declined by the owner. Any payments made will be refunded to your wallet.`;
        }

        if (message) await sendSMS(customerPhone, message);
      }
    } catch (smsErr) {
      console.error("SMS notification failed:", smsErr);
    }

    return res.status(200).json({
      success: true,
      booking: booking,
    });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}
