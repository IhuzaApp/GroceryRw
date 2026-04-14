import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";
import { sendNewShopperRegistrationToSlack } from "../../../src/lib/slackSupportNotifier";
import { resend } from "../../../src/lib/resend";
import { renderToBuffer } from "@react-pdf/renderer";
import { ShopperContractPDF } from "../../../src/components/shopper/ShopperContractPDF";
import React from 'react';

const REGISTER_SHOPPER = gql`
  mutation RegisterShopper(
    $Police_Clearance_Cert: String = ""
    $address: String = ""
    $driving_license: String
    $drivingLicense_Image: String
    $driving_license_front: String
    $driving_license_back: String
    $plate_number: String
    $email: String
    $full_name: String = ""
    $guarantor: String = ""
    $guarantorPhone: String = ""
    $guarantorRelationship: String = ""
    $latitude: String = ""
    $longitude: String = ""
    $mutual_StatusCertificate: String = ""
    $mutual_status: String = ""
    $national_id: String = ""
    $national_id_photo_back: String = ""
    $national_id_photo_front: String = ""
    $onboarding_step: String = ""
    $phone_number: String = ""
    $profile_photo: String = ""
    $proofOfResidency: String = ""
    $signature: String = ""
    $SignaturePad: String = ""
    $status: String = ""
    $transport_mode: String = ""
    $user_id: uuid = ""
    $dob: String = ""
    $face_verified: Boolean = false
    $face_liveness_images: jsonb
    $verification_metadata: jsonb
  ) {
    insert_shoppers(
      objects: {
        Police_Clearance_Cert: $Police_Clearance_Cert
        active: false
        address: $address
        background_check_completed: false
        driving_license: $driving_license
        drivingLicense_Image: $drivingLicense_Image
        driving_license_front: $driving_license_front
        driving_license_back: $driving_license_back
        plate_number: $plate_number
        email: $email
        full_name: $full_name
        guarantor: $guarantor
        guarantorPhone: $guarantorPhone
        guarantorRelationship: $guarantorRelationship
        latitude: $latitude
        longitude: $longitude
        mutual_StatusCertificate: $mutual_StatusCertificate
        mutual_status: $mutual_status
        national_id: $national_id
        national_id_photo_back: $national_id_photo_back
        national_id_photo_front: $national_id_photo_front
        needCollection: false
        onboarding_step: $onboarding_step
        phone: $phone_number
        phone_number: $phone_number
        profile_photo: $profile_photo
        proofOfResidency: $proofOfResidency
        signature: $signature
        SignaturePad: $SignaturePad
        status: $status
        transport_mode: $transport_mode
        user_id: $user_id
        dob: $dob
        face_verified: $face_verified
        face_liveness_images: $face_liveness_images
        verification_metadata: $verification_metadata
      }
    ) {
      affected_rows
    }
  }
`;

// Update an existing shopper
const UPDATE_SHOPPER = gql`
  mutation UpdateShopper(
    $shopper_id: uuid!
    $full_name: String!
    $address: String!
    $phone_number: String!
    $national_id: String!
    $driving_license: String
    $drivingLicense_Image: String
    $driving_license_front: String
    $driving_license_back: String
    $plate_number: String
    $email: String
    $transport_mode: String!
    $profile_photo: String
    $Police_Clearance_Cert: String
    $guarantor: String
    $guarantorPhone: String
    $guarantorRelationship: String
    $latitude: String
    $longitude: String
    $mutual_StatusCertificate: String
    $mutual_status: String
    $national_id_photo_back: String
    $national_id_photo_front: String
    $proofOfResidency: String
    $signature: String
    $SignaturePad: String
    $collection_comment: String
    $needCollection: Boolean
    $dob: String
    $face_verified: Boolean
    $face_liveness_images: jsonb
    $verification_metadata: jsonb
  ) {
    update_shoppers_by_pk(
      pk_columns: { id: $shopper_id }
      _set: {
        full_name: $full_name
        address: $address
        phone_number: $phone_number
        national_id: $national_id
        driving_license: $driving_license
        drivingLicense_Image: $drivingLicense_Image
        driving_license_front: $driving_license_front
        driving_license_back: $driving_license_back
        plate_number: $plate_number
        email: $email
        transport_mode: $transport_mode
        profile_photo: $profile_photo
        Police_Clearance_Cert: $Police_Clearance_Cert
        guarantor: $guarantor
        guarantorPhone: $guarantorPhone
        guarantorRelationship: $guarantorRelationship
        latitude: $latitude
        longitude: $longitude
        mutual_StatusCertificate: $mutual_StatusCertificate
        mutual_status: $mutual_status
        national_id_photo_back: $national_id_photo_back
        national_id_photo_front: $national_id_photo_front
        proofOfResidency: $proofOfResidency
        signature: $signature
        SignaturePad: $SignaturePad
        collection_comment: $collection_comment
        needCollection: $needCollection
        dob: $dob
        face_verified: $face_verified
        face_liveness_images: $face_liveness_images
        verification_metadata: $verification_metadata
        status: "pending"
        updated_at: "now()"
      }
    ) {
      id
      status
      active
      onboarding_step
    }
  }
`;

// Check if shopper already exists
const CHECK_SHOPPER_EXISTS = gql`
  query CheckShopperExists($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      id
      status
      full_name
      address
      phone_number
      national_id
      driving_license
      drivingLicense_Image
      transport_mode
      profile_photo
    }
  }
`;

interface RegisterShopperInput {
  full_name: string;
  address: string;
  phone_number: string;
  national_id: string;
  driving_license?: string;
  drivingLicense_Image?: string;
  driving_license_front?: string;
  driving_license_back?: string;
  plate_number?: string;
  email?: string;
  transport_mode: string;
  profile_photo?: string;
  user_id: string;
  force_update?: boolean; // Optional parameter to force update even if already registered
  Police_Clearance_Cert?: string;
  guarantor?: string;
  guarantorPhone?: string;
  guarantorRelationship?: string;
  latitude?: string;
  longitude?: string;
  mutual_StatusCertificate?: string;
  mutual_status?: string;
  national_id_photo_back?: string;
  national_id_photo_front?: string;
  proofOfResidency?: string;
  signature?: string;
  collection_comment?: string;
  needCollection?: boolean;
  dob?: string;
  face_verified?: boolean;
  face_liveness_images?: Record<string, string>;
  verification_metadata?: Record<string, any>;
}

interface RegisterShopperResponse {
  insert_shoppers: {
    affected_rows: number;
  };
}

interface UpdateShopperResponse {
  update_shoppers_by_pk: {
    id: string;
    status: string;
    active: boolean;
    onboarding_step: string;
  };
}

interface CheckShopperResponse {
  shoppers: Array<{
    id: string;
    status: string;
    full_name: string;
    address: string;
    phone_number: string;
    national_id: string;
    driving_license: string | null;
    transport_mode: string;
    profile_photo: string | null;
  }>;
}

interface CheckPhoneResponse {
  shoppers: Array<{
    id: string;
    user_id: string;
    full_name: string;
    phone_number: string;
    status: string;
  }>;
}

// Define the session user type
interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

// Define the session type
interface Session {
  user: SessionUser;
  expires: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let userId: string | null = null;
  let requestDataSize: number | undefined;

  try {
    // Verify the user is authenticated
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session || !session.user) {
      return res
        .status(401)
        .json({ error: "You must be authenticated to register as a shopper" });
    }

    if (!hasuraClient) {
      throw new Error(
        "Hasura client is not initialized. Please check server configuration."
      );
    }

    // Log the request data size for debugging
    requestDataSize = JSON.stringify(req.body).length;
    console.log(
      `Received shopper registration request, data size: ${(
        requestDataSize / 1024
      ).toFixed(2)} KB`
    );

    const {
      full_name,
      address,
      phone_number,
      national_id,
      driving_license,
      drivingLicense_Image,
      driving_license_front,
      driving_license_back,
      plate_number,
      email,
      transport_mode,
      profile_photo,
      user_id,
      force_update = false, // Default to false if not provided
      Police_Clearance_Cert,
      guarantor,
      guarantorPhone,
      guarantorRelationship,
      latitude,
      longitude,
      mutual_StatusCertificate,
      mutual_status,
      national_id_photo_back,
      national_id_photo_front,
      proofOfResidency,
      signature,
      collection_comment,
      needCollection,
      dob,
      face_verified,
      face_liveness_images,
      verification_metadata,
    } = req.body as RegisterShopperInput;
    userId = user_id;

    // Validate required fields
    if (
      !full_name ||
      !address ||
      !phone_number ||
      !national_id ||
      !transport_mode ||
      !user_id
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "All required fields must be provided",
      });
    }

    // Verify the user ID in the request matches the authenticated user
    if (user_id !== session.user.id) {
      return res.status(403).json({
        error: "User ID mismatch. You can only register yourself as a shopper.",
      });
    }

    // Check if the phone number is already registered by another user
    try {
      const phoneCheckData = await hasuraClient.request<CheckPhoneResponse>(
        gql`
          query CheckPhoneNumber($phone_number: String!, $user_id: uuid!) {
            shoppers(
              where: {
                phone_number: { _eq: $phone_number }
                user_id: { _neq: $user_id }
              }
            ) {
              id
              user_id
              full_name
              phone_number
              status
            }
          }
        `,
        { phone_number, user_id }
      );

      if (phoneCheckData.shoppers.length > 0) {
        const existingPhoneUser = phoneCheckData.shoppers[0];
        return res.status(409).json({
          error: "Phone number already registered",
          message: `This phone number is already registered by another user. Please use a different phone number.`,
          existing_user: existingPhoneUser.user_id,
        });
      }
    } catch (phoneCheckError) {
      await logErrorToSlack("RegisterShopperAPI:phoneCheck", phoneCheckError, {
        user_id,
        phone_number,
      });
      // Continue with registration attempt if phone check fails
    }

    // Check if the user is already registered as a shopper
    const existingShopperData =
      await hasuraClient.request<CheckShopperResponse>(CHECK_SHOPPER_EXISTS, {
        user_id,
      });

    if (existingShopperData.shoppers.length > 0) {
      const existingShopper = existingShopperData.shoppers[0];

      // Always update the existing shopper record (automatic update for existing users)
      try {
        const updateData = await hasuraClient.request<UpdateShopperResponse>(
          UPDATE_SHOPPER,
          {
            shopper_id: existingShopper.id,
            full_name,
            address,
            phone_number: existingShopper.phone_number || phone_number, // Use existing phone number or new one
            national_id,
            driving_license: driving_license || null,
            drivingLicense_Image: drivingLicense_Image || null,
            driving_license_front: driving_license_front || null,
            driving_license_back: driving_license_back || null,
            plate_number: plate_number || null,
            email: email || null,
            transport_mode,
            profile_photo: profile_photo || "",
            Police_Clearance_Cert: Police_Clearance_Cert || "",
            guarantor: guarantor || "",
            guarantorPhone: guarantorPhone || "",
            guarantorRelationship: guarantorRelationship || "",
            latitude: latitude || "",
            longitude: longitude || "",
            mutual_StatusCertificate: mutual_StatusCertificate || "",
            mutual_status: mutual_status || "",
            national_id_photo_back: national_id_photo_back || "",
            national_id_photo_front: national_id_photo_front || "",
            proofOfResidency: proofOfResidency || "",
            signature: signature || "",
            collection_comment: "", // Clear the collection comment after update
            needCollection: false, // Set needCollection to false after update
            dob: dob || "",
            SignaturePad: signature || "",
            face_verified: face_verified ?? false,
            face_liveness_images: face_liveness_images || null,
            verification_metadata: verification_metadata || null,
          }
        );

        return res.status(200).json({
          success: true,
          shopper: updateData.update_shoppers_by_pk,
          updated: true,
        });
      } catch (updateError: any) {
        console.error("Error updating existing shopper:", updateError);
        await logErrorToSlack("RegisterShopperAPI:updateShopper", updateError, {
          user_id,
          shopper_id: existingShopper.id,
        });
        return res.status(500).json({
          error: "Failed to update shopper application",
          message: updateError.message,
          details:
            updateError.response?.errors || "No additional details available",
        });
      }
    }

    // Register new shopper with all data in one operation
    const data = await hasuraClient.request<RegisterShopperResponse>(
      REGISTER_SHOPPER,
      {
        Police_Clearance_Cert: Police_Clearance_Cert || "",
        address,
        driving_license: driving_license || null,
        drivingLicense_Image: drivingLicense_Image || null,
        driving_license_front: driving_license_front || null,
        driving_license_back: driving_license_back || null,
        plate_number: plate_number || null,
        email: email || null,
        full_name,
        guarantor: guarantor || "",
        guarantorPhone: guarantorPhone || "",
        guarantorRelationship: guarantorRelationship || "",
        latitude: latitude || "",
        longitude: longitude || "",
        mutual_StatusCertificate: mutual_StatusCertificate || "",
        mutual_status: mutual_status || "",
        national_id,
        national_id_photo_back: national_id_photo_back || "",
        national_id_photo_front: national_id_photo_front || "",
        onboarding_step: "application_submitted",
        phone_number,
        profile_photo: profile_photo || "",
        proofOfResidency: proofOfResidency || "",
        signature: signature || "",
        status: "pending",
        transport_mode,
        user_id,
        dob: dob || "",
        SignaturePad: signature || "",
        face_verified: face_verified ?? false,
        face_liveness_images: face_liveness_images || null,
        verification_metadata: verification_metadata || null,
      }
    );

    try {
      await sendNewShopperRegistrationToSlack({
        full_name,
        phone_number,
        address: address || undefined,
        transport_mode,
        provided: {
          profile_photo: !!(profile_photo && profile_photo.trim()),
          national_id_photos: !!(
            (national_id_photo_front && national_id_photo_front.trim()) ||
            (national_id_photo_back && national_id_photo_back.trim())
          ),
          driving_license: !!(
            (driving_license && driving_license.trim()) ||
            (drivingLicense_Image && drivingLicense_Image.trim())
          ),
          police_clearance: !!(
            Police_Clearance_Cert && Police_Clearance_Cert.trim()
          ),
          guarantor: !!(
            (guarantor && guarantor.trim()) ||
            (guarantorPhone && guarantorPhone.trim()) ||
            (guarantorRelationship && guarantorRelationship.trim())
          ),
          proof_of_residency: !!(proofOfResidency && proofOfResidency.trim()),
          signature: !!(signature && signature.trim()),
        },
      });
    } catch (notifyErr: any) {
      console.error(
        "Failed to notify Slack of new shopper registration:",
        notifyErr
      );
      await logErrorToSlack(
        "RegisterShopperAPI:newShopperSlackNotify",
        notifyErr,
        { user_id, full_name, phone_number }
      );
    }

    // --- Start: Send Welcome Email via Resend ---
    try {
      const dateStr = new Date().toLocaleDateString('en-RW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Generate PDF Contract
      const pdfBuffer = await renderToBuffer(
        React.createElement(ShopperContractPDF, { data: req.body, date: dateStr })
      );

      // Email Content with "How to Earn" info
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #00D9A5; padding: 30px; text-align: center;">
            <img src="https://www.plas.rw/assets/logos/PlasLogoPNG.png" alt="Plas Logo" style="width: 140px; margin-bottom: 10px;">
            <div style="margin-top: 10px;">
              <img src="https://www.plas.rw/assets/logos/PlasIcon.png" alt="Plas Icon" style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid #fff;">
            </div>
            <h1 style="color: #fff; margin: 10px 0 0; font-size: 24px;">Welcome to the Plasa Family!</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear <strong>${full_name}</strong>,</p>
            <p>Congratulations! Your application to join Rwanda's premium delivery network has been received and is now pending verification. We are thrilled to have you onboard.</p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #00D9A5; margin-top: 0;">🚀 How to Earn as a Plasa</h3>
              <ul style="padding-left: 20px;">
                <li style="margin-bottom: 10px;"><strong>Flexible Earnings:</strong> For regular and reel orders, you earn <strong>100% of the delivery fee + the service fee</strong>. For restaurant orders, you earn the <strong>delivery fee</strong>.</li>
                <li style="margin-bottom: 10px;"><strong>Smart Assignment:</strong> Our system sends you personalized offers based on your proximity. No need to compete; if you see an offer, it's exclusively for you while you review it!</li>
                <li style="margin-bottom: 10px;"><strong>Manage Your Load:</strong> You can work on up to <strong>2 active orders</strong> at a time to maximize your efficiency.</li>
                <li style="margin-bottom: 10px;"><strong>Weekly Payouts:</strong> Get your earnings settled directly to your wallet with regular withdrawal options.</li>
              </ul>
            </div>

            <p><strong>Next Steps:</strong> Our security team will verify your documents (National ID and Police Clearance) within 48 hours. Once verified, you'll be able to "Go-Live" and start accepting orders.</p>
            
            <p>Attached to this email is your <strong>Digital Shopper Agreement</strong> for your records.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0;">Warm regards,</p>
              <p style="margin: 5px 0; font-weight: bold; color: #00D9A5;">Plas Support Team</p>
              <p style="margin: 0; font-size: 12px; color: #999;">Kigali, Rwanda | www.plas.rw</p>
            </div>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Plas Business <onboarding@plas.rw>',
        to: [email || session.user.email || ''],
        subject: 'Welcome to Plasa Business - Your Application & Agreement',
        html: emailHtml,
        attachments: [
          {
            filename: 'Shopper_Agreement_Plas.pdf',
            content: pdfBuffer,
          },
        ],
      });

      console.log(`[Resend] Welcome email sent to ${email || session.user.email}`);
    } catch (emailErr) {
      console.error("[Resend] Failed to send welcome email:", emailErr);
      // We don't throw here as the database registration was successful
      await logErrorToSlack("RegisterShopperAPI:EmailNotification", emailErr, { user_id: userId, email });
    }
    // --- End: Send Welcome Email ---

    res.status(200).json({
      success: true,
      affected_rows: data.insert_shoppers.affected_rows,
      shopper: {
        status: "pending",
        active: false,
        onboarding_step: "application_submitted",
      },
    });
  } catch (error: any) {
    // Log the error for debugging
    console.error("Shopper registration error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.errors,
    });

    await logErrorToSlack("RegisterShopperAPI", error, {
      userId,
      method: req.method,
      requestDataSize,
    });

    // Return a more detailed error message
    res.status(500).json({
      error: "Failed to register shopper",
      message: error.message,
      details: error.response?.errors || "No additional details available",
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
