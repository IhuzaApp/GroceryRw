import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_VENDOR_PETS = gql`
  query GetVendorPets($vendor_id: uuid!) {
    pets(where: { vendor_id: { _eq: $vendor_id } }, order_by: { updated_at: desc }) {
      id
      name
      pet_type
      breed
      age
      months
      gender
      weight
      color
      amount
      free
      quantity
      quantity_sold
      story
      vaccinated
      vaccination_cert
      vaccinations
      image
      parent_images
      video
      updated_at
      vendor_id
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    const result = await hasuraClient.request<{ pets: any[] }>(GET_VENDOR_PETS, {
      vendor_id,
    });

    return res.status(200).json({
      pets: result.pets,
    });
  } catch (error: any) {
    console.error("Error fetching vendor pets:", error);
    return res.status(500).json({ error: error.message });
  }
}
