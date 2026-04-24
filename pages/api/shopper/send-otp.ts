import { NextApiRequest, NextApiResponse } from "next";
import { sendSMS } from "../../../src/lib/pindo";
import { resend } from "../../../src/lib/resend";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, otp, email } = req.body;

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
    
    // 1. Send SMS via Pindo
    const smsPromise = sendSMS(formattedPhone, message);
    
    // 2. Send Email via Resend if email is provided
    let emailPromise = Promise.resolve(null);
    if (email) {
      emailPromise = resend.emails.send({
        from: "Plas Grocery <onboarding@resend.dev>",
        to: email,
        subject: "Your Verification Code",
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981; text-align: center;">Plas Grocery Verification</h2>
            <p>Hello,</p>
            <p>Your verification code for the transaction is:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="text-align: center; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} Plas Grocery. All rights reserved.</p>
          </div>
        `,
      });
    }

    // Wait for both (or at least SMS)
    await Promise.all([smsPromise, emailPromise]);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully via SMS to ${formattedPhone}${email ? " and via Email" : ""}`,
    });
  } catch (error: any) {
    console.error("Error sending shopper OTP:", error);
    return res.status(500).json({
      error: "Failed to send OTP. Please try again.",
    });
  }
}
