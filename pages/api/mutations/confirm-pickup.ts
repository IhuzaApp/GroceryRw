import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

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
        logisticAccount_id
        logisticsAccounts {
          id
        }
      }
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation ConfirmPickup($id: uuid!, $status: String!) {
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

const UPDATE_BUSINESS_WALLET = gql`
  mutation CreditBusinessWallet($id: uuid!, $new_amount: numeric!) {
    update_business_wallet_by_pk(
      pk_columns: { id: $id }
      _set: { amount: $new_amount }
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

  const session = await getServerSession(req, res, authOptions as any) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { bookingId } = req.body;
  if (!bookingId) {
    return res.status(400).json({ error: "Missing bookingId" });
  }

  try {
    // 1. Get booking details
    const bookingData = await hasuraClient.request<any>(GET_BOOKING, { id: bookingId });
    const booking = bookingData.vehicleBookings_by_pk;

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.customer_id !== session.user.id) {
      return res.status(403).json({ error: "Not authorized for this booking" });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({ error: "Booking must be approved before confirming pickup" });
    }

    // 2. Mark booking as picked_up
    await hasuraClient.request<any>(UPDATE_STATUS, {
      id: bookingId,
      status: "picked_up",
    });

    // 3. Transfer funds to business wallet (excluding refundable deposit)
    const totalAmount = parseFloat(booking.amount || "0");
    const serviceFee = parseFloat(booking.services_fee || "0");
    const refundableDeposit = parseFloat(booking.refundable_fee || "0");
    const amountToCredit = totalAmount + serviceFee - refundableDeposit;

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
          new_amount: newBalance,
        });
      }
    }

    return res.status(200).json({
      success: true,
      amountCredited: amountToCredit,
      refundableDeposit,
    });
  } catch (error: any) {
    console.error("Error confirming pickup:", error);
    return res.status(500).json({ error: error.message || "Failed to confirm pickup" });
  }
}
