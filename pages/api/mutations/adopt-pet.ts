import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo.ts";

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
      pet_vendors {
        fullname
        organisationName
        user: Users {
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
          const petName = petInfo.name;
          const vendorPhone = petInfo.pet_vendors?.user?.phone;
          const vendorName =
            petInfo.pet_vendors?.organisationName ||
            petInfo.pet_vendors?.fullname ||
            "Vendor";

          if (vendorPhone) {
            const message = `Hello ${vendorName}, your pet "${petName}" has been ordered and paid for! Customer Address: ${address}. Phone: ${phone}.`;
            await sendSMS(vendorPhone, message);
          }
        }
      } catch (smsError) {
        console.error("Failed to send SMS to vendor:", smsError);
        // Don't fail the whole request if SMS fails
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
