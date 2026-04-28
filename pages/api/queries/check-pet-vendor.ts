import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CHECK_PET_VENDOR = gql`
  query CheckPetVendor($user_id: uuid!) {
    pet_vendors(where: { user_id: { _eq: $user_id } }) {
      id
      fullname
      organisationName
      status
      disabled
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const user_id = (session as any).user.id;

    const result = await hasuraClient.request<{ pet_vendors: any[] }>(CHECK_PET_VENDOR, {
      user_id,
    });

    return res.status(200).json({
      hasAccount: result.pet_vendors.length > 0,
      account: result.pet_vendors[0] || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
