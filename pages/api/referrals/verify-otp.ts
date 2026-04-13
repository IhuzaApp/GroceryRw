import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { otpStore } from "../../../lib/otpStore";

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

    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ error: "Phone number and code are required" });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");
    
    // Get stored OTP data
    const storedData = otpStore.get(cleanPhone);

    if (!storedData) {
      return res.status(400).json({ error: "No OTP sent to this number or OTP has expired" });
    }

    // Check if expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Check if code matches
    if (storedData.otp !== code) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Success - delete OTP from store
    otpStore.delete(cleanPhone);

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully"
    });
  } catch (error: any) {
    console.error("Error verifying referral OTP:", error);
    return res
      .status(500)
      .json({ error: "Verification failed. Please try again." });
  }
}
