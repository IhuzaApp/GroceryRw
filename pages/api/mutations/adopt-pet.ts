import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo.ts";
import { sendNotificationToUser } from "../../../src/services/fcmService";

const UPDATE_PET_QUANTITY_SOLD = gql`
  mutation UpdatePetQuantitySold($id: uuid!, $quantity_sold: String!) {
    update_pets_by_pk(
      pk_columns: { id: $id }
      _set: { quantity_sold: $quantity_sold }
    ) {
      id
      quantity_sold
    }
  }
`;

const INSERT_PET_ADOPTION = gql`
  mutation RegisterPetAdoption(
    $address: String = ""
    $amount: String = ""
    $comment: String = ""
    $customer_id: uuid!
    $latitude: String = ""
    $longitude: String = ""
    $pet_id: uuid!
    $phone: String = ""
    $status: String = "pending"
    $updated_at: timestamptz = "now()"
  ) {
    insert_petAdoption(
      objects: {
        address: $address
        amount: $amount
        comment: $comment
        customer_id: $customer_id
        latitude: $latitude
        longitude: $longitude
        pet_id: $pet_id
        phone: $phone
        status: $status
        updated_at: $updated_at
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const GET_VENDER_AND_PET_INFO = gql`
  query GetVendorAndPetInfo($pet_id: uuid!) {
    pets_by_pk(id: $pet_id) {
      name
      quantity_sold
      pet_vendors {
        fullname
        organisationName
        user {
          id
          phone
        }
      }
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
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const customer_id = (session as any).user.id;
    const {
      pet_id,
      address = "",
      amount = "0",
      comment = "",
      phone = "",
      latitude = "",
      longitude = "",
      status = "PAID",
    } = req.body;

    if (!pet_id) {
      return res.status(400).json({ error: "Missing pet_id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<any>(INSERT_PET_ADOPTION, {
      pet_id,
      customer_id,
      address,
      amount: amount.toString(),
      comment,
      phone,
      latitude,
      longitude,
      status,
    });

    if (status === "PAID") {
      try {
        const infoResult = await hasuraClient.request<any>(
          GET_VENDER_AND_PET_INFO,
          { pet_id }
        );
        const petInfo = infoResult.pets_by_pk;
        if (petInfo) {
          try {
            const currentSold = parseInt(petInfo.quantity_sold || "0", 10);
            const newSold = (currentSold + 1).toString();
            await hasuraClient.request(UPDATE_PET_QUANTITY_SOLD, {
              id: pet_id,
              quantity_sold: newSold,
            });
          } catch (incErr) {
            console.error("Failed to increment pet quantity_sold:", incErr);
          }

          const petName = petInfo.name;
          const vendorPhone = petInfo.pet_vendors?.user?.phone;
          const vendorUserId = petInfo.pet_vendors?.user?.id;
          const vendorName =
            petInfo.pet_vendors?.organisationName ||
            petInfo.pet_vendors?.fullname ||
            "Vendor";

          const message = `Hello ${vendorName}, your pet "${petName}" has been ordered and paid for! Customer Address: ${address}. Phone: ${phone}.`;

          if (vendorPhone) {
            await sendSMS(vendorPhone, message);
          }

          if (vendorUserId) {
            try {
              await sendNotificationToUser(vendorUserId, {
                title: "New Pet Adoption! 🐾",
                body: `Your pet "${petName}" has been adopted and paid for!`,
                data: {
                  type: "pet_adoption",
                  petId: pet_id,
                },
              });
            } catch (notifErr) {
              console.error("Failed to send FCM notification:", notifErr);
            }
          }
        }
      } catch (smsError) {
        console.error("Failed to process post-adoption tasks:", smsError);
        // Don't fail the whole request if SMS/Update fails
      }
    }

    return res.status(200).json({
      success: true,
      affected_rows: result.insert_petAdoption.affected_rows,
      id: result.insert_petAdoption.returning?.[0]?.id,
    });
  } catch (error: any) {
    console.error("Pet Adoption Error:", error);
    return res.status(500).json({ error: error.message || "Adoption failed" });
  }
}
