import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { otpStore } from "../../../lib/otpStore";
import { sendSMS } from "../../../src/lib/pindo";

// Generate a 6-digit OTP
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
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone number is required" });
    }

    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Format for Pindo (Rwandan numbers if missing prefix)
    let formattedPhone = phone;
    if (!phone.startsWith("+")) {
      if (cleanPhone.startsWith("0")) {
        formattedPhone = "+250" + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith("250")) {
        formattedPhone = "+250" + cleanPhone;
      } else {
        formattedPhone = "+" + cleanPhone;
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP in otpStore keyed by phone number
    // We reuse the OTPData interface but many fields won't be needed for referral
    otpStore.set(cleanPhone, {
      otp,
      phone: cleanPhone,
      email: "", // Not needed for verification
      fullName: "", // Not needed for verification
      gender: "", // Not needed for verification
      expiresAt,
    });

    // Send OTP via Pindo SMS
    const message = `Your verification code for Plas Referral Program is: ${otp}. Valid for 10 minutes.`;
    await sendSMS(formattedPhone, message);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending referral OTP:", error);
    return res
      .status(500)
      .json({ error: "Failed to send OTP. Please try again." });
  }
}
