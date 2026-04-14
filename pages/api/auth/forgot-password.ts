import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
import { otpStore } from "../../../lib/otpStore";
import { resend } from "../../../src/lib/resend";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";
import crypto from "crypto";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;

const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 1. Check if user exists
    const checkUserQuery = gql`
      query CheckUser($email: String!) {
        Users(where: { email: { _eq: $email } }) {
          id
          name
        }
      }
    `;

    const userData = await hasuraClient.request<{
      Users: Array<{ id: string; name: string }>;
    }>(checkUserQuery, { email });

    if (userData.Users.length === 0) {
      return res.status(404).json({ error: "No account found with this email address" });
    }

    const user = userData.Users[0];

    // 2. Generate 6-digit OTP and unique reset token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomUUID();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3. Store OTP in otpStore (using resetToken as key)
    otpStore.set(resetToken, {
      otp,
      email,
      fullName: user.name,
      phone: "", // Not needed for password reset
      gender: "", // Not needed
      expiresAt,
    });

    // 4. Send Reset Email via Resend
    const resetLink = `https://plas.rw/Auth/ResetPassword?token=${resetToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #089675ff; padding: 30px; text-align: center;">
          <div style="margin-bottom: 10px;">
            <img src="https://www.plas.rw/assets/logos/PlasIcon.png" alt="Plas Icon" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          </div>
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Reset Your Password</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${user.name},</p>
          <p>We received a request to reset the password for your Plas account. Use the verification code below to proceed:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #f9f9f9; padding: 15px 30px; border-radius: 12px; border: 2px dashed #00D9A5; letter-spacing: 5px; font-size: 32px; font-weight: bold; color: #00D9A5;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">This code will expire in 10 minutes.</p>
          </div>

          <p>Alternatively, you can click the button below to go directly to the password reset page:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #009673ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          
          <p>If you didn't request this change, you can safely ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin: 0;">Warm regards,</p>
            <p style="margin: 5px 0; font-weight: bold; color: #02906fff;">Plas Security Team</p>
                      <img src="https://www.plas.rw/assets/logos/PlasLogoPNG.png" alt="Plas Logo" style="width: 140px; margin-bottom: 5px;">
            <p style="margin: 0; font-size: 12px; color: #999;">Kigali, Rwanda | www.plas.rw</p>
          </div>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: 'Plas Security <onboarding@plas.rw>',
      to: [email],
      subject: 'Reset your Plas Password',
      html: emailHtml,
    });

    return res.status(200).json({
      success: true,
      message: "Reset code sent to your email",
      token: resetToken
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    await logErrorToSlack("ForgotPassword:API", error, { email });
    return res.status(500).json({ error: "Failed to process request. Please try again." });
  }
}
