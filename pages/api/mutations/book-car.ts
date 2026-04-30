import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";
import { sendNotificationToUser } from "../../../src/services/fcmService";

const GET_VEHICLE_OWNER_INFO = gql`
  query GetVehicleOwnerInfo($id: uuid!) {
    RentalVehicles_by_pk(id: $id) {
      name
      logisticsAccounts {
        fullname
        businessName
        Users {
          id
          phone
        }
      }
    }
  }
`;

const BOOK_VEHICLE_MUTATION = gql`
  mutation BookVehicle(
    $amount: String = ""
    $carVideo_Status: String = ""
    $customer_id: uuid = ""
    $driving_license: String = ""
    $guests: String = ""
    $pickup_date: timestamptz = ""
    $refundable_fee: String = ""
    $return_date: timestamptz = ""
    $services_fee: String = ""
    $status: String = ""
    $updated_at: timestamptz = ""
    $vehicle_id: uuid = ""
  ) {
    insert_vehicleBookings(
      objects: {
        amount: $amount
        carVideo_Status: $carVideo_Status
        customer_id: $customer_id
        driving_license: $driving_license
        guests: $guests
        pickup_date: $pickup_date
        refundable_fee: $refundable_fee
        return_date: $return_date
        services_fee: $services_fee
        status: $status
        updated_at: $updated_at
        vehicle_id: $vehicle_id
      }
    ) {
      affected_rows
      returning {
        id
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

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const {
      amount,
      carVideo_Status = "pending",
      driving_license,
      guests,
      pickup_date,
      refundable_fee,
      return_date,
      services_fee,
      status = "PAID",
      vehicle_id,
    } = req.body;

    const variables = {
      amount: amount.toString(),
      carVideo_Status,
      customer_id: (session as any).user.id,
      driving_license,
      guests: guests.toString(),
      pickup_date,
      refundable_fee: refundable_fee.toString(),
      return_date,
      services_fee: services_fee.toString(),
      status,
      updated_at: new Date().toISOString(),
      vehicle_id,
    };

    const result = await hasuraClient.request<any>(
      BOOK_VEHICLE_MUTATION,
      variables
    );

    return res.status(200).json({
      success: true,
      affected_rows: result.insert_vehicleBookings.affected_rows,
      booking: result.insert_vehicleBookings.returning?.[0],
    });
  } catch (error: any) {
    console.error("Vehicle Booking Error:", error);
    return res.status(500).json({
      error: "Failed to book vehicle",
      details: error.message,
    });
  } finally {
    // Post-booking notifications (non-blocking)
    const { status, vehicle_id, pickup_date, return_date, phone } = req.body;
    if (status === "PAID" && vehicle_id && hasuraClient) {
      try {
        const infoResult = await hasuraClient.request<any>(
          GET_VEHICLE_OWNER_INFO,
          { id: vehicle_id }
        );
        const vehicle = infoResult.RentalVehicles_by_pk;
        if (vehicle && vehicle.logisticsAccounts?.Users) {
          const owner = vehicle.logisticsAccounts;
          const ownerPhone = owner.Users.phone;
          const ownerUserId = owner.Users.id;
          const vehicleName = vehicle.name;
          const vendorName = owner.businessName || owner.fullname || "Vendor";

          const message = `Hello ${vendorName}, your vehicle "${vehicleName}" has been booked and paid for! Trip: ${new Date(pickup_date).toLocaleDateString()} to ${new Date(return_date).toLocaleDateString()}. Customer Phone: ${phone}. Please prepare for pickup.`;

          if (ownerPhone) {
            await sendSMS(ownerPhone, message);
          }

          if (ownerUserId) {
            await sendNotificationToUser(ownerUserId, {
              title: "New Vehicle Booking! 🚗",
              body: `Your vehicle "${vehicleName}" has been booked and paid for!`,
              data: {
                type: "vehicle_booking",
                vehicleId: vehicle_id,
              },
            });
          }
        }
      } catch (notifyErr) {
        console.error("Failed to send booking notifications:", notifyErr);
      }
    }
  }
}
