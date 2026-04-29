import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CHECK_PET_ADOPTION = gql`
  query CheckPetAdoption($pet_id: uuid!, $customer_id: uuid!) {
    petAdoption(
      where: { pet_id: { _eq: $pet_id }, customer_id: { _eq: $customer_id } }
      order_by: { created_at: desc }
    ) {
      id
      status
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(200).json({ isAdopted: false });
    }

    const { pet_id } = req.query;
    if (!pet_id) {
      return res.status(400).json({ error: "Missing pet_id" });
    }

    const customer_id = (session as any).user.id;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ petAdoption: any[] }>(CHECK_PET_ADOPTION, {
      pet_id,
      customer_id,
    });

    const isPaidAdoption = result.petAdoption.some((a: any) => a.status === "PAID");

    return res.status(200).json({
      isAdopted: isPaidAdoption,
      adoption: result.petAdoption[0] || null,
      status: result.petAdoption[0]?.status || null
    });
  } catch (error: any) {
    console.error("Check Pet Adoption Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
