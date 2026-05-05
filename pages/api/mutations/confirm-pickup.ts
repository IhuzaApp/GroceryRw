import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";

const GET_BOOKING = gql`
  query GetBookingForPickup($id: uuid!) {
    vehicleBookings_by_pk(id: $id) {
      id
      status
      amount
      refundable_fee
      services_fee
      customer_id
      RentalVehicles {
        name
        platNumber
        logisticAccount_id
        logisticsAccounts {
          id
          fullname
          businessName
          Users {
            phone
          }
        }
      }
    }
  }
`;

const UPDATE_BUSINESS_WALLET = gql`
  mutation CreditBusinessWallet($id: uuid!, $new_amount: String!) {
    update_business_wallet_by_pk(
      pk_columns: { id: $id }
      _set: { amount: $new_amount }
    ) {
      id
      amount
    }
  }
`;

const UPDATE_CAR_VIDEO = gql`
  mutation UpdateCarVideo($id: uuid!, $carVideo: String) {
    update_vehicleBookings_by_pk(
      pk_columns: { id: $id }
      _set: { carVideo_Status: $carVideo }
    ) {
      id
    }
  }
`;

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateStatus($id: uuid!, $status: String!) {
    update_vehicleBookings_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
    }
  }
`;

const GET_BUSINESS_WALLET = gql`
  query GetBusinessWallet($logistics_id: uuid!) {
    business_wallet(
      where: { logisticsAccount: { id: { _eq: $logistics_id } } }
    ) {
      id
      amount
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

  if (!hasuraClient) {
    return res
      .status(500)
      .json({ error: "System error: Database client not initialized" });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { bookingId, carVideo_Status } = req.body;
  if (!bookingId) {
    return res.status(400).json({ error: "Missing bookingId" });
  }

  // Mandatory video check for payout
  if (!carVideo_Status) {
    return res.status(400).json({
      error: "Vehicle condition video is required for pickup confirmation.",
    });
  }

  try {
    // 1. Get booking details
    const bookingData = await hasuraClient.request<any>(GET_BOOKING, {
      id: bookingId,
    });
    const booking = bookingData.vehicleBookings_by_pk;

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const isCustomer = booking.customer_id === session.user.id;
    const isPartner =
      booking.RentalVehicles?.logisticAccount_id ===
        (session.user as any).logisticsAccountId ||
      booking.RentalVehicles?.logisticAccount_id === session.user.id;

    if (!isCustomer && !isPartner) {
      return res.status(403).json({ error: "Not authorized for this booking" });
    }

    if (booking.status !== "approved") {
      return res
        .status(400)
        .json({ error: "Booking must be approved before confirming pickup" });
    }

    // 2. Step 1: Update the video report field
    await hasuraClient.request<any>(UPDATE_CAR_VIDEO, {
      id: bookingId,
      carVideo: carVideo_Status,
    });

    // 3. Step 2: Transfer funds to business wallet
    const totalAmount = parseFloat(booking.amount || "0");
    const refundableDeposit = parseFloat(booking.refundable_fee || "0");
    const amountToCredit = totalAmount - refundableDeposit;

    const logisticsId = booking.RentalVehicles?.logisticsAccounts?.id;

    if (logisticsId && amountToCredit > 0) {
      const walletData = await hasuraClient.request<any>(GET_BUSINESS_WALLET, {
        logistics_id: logisticsId,
      });

      const wallet = walletData.business_wallet?.[0];
      if (wallet) {
        const currentBalance = parseFloat(wallet.amount || "0");
        const newBalance = currentBalance + amountToCredit;

        await hasuraClient.request<any>(UPDATE_BUSINESS_WALLET, {
          id: wallet.id,
          new_amount: newBalance.toFixed(0).toString(),
        });
      }
    }

    // 4. Step 3: Finally mark booking as picked_up
    await hasuraClient.request<any>(UPDATE_BOOKING_STATUS, {
      id: bookingId,
      status: "picked_up",
    });

    // Notify Owner via SMS
    try {
      const vehicleName = booking.RentalVehicles?.name || "Vehicle";
      const ownerPhone =
        booking.RentalVehicles?.logisticsAccounts?.Users?.phone;
      const ownerName =
        booking.RentalVehicles?.logisticsAccounts?.businessName ||
        booking.RentalVehicles?.logisticsAccounts?.fullname ||
        "Vendor";

      if (ownerPhone) {
        const platNumber = booking.RentalVehicles?.platNumber || "";
        const message = `Hello ${ownerName}, your vehicle "${vehicleName}" (${platNumber}) has been successfully picked up! The condition video report is uploaded and funds have been credited.`;
        await sendSMS(ownerPhone, message);
      }
    } catch (smsErr) {
      console.error("SMS notification failed:", smsErr);
    }

    return res.status(200).json({
      success: true,
      status: "picked_up",
      amountCredited: amountToCredit,
    });
  } catch (error: any) {
    console.error("Error confirming pickup:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to confirm pickup" });
  }
}
