import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";

const GET_BOOKING_DETAILS = gql`
  query GetBookingDetails($id: uuid!) {
    vehicleBookings_by_pk(id: $id) {
      id
      amount
      status
      customer_id
      vehicle_id
      pickup_date
      return_date
      RentalVehicles {
        name
        logisticAccount_id
        logisticsAccounts {
          businessName
          fullname
          User {
            phone
          }
        }
      }
    }
  }
`;

const GET_PERSONAL_WALLET = gql`
  query GetPersonalWallet($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
    }
  }
`;

const UPDATE_PERSONAL_WALLET = gql`
  mutation UpdatePersonalWallet($id: uuid!, $balance: String!) {
    update_personalWallet_by_pk(
      pk_columns: { id: $id }
      _set: { balance: $balance, updated_at: "now()" }
    ) {
      id
    }
  }
`;

const GET_BUSINESS_WALLET = gql`
  query GetBusinessWallet($business_id: uuid!) {
    business_wallet(where: { business_id: { _eq: $business_id } }) {
      id
      amount
    }
  }
`;

const UPDATE_BUSINESS_WALLET = gql`
  mutation UpdateBusinessWallet($id: uuid!, $amount: String!) {
    update_business_wallet_by_pk(
      pk_columns: { id: $id }
      _set: { amount: $amount, updated_at: "now()" }
    ) {
      id
    }
  }
`;

const UPDATE_BOOKING_STATUS = gql`
  mutation UpdateBookingStatus($id: uuid!, $status: String!) {
    update_vehicleBookings_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, updated_at: "now()" }
    ) {
      id
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

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: "Missing bookingId" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // 1. Fetch booking details
    const bookingRes = await hasuraClient.request<any>(GET_BOOKING_DETAILS, {
      id: bookingId,
    });
    const booking = bookingRes.vehicleBookings_by_pk;

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // --- New Cancellation Logic ---
    const now = new Date();
    const pickupDate = new Date(booking.pickup_date);
    const returnDate = new Date(booking.return_date);

    // Set pickup time to 6 AM as per requirement
    const pickup6AM = new Date(pickupDate);
    pickup6AM.setHours(6, 0, 0, 0);

    const durationDays = Math.ceil(
      (returnDate.getTime() - pickupDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const hoursToPickup =
      (pickup6AM.getTime() - now.getTime()) / (1000 * 60 * 60);
    const daysToPickup = hoursToPickup / 24;

    if (durationDays > 3) {
      // More than 3 days: Cannot cancel if 1 or 2 days remaining to pickup
      if (daysToPickup <= 2 && daysToPickup > 0) {
        return res.status(400).json({
          error:
            "For bookings longer than 3 days, cancellation is not allowed within 2 days of pickup.",
        });
      }
    } else {
      // 1-3 days (today or tomorrow bookings): Cannot cancel 12 hours before 6 AM pickup
      if (hoursToPickup <= 12 && hoursToPickup > 0) {
        return res.status(400).json({
          error:
            "Cancellation is not allowed within 12 hours of the 6 AM pickup time.",
        });
      }
    }

    if (now > pickup6AM) {
      return res
        .status(400)
        .json({
          error: "Cannot cancel a booking after the pickup time has passed.",
        });
    }
    // ------------------------------

    const originalAmount = parseFloat(booking.amount || "0");
    let refundAmount = 0;
    let businessFee = 0;
    let systemFee = 0;

    // 2. Calculate refund based on status
    if (booking.status === "ACCEPTED") {
      // 5% total fee: 2.5% to business, 2.5% to system
      systemFee = originalAmount * 0.025;
      businessFee = originalAmount * 0.025;
      refundAmount = originalAmount - systemFee - businessFee;
    } else {
      // 2% total fee (system fee)
      systemFee = originalAmount * 0.02;
      refundAmount = originalAmount - systemFee;
    }

    // 3. Update personal wallet (Refund)
    const walletRes = await hasuraClient.request<any>(GET_PERSONAL_WALLET, {
      user_id: booking.customer_id,
    });
    const wallet = walletRes.personalWallet?.[0];

    if (wallet) {
      const currentBalance = parseFloat(wallet.balance || "0");
      const newBalance = currentBalance + refundAmount;
      await hasuraClient.request(UPDATE_PERSONAL_WALLET, {
        id: wallet.id,
        balance: newBalance.toFixed(2),
      });
    }

    // 4. Update business wallet (If accepted)
    if (businessFee > 0 && booking.RentalVehicles?.logisticAccount_id) {
      const bWalletRes = await hasuraClient.request<any>(GET_BUSINESS_WALLET, {
        business_id: booking.RentalVehicles.logisticAccount_id,
      });
      const bWallet = bWalletRes.business_wallet?.[0];
      if (bWallet) {
        const currentAmount = parseFloat(bWallet.amount || "0");
        const newAmount = currentAmount + businessFee;
        await hasuraClient.request(UPDATE_BUSINESS_WALLET, {
          id: bWallet.id,
          amount: newAmount.toFixed(2),
        });
      }
    }

    // 5. Update booking status
    await hasuraClient.request(UPDATE_BOOKING_STATUS, {
      id: bookingId,
      status: "CANCELLED",
    });

    // Notify Owner via SMS
    try {
      const vehicleName = booking.RentalVehicles?.name;
      const ownerPhone =
        booking.RentalVehicles?.logisticsAccounts?.User?.phone;
      const ownerName =
        booking.RentalVehicles?.logisticsAccounts?.businessName ||
        booking.RentalVehicles?.logisticsAccounts?.fullname ||
        "Vendor";

      if (ownerPhone) {
        const message = `Hello ${ownerName}, the booking for your vehicle "${vehicleName}" has been CANCELLED by the customer. The vehicle is now available again for booking.`;
        await sendSMS(ownerPhone, message);
      }
    } catch (smsErr) {
      console.error("SMS notification failed:", smsErr);
    }

    return res.status(200).json({
      success: true,
      refundAmount,
      feeTaken: originalAmount - refundAmount,
    });
  } catch (error: any) {
    console.error("Cancel Booking Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Cancellation failed" });
  }
}
