import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]";
import { GraphQLClient, gql } from "graphql-request";
import { otpStore } from "../../../../lib/otpStore";
import { resend } from "../../../../src/lib/resend";
import { sendSMS } from "../../../../src/lib/pindo";
import { logErrorToSlack } from "../../../../src/lib/slackErrorReporter";
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

  const session = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;

  try {
    // 1. Get user details from database
    const getUserQuery = gql`
      query GetUser($id: uuid!) {
        Users_by_pk(id: $id) {
          id
          email
          phone
          name
        }
      }
    `;

    const userData = await hasuraClient.request<{
      Users_by_pk: { id: string; email: string; phone: string; name: string };
    }>(getUserQuery, { id: userId });

    const user = userData.Users_by_pk;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Generate 6-digit OTP and unique token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = crypto.randomUUID();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3. Store OTP in otpStore
    otpStore.set(token, {
      otp,
      email: user.email,
      phone: user.phone || "",
      fullName: user.name,
      expiresAt,
    });

    // 4. Send SMS via Pindo
    if (user.phone) {
      try {
        await sendSMS(
          user.phone,
          `Your password change verification code is: ${otp}. This code expires in 10 minutes.`
        );
      } catch (smsError) {
        console.error("Failed to send password change SMS:", smsError);
        // We don't block the whole process if SMS fails, but we log it
      }
    }

    // 5. Send Email via Resend
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #089675ff; padding: 30px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">Security Verification</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello ${user.name},</p>
          <p>You requested a password change for your Plas account. Use the verification code below to proceed:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background-color: #f9f9f9; padding: 15px 30px; border-radius: 12px; border: 2px dashed #00D9A5; letter-spacing: 5px; font-size: 32px; font-weight: bold; color: #00D9A5;">
              ${otp}
            </div>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">This code will expire in 10 minutes.</p>
          </div>
          
          <p>If you didn't request this change, please contact support immediately.</p>
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "Plas Security <onboarding@plas.rw>",
      to: [user.email],
      subject: "Password Change Verification Code",
      html: emailHtml,
    });

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your phone and email",
      token,
    });
  } catch (error: any) {
    console.error("Request password OTP error:", error);
    await logErrorToSlack("RequestPasswordOTP:API", error, { userId });
    return res
      .status(500)
      .json({ error: "Failed to send verification code. Please try again." });
  }
}
