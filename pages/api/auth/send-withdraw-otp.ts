import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";
import { otpStore } from "../../../lib/otpStore";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";

const WITHDRAW_OTP_KEY_PREFIX = "withdraw-";

const GET_SHOPPER_PHONE = gql`
  query GetShopperPhone($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      phone_number
    }
  }
`;

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any);

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;
    const email = (session.user as { email?: string }).email ?? "";

    // Fetch shopper profile phone number
    if (!hasuraClient) {
      throw new Error("Hasura client not initialized");
    }

    const shopperData = await hasuraClient.request<{
      shoppers: Array<{ phone_number: string }>;
    }>(GET_SHOPPER_PHONE, { user_id: userId });

    const shopperPhone = shopperData.shoppers[0]?.phone_number;

    if (!shopperPhone) {
      return res.status(404).json({
        error: "Shopper profile or phone number not found",
        message: "Please ensure your profile is complete with a phone number.",
      });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${WITHDRAW_OTP_KEY_PREFIX}${userId}`, {
      otp,
      email: email.toLowerCase(),
      fullName: "Withdraw",
      gender: "other",
      expiresAt,
    });

    // Send OTP via SMS
    const message = `Plas Grocery: Your withdrawal verification code is ${otp}.`;
    let smsSent = false;
    try {
      await sendSMS(shopperPhone, message);
      smsSent = true;
    } catch (smsError) {
      console.error("Failed to send withdraw OTP SMS:", smsError);
      // We continue to return 200 because the OTP is still valid in the store
      // and can be seen in the dev console or fallback methods
    }

    console.log("=".repeat(50));
    console.log("🔐 WITHDRAW OTP");
    console.log(`User ID: ${userId}`);
    console.log(`Phone: ${shopperPhone}`);
    console.log(`OTP: ${otp}`);
    console.log(`SMS Sent: ${smsSent}`);
    console.log("=".repeat(50));

    return res.status(200).json({
      success: true,
      message: smsSent
        ? "Verification code sent to your registered phone number."
        : "OTP generated successfully (SMS delivery failed).",
      otp,
      devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error: any) {
    console.error("Send withdraw OTP error:", error);
    return res.status(500).json({
      error: error.message || "Failed to send OTP",
    });
  }
}
