import { NextApiRequest, NextApiResponse } from "next";
import { sendSMS } from "../../../src/lib/pindo";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Missing phone or OTP" });
  }

  // Basic phone cleaning (same as registration)
  const cleanPhone = phone.replace(/\D/g, "");
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

  try {
    const message = `Plas Grocery: Your verification code is ${otp}.`;
    await sendSMS(formattedPhone, message);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to " + formattedPhone,
    });
  } catch (error: any) {
    console.error("Error sending shopper OTP:", error);
    return res.status(500).json({
      error: "Failed to send SMS. Please check the phone number.",
    });
  }
}
