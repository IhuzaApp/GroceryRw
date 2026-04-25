import { NextApiRequest, NextApiResponse } from "next";
import { sendSMS } from "../../../src/lib/pindo";
import { resend } from "../../../src/lib/resend";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_SHOPPER_PHONE = gql`
  query GetShopperPhone($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      phone_number
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

  const { phone: bodyPhone, otp, email } = req.body;

  if (!otp) {
    return res.status(400).json({ error: "Missing OTP" });
  }

  let targetPhone = bodyPhone;

  try {
    // Try to get phone from shopper profile if logged in
    const session = await getServerSession(req, res, authOptions as any);
    if (session?.user?.id && hasuraClient) {
      const shopperData = await hasuraClient.request<{
        shoppers: Array<{ phone_number: string }>;
      }>(GET_SHOPPER_PHONE, { user_id: session.user.id });
      
      const profilePhone = shopperData.shoppers[0]?.phone_number;
      if (profilePhone) {
        targetPhone = profilePhone;
        console.log(`[send-otp] Using profile phone: ${targetPhone}`);
      }
    }

    if (!targetPhone && !email) {
      return res.status(400).json({ error: "Phone number or email is required" });
    }

    let smsPromise = Promise.resolve(null);
    let formattedPhone = targetPhone;

    if (targetPhone) {
      // Basic phone cleaning (same as registration)
      const cleanPhone = targetPhone.replace(/\D/g, "");
      if (!targetPhone.startsWith("+")) {
        if (cleanPhone.startsWith("0")) {
          formattedPhone = "+250" + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith("250")) {
          formattedPhone = "+250" + cleanPhone;
        } else {
          formattedPhone = "+" + cleanPhone;
        }
      }

      const message = `Plas Grocery: Your verification code is ${otp}.`;
      
      console.log(`🚀 [send-otp] Preparing to send Pindo SMS to: ${formattedPhone} (Original: ${targetPhone})`);
      
      // 1. Send SMS via Pindo
      smsPromise = sendSMS(formattedPhone, message);
    }
    
    // 2. Send Email via Resend if email is provided
    let emailPromise = Promise.resolve(null);
    if (email) {
      emailPromise = resend.emails.send({
        from: "Plas Grocery <no-reply@plas.rw>",
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

    // Wait for both without failing the entire request if one fails
    const results = await Promise.allSettled([smsPromise, emailPromise]);
    
    const smsResult = results[0];
    const emailResult = results[1];

    if (smsResult.status === "rejected") {
      console.error("SMS sending failed:", smsResult.reason);
    }
    if (emailResult.status === "rejected") {
      console.error("Email sending failed:", emailResult.reason);
    }

    return res.status(200).json({
      success: true,
      message: `OTP sending process completed`,
    });
  } catch (error: any) {
    console.error("Error sending shopper OTP:", error);
    return res.status(500).json({
      error: "Failed to send OTP. Please try again.",
    });
  }
}
