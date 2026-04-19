import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]";
import { GraphQLClient, gql } from "graphql-request";
import { otpStore } from "../../../../lib/otpStore";
import bcrypt from "bcryptjs";
import { logErrorToSlack } from "../../../../src/lib/slackErrorReporter";

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

  const { token, otp, newPassword } = req.body;

  if (!token || !otp || !newPassword) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 1. Verify OTP using Token
  const storedData = otpStore.get(token);

  if (!storedData) {
    return res.status(400).json({
      error:
        "Verification code expired or not found. Please request a new one.",
    });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(token);
    return res.status(400).json({
      error: "Verification code expired. Please request a new one.",
    });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ error: "Invalid verification code" });
  }

  const { email } = storedData;

  // Extra safety check: ensure the email matches the session user
  if (email !== session.user.email) {
    return res.status(403).json({ error: "Forbidden: Session mismatch" });
  }

  try {
    // 2. Hash New Password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // 3. Update Password in Hasura
    const mutation = gql`
      mutation UpdatePassword($email: String!, $password_hash: String!) {
        update_Users(
          where: { email: { _eq: $email } }
          _set: { password_hash: $password_hash }
        ) {
          affected_rows
        }
      }
    `;

    const result = await hasuraClient.request<{
      update_Users: { affected_rows: number };
    }>(mutation, { email, password_hash });

    if (result.update_Users.affected_rows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // 4. Cleanup Token
    otpStore.delete(token);

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error: any) {
    console.error("Verify and change password error:", error);
    await logErrorToSlack("VerifyPasswordOTP:API", error, { email });
    return res
      .status(500)
      .json({ error: "Failed to update password. Please try again." });
  }
}
