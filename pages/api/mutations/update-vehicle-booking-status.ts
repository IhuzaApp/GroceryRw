import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: uuid!, $status: String!) {
    update_vehicleBookings_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
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
    const data = await hasuraClient.request<any>(UPDATE_BOOKING_STATUS, {
      id: bookingId,
      status: status,
    });

    if (!data.update_vehicleBookings_by_pk) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.status(200).json({ 
      success: true, 
      booking: data.update_vehicleBookings_by_pk 
    });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return res.status(500).json({ 
      error: error.message || "Internal Server Error" 
    });
  }
}
