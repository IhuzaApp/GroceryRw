import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendNewBusinessAccountRegistrationToSlack } from "../../../src/lib/slackSupportNotifier";
import { sendSMS } from "../../../src/lib/pindo";
import { resend } from "../../../src/lib/resend";

const CREATE_BUSINESS_ACCOUNT = gql`
  mutation CreateBusinessAccount(
    $user_id: uuid!
    $account_type: String!
    $status: String!
    $business_name: String = ""
    $business_email: String = ""
    $business_phone: String = ""
    $business_location: String = ""
    $rdb_certificate: String = ""
    $id_image: String = ""
    $face_image: String = ""
  ) {
    insert_business_accounts(
      objects: {
        user_id: $user_id
        account_type: $account_type
        status: $status
        business_name: $business_name
        business_email: $business_email
        business_phone: $business_phone
        business_location: $business_location
        rdb_certificate: $rdb_certificate
        id_image: $id_image
        face_image: $face_image
      }
    ) {
      affected_rows
      returning {
        id
        account_type
        status
        business_name
        created_at
      }
    }
  }
`;

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface Session {
  user: SessionUser;
  expires: string;
}

interface CreateBusinessAccountInput {
  account_type: "personal" | "business";
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_location?: string;
  rdb_certificate?: string;
  id_image?: string;
  face_image?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const user_id = session.user.id;
    const {
      account_type,
      business_name,
      business_email,
      business_phone,
      business_location,
      rdb_certificate,
      id_image,
      face_image,
    } = req.body as CreateBusinessAccountInput;

    // Validate required fields based on account type
    if (
      !account_type ||
      (account_type !== "personal" && account_type !== "business")
    ) {
      return res.status(400).json({ error: "Invalid account type" });
    }

    if (account_type === "business") {
      if (
        !business_name ||
        !business_email ||
        !business_phone ||
        !business_location ||
        !rdb_certificate ||
        !face_image
      ) {
        return res.status(400).json({
          error: "Missing required fields for business account",
          required: [
            "business_name",
            "business_email",
            "business_phone",
            "business_location",
            "rdb_certificate",
            "face_image",
          ],
        });
      }
    } else {
      // Personal account
      if (!business_name || !face_image || !id_image || !business_location) {
        return res.status(400).json({
          error: "Missing required fields for personal account",
          required: [
            "business_name",
            "face_image",
            "id_image",
            "business_location",
          ],
        });
      }
    }

    // Build variables - use empty strings for fields that aren't provided
    // This ensures we don't violate NOT NULL constraints
    const variables: Record<string, any> = {
      user_id,
      account_type,
      status: "pending_review",
      business_name: business_name?.trim() || "",
      business_email: business_email?.trim() || "",
      business_phone: business_phone?.trim() || "",
      business_location: business_location?.trim() || "",
      rdb_certificate: rdb_certificate || "",
      id_image: id_image || "",
      face_image: face_image || "",
    };

    const result = await hasuraClient.request<{
      insert_business_accounts: {
        affected_rows: number;
        returning: Array<{
          id: string;
          account_type: string;
          status: string;
          business_name: string | null;
          created_at: string;
        }>;
      };
    }>(CREATE_BUSINESS_ACCOUNT, variables);

    if (
      !result.insert_business_accounts ||
      result.insert_business_accounts.affected_rows === 0
    ) {
      throw new Error("Failed to create business account");
    }

    const createdAccount = result.insert_business_accounts.returning[0];

    try {
      await sendNewBusinessAccountRegistrationToSlack({
        account_type: account_type as "personal" | "business",
        business_name: (business_name?.trim() || "") as string,
        contact_name: session.user.name ?? undefined,
        email:
          (business_email?.trim() || session.user.email || "").trim() || "—",
        phone:
          (
            business_phone?.trim() ||
            (session.user as any).phone ||
            ""
          ).trim() || "—",
        business_location: business_location?.trim() || undefined,
        provided: {
          business_name: !!(business_name && business_name.trim()),
          business_email: !!(business_email && business_email.trim()),
          business_phone: !!(business_phone && business_phone.trim()),
          business_location: !!(business_location && business_location.trim()),
          rdb_certificate: !!(rdb_certificate && rdb_certificate.trim()),
          id_image: !!(id_image && id_image.trim()),
          face_image: !!(face_image && face_image.trim()),
        },
      });
    } catch (notifyErr: any) {
      console.warn(
        "Failed to notify Slack of new business account registration:",
        notifyErr?.message || notifyErr
      );
    }

    // 2. Send SMS and Email notifications to the user
    try {
      const targetEmail = (business_email?.trim() || session.user.email || "").trim();
      const targetPhone = (business_phone?.trim() || (session.user as any).phone || "").trim();
      const accountName = business_name?.trim() || session.user.name || "Business";

      // Send SMS
      if (targetPhone && targetPhone !== "—") {
        try {
          await sendSMS(
            targetPhone,
            `Hello ${accountName}, your registration for Plas Business is successful and is now under review. A Plas Agent will contact you soon.`
          );
        } catch (smsErr) {
          console.warn("Failed to send registration SMS:", smsErr);
        }
      }

      // Send Email
      if (targetEmail && targetEmail !== "—" && targetEmail.includes("@")) {
        try {
          await resend.emails.send({
            from: "PlasBusiness <PlasBusiness@plas.rw>",
            to: targetEmail,
            subject: "Business Registration Under Review - Plas",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #10b981;">Registration Successful!</h2>
                <p>Dear <strong>${accountName}</strong>,</p>
                <p>Thank you for registering with <strong>Plas Business</strong>. We are excited to have you on board!</p>
                <p>Your account is currently <strong>under review</strong> by our team. This is a standard procedure to ensure the safety and quality of our ecosystem.</p>
                <p>A <strong>Plas Agent</strong> will contact you soon via phone or email to finalize the process.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #666;">This is an automated message from Plas Business. If you have any questions, please contact our support team.</p>
              </div>
            `,
          });
        } catch (emailErr) {
          console.warn("Failed to send registration Email:", emailErr);
        }
      }
    } catch (notifyUserErr) {
      console.warn("Critical failure in notification logic:", notifyUserErr);
    }

    return res.status(200).json({
      success: true,
      account: {
        id: createdAccount.id,
        accountType: createdAccount.account_type,
        status: createdAccount.status,
        businessName: createdAccount.business_name,
        createdAt: createdAccount.created_at,
      },
    });
  } catch (error: any) {
    console.error("Error creating business account:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response,
      errors: error.response?.errors,
    });

    // Return more detailed error information
    const errorMessage =
      error.response?.errors?.[0]?.message || error.message || "Unknown error";
    const errorCode = error.response?.errors?.[0]?.extensions?.code;

    return res.status(500).json({
      error: "Failed to create business account",
      message: errorMessage,
      code: errorCode,
      details: error.response?.errors || undefined,
    });
  }
}
