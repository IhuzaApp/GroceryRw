import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const INSERT_PET_VENDOR = gql`
  mutation RegisterPetVendor(
    $address: String = ""
    $fullname: String = ""
    $nationalIdOrPassport: String = ""
    $organisationName: String = ""
    $proof_residency: String = ""
    $rdb_certificate: String = ""
    $sherter_permit: String = ""
    $specialties: String = ""
    $status: String = "pending"
    $updated_at: timestamptz = "now()"
    $user_id: uuid!
  ) {
    insert_pet_vendors(
      objects: {
        address: $address
        disabled: false
        fullname: $fullname
        nationalIdOrPassport: $nationalIdOrPassport
        organisationName: $organisationName
        proof_residency: $proof_residency
        rdb_certificate: $rdb_certificate
        sherter_permit: $sherter_permit
        specialties: $specialties
        status: $status
        updated_at: $updated_at
        user_id: $user_id
      }
      on_conflict: {
        constraint: pet_vendors_fullname_key
        update_columns: [
          address
          organisationName
          specialties
          status
          updated_at
        ]
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const GET_USER_BUSINESS_INFO = gql`
  query GetUserBusinessInfo($user_id: uuid!) {
    business_accounts(where: { user_id: { _eq: $user_id } }) {
      id
    }
    business_wallet(
      where: {
        _or: [
          { business_account: { user_id: { _eq: $user_id } } }
          { pet_vendor: { user_id: { _eq: $user_id } } }
          { logisticsAccount: { user_id: { _eq: $user_id } } }
        ]
      }
    ) {
      id
    }
  }
`;

const UPDATE_WALLET_PET_VENDOR = gql`
  mutation UpdateWalletPetVendor($wallet_id: uuid!, $petvendor_id: uuid!) {
    update_business_wallet_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { petvendor_id: $petvendor_id }
    ) {
      id
    }
  }
`;

const CREATE_WALLET_FOR_PET_VENDOR = gql`
  mutation CreateWalletForPetVendor(
    $petvendor_id: uuid!
    $business_id: uuid
    $amount: String = "0"
  ) {
    insert_business_wallet(
      objects: {
        amount: $amount
        petvendor_id: $petvendor_id
        business_id: $business_id
      }
    ) {
      returning {
        id
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
    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = (session.user as any).id;
    const {
      address,
      fullname,
      nationalIdOrPassport,
      organisationName,
      proof_residency,
      rdb_certificate,
      sherter_permit,
      specialties,
      status = "pending",
    } = req.body;

    // 1. Insert Pet Vendor
    const petVendorResult = await hasuraClient.request(INSERT_PET_VENDOR, {
      address,
      fullname,
      nationalIdOrPassport,
      organisationName,
      proof_residency,
      rdb_certificate,
      sherter_permit,
      specialties,
      status,
      user_id,
    });

    const petVendorId = petVendorResult.insert_pet_vendors.returning[0].id;

    // 2. Handle Wallet
    const businessInfo = await hasuraClient.request(GET_USER_BUSINESS_INFO, {
      user_id,
    });
    const existingWallet = businessInfo.business_wallet?.[0];
    const businessAccount = businessInfo.business_accounts?.[0];

    if (existingWallet) {
      // Update existing wallet
      await hasuraClient.request(UPDATE_WALLET_PET_VENDOR, {
        wallet_id: existingWallet.id,
        petvendor_id: petVendorId,
      });
    } else {
      // Create new wallet
      await hasuraClient.request(CREATE_WALLET_FOR_PET_VENDOR, {
        petvendor_id: petVendorId,
        business_id: businessAccount?.id || null,
      });
    }

    return res.status(200).json({ success: true, petVendorId });
  } catch (error: any) {
    console.error("Pet Vendor Registration Error:", error);
    return res
      .status(500)
      .json({ error: error.message || "Registration failed" });
  }
}
