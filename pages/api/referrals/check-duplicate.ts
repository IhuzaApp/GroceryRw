import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Query to check for duplicates
const CHECK_DUPLICATE_REFERRAL = gql`
  query CheckDuplicateReferral(
    $user_id: uuid!
    $phone: String!
    $email: String!
    $deviceFingerprint: String!
  ) {
    Referral_window(
      where: {
        _or: [
          { user_id: { _eq: $user_id } }
          { phone: { _eq: $phone } }
          { deviceFingerprint: { _eq: $deviceFingerprint } }
          { email: { _eq: $email, _is_null: false } }
        ]
      }
    ) {
      id
      user_id
      phone
      email
      deviceFingerprint
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

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { phone, email, deviceFingerprint } = req.body;

    if (!phone || !deviceFingerprint) {
      return res
        .status(400)
        .json({ error: "Phone and device fingerprint are required" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Check for duplicates in database
    const duplicateCheck = await hasuraClient.request<{
      Referral_window: Array<{
        id: string;
        user_id: string;
        phone: string;
        email: string | null;
        deviceFingerprint: string;
      }>;
    }>(CHECK_DUPLICATE_REFERRAL, {
      user_id: session.user.id,
      phone: phone,
      email: email || "",
      deviceFingerprint: deviceFingerprint,
    });

    if (
      duplicateCheck.Referral_window &&
      duplicateCheck.Referral_window.length > 0
    ) {
      const isDev = process.env.NODE_ENV === "development";

      // Filter results to find specific conflicts
      const userIdConflict = duplicateCheck.Referral_window.find(
        (r) => r.user_id === session.user.id
      );
      const phoneConflict = duplicateCheck.Referral_window.find(
        (r) => r.phone === phone
      );
      const emailConflict = email
        ? duplicateCheck.Referral_window.find((r) => r.email === email)
        : null;
      const deviceConflict = duplicateCheck.Referral_window.find(
        (r) => r.deviceFingerprint === deviceFingerprint
      );

      if (userIdConflict) {
        return res.status(200).json({
          isDuplicate: true,
          reason: "You are already registered for the referral program.",
        });
      }

      if (phoneConflict) {
        return res.status(200).json({
          isDuplicate: true,
          reason: `The phone number ${phone} is already registered for the referral program.`,
        });
      }

      if (emailConflict) {
        return res.status(200).json({
          isDuplicate: true,
          reason: `The email ${email} is already registered for the referral program.`,
        });
      }

      // Only block device fingerprint if not in development
      if (deviceConflict && !isDev) {
        return res.status(200).json({
          isDuplicate: true,
          reason:
            "This device is already associated with an existing referral account. Please contact support if you believe this is an error.",
        });
      }

      // In development, if it's only a device conflict, log it but don't block
      if (deviceConflict && isDev) {
        console.log(
          "[Dev] Device fingerprint collision detected, but allowing for testing."
        );
      }
    }

    return res.status(200).json({
      isDuplicate: false,
      needsReview: false,
    });
  } catch (error) {
    console.error("Error checking duplicate:", error);
    return res.status(500).json({ error: "Failed to check duplicates" });
  }
}
