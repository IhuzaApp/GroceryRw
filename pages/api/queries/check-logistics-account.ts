import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CHECK_LOGISTICS_ACCOUNT = gql`
  query CheckLogisticsAccount($user_id: uuid!) {
    logisticsAccount(where: { user_id: { _eq: $user_id } }) {
      id
      fullname
      businessName
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

    const result = await hasuraClient.request<{ logisticsAccount: any[] }>(CHECK_LOGISTICS_ACCOUNT, {
      user_id,
    });

    return res.status(200).json({
      hasAccount: result.logisticsAccount.length > 0,
      account: result.logisticsAccount[0] || null,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
