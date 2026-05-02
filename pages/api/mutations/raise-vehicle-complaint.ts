import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendVehicleComplaintToSlack } from "../../../src/lib/slackSupportNotifier";

const INSERT_COMPLAINT = gql`
  mutation RaiseVehicleComplaint(
    $amount: String = ""
    $description: String = ""
    $status: String = "open"
    $ticket_id: uuid
    $title: String = ""
    $user_id: uuid!
    $vehicleBookingsId: uuid!
    $vehicleVideo: String = ""
  ) {
    insert_Issuecomplains(
      objects: {
        amount: $amount
        description: $description
        status: $status
        ticket_id: $ticket_id
        title: $title
        user_id: $user_id
        vehicleBookingsId: $vehicleBookingsId
        vehicleVideo: $vehicleVideo
        updated_at: "now()"
      }
    ) {
      affected_rows
    }
  }
`;

const INSERT_TICKET = gql`
  mutation InsertTicket(
    $user_id: uuid!
    $subject: String!
    $description: String!
    $category: String!
  ) {
    insert_tickets(
      objects: {
        user_id: $user_id
        subject: $subject
        description: $description
        category: $category
        priority: "high"
        status: "open"
      }
    ) {
      returning {
        id
        ticket_num
      }
    }
  }
`;

const GET_BOOKING_FOR_COMPLAINT = gql`
  query GetBookingForComplaint($id: uuid!) {
    vehicleBookings_by_pk(id: $id) {
      id
      refundable_fee
      customer_id
      RentalVehicles {
        name
        logisticsAccounts {
          fullname
          businessName
        }
      }
      Users {
        name
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { bookingId, videoUrl, title, description, amount } = req.body;

  if (!bookingId || !videoUrl || !title) {
    return res
      .status(400)
      .json({ error: "Missing required fields: bookingId, videoUrl or title" });
  }

  try {
    if (!hasuraClient) {
      return res.status(500).json({ error: "Hasura client not initialized" });
    }

    // 1. Fetch booking details for context
    const bookingRes = await hasuraClient.request<any>(
      GET_BOOKING_FOR_COMPLAINT,
      { id: bookingId }
    );
    const booking = bookingRes.vehicleBookings_by_pk;

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const customerName = booking.Users?.name || "Customer";
    const vehicleName = booking.RentalVehicles?.name || "Vehicle";
    const ownerName =
      booking.RentalVehicles?.logisticsAccounts?.businessName ||
      booking.RentalVehicles?.logisticsAccounts?.fullname ||
      "Partner";

    // 2. Create a support ticket
    const ticketRes = await hasuraClient.request<any>(INSERT_TICKET, {
      user_id: session.user.id,
      subject: `Damage Complaint: ${title}`,
      description: `Damage report for booking ${bookingId}. Customer: ${customerName}. Damage Video: ${videoUrl}. Note: ${description}`,
      category: "Car Rental Issue",
    });

    const ticket = ticketRes.insert_tickets.returning[0];

    // 3. Insert complaint record
    await hasuraClient.request(INSERT_COMPLAINT, {
      amount: amount || "0",
      description: description,
      title: title,
      ticket_id: ticket.id,
      user_id: session.user.id,
      vehicleBookingsId: bookingId,
      vehicleVideo: videoUrl,
    });

    // 4. Notify Slack
    await sendVehicleComplaintToSlack({
      bookingId,
      vehicleName,
      customerName,
      ownerName,
      amount: amount || "0",
      videoUrl,
      description,
      ticketNum: ticket.ticket_num,
    });

    return res
      .status(200)
      .json({ success: true, ticket_num: ticket.ticket_num });
  } catch (error: any) {
    console.error("Raise Complaint Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to raise complaint" });
  }
}
