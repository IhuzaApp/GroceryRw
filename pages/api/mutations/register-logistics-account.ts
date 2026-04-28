import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const INSERT_LOGISTICS_ACCOUNT = gql`
  mutation RegisterLogisticsAccount(
    $address: String = ""
    $businessName: String = ""
    $business_cert: String = ""
    $fullname: String = ""
    $license: String = ""
    $nationalIdOrPassport: String = ""
    $num_of_cars: String = ""
    $proof_address: String = ""
    $status: String = "pending"
    $type: String = ""
    $user_id: uuid!
    $updated_on: timestamptz = "now()"
  ) {
    insert_logisticsAccount(
      objects: {
        address: $address
        businessName: $businessName
        business_cert: $business_cert
        disabled: false
        fullname: $fullname
        license: $license
        nationalIdOrPassport: $nationalIdOrPassport
        num_of_cars: $num_of_cars
        proof_address: $proof_address
        status: $status
        type: $type
        user_id: $user_id
        updated_on: $updated_on
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
    business_wallet(where: { _or: [
      { business_account: { user_id: { _eq: $user_id } } },
      { pet_vendor: { user_id: { _eq: $user_id } } },
      { logisticsAccount: { user_id: { _eq: $user_id } } }
    ]}) {
      id
    }
  }
`;

const UPDATE_WALLET_LOGISTICS = gql`
  mutation UpdateWalletLogistics($wallet_id: uuid!, $logisticsAccount_id: uuid!) {
    update_business_wallet_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { logisticsAccount_id: $logisticsAccount_id }
    ) {
      id
    }
  }
`;

const CREATE_WALLET_FOR_LOGISTICS = gql`
  mutation CreateWalletForLogistics($logisticsAccount_id: uuid!, $business_id: uuid, $amount: String = "0") {
    insert_business_wallet(
      objects: {
        amount: $amount
        logisticsAccount_id: $logisticsAccount_id
        business_id: $business_id
      }
    ) {
      returning {
        id
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      businessName,
      business_cert,
      fullname,
      license,
      nationalIdOrPassport,
      num_of_cars,
      proof_address,
      status = "pending",
      type
    } = req.body;

    // 1. Insert Logistics Account
    const logisticsResult = await hasuraClient.request(INSERT_LOGISTICS_ACCOUNT, {
      address,
      businessName,
      business_cert,
      fullname,
      license,
      nationalIdOrPassport,
      num_of_cars,
      proof_address,
      status,
      type,
      user_id
    });

    const logisticsId = logisticsResult.insert_logisticsAccount.returning[0].id;

    // 2. Handle Wallet
    const businessInfo = await hasuraClient.request(GET_USER_BUSINESS_INFO, { user_id });
    const existingWallet = businessInfo.business_wallet?.[0];
    const businessAccount = businessInfo.business_accounts?.[0];

    if (existingWallet) {
      // Update existing wallet
      await hasuraClient.request(UPDATE_WALLET_LOGISTICS, {
        wallet_id: existingWallet.id,
        logisticsAccount_id: logisticsId
      });
    } else {
      // Create new wallet
      await hasuraClient.request(CREATE_WALLET_FOR_LOGISTICS, {
        logisticsAccount_id: logisticsId,
        business_id: businessAccount?.id || null
      });
    }

    return res.status(200).json({ success: true, logisticsId });
  } catch (error: any) {
    console.error("Logistics Registration Error:", error);
    return res.status(500).json({ error: error.message || "Registration failed" });
  }
}
