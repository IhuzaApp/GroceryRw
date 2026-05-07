import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_VENDOR_ADOPTIONS = gql`
  query GetVendorAdoptions($vendor_id: uuid!) {
    petAdoption(
      where: { pets: { vendor_id: { _eq: $vendor_id } } }
      order_by: { created_at: desc }
    ) {
      id
      amount
      status
      address
      phone
      comment
      created_at
      customer_id
      customer: User {
        id
        name
        email
        phone
      }
      pet: pets {
        id
        name
        image
        pet_type
        breed
        amount
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { vendor_id } = req.query;
    if (!vendor_id) {
      return res.status(400).json({ error: "Missing vendor_id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ petAdoption: any[] }>(
      GET_VENDOR_ADOPTIONS,
      {
        vendor_id,
      }
    );

    return res.status(200).json({
      adoptions: result.petAdoption,
    });
  } catch (error: any) {
    console.error("Error fetching vendor adoptions:", error);
    return res.status(500).json({
      error: "Failed to fetch adoptions",
      details: error.message,
    });
  }
}
