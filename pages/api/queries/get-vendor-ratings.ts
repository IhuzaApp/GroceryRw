import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_VENDOR_RATINGS = gql`
  query GetVendorRatings($vendor_id: uuid!) {
    Ratings(where: { pets: { vendor_id: { _eq: $vendor_id } } }) {
      id
      rating
      review
      created_at
      pets {
        id
        name
        amount
        quantity_sold
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

    const result = await hasuraClient.request<{ Ratings: any[] }>(
      GET_VENDOR_RATINGS,
      {
        vendor_id,
      }
    );

    return res.status(200).json({
      ratings: result.Ratings,
    });
  } catch (error: any) {
    console.error("Error fetching vendor ratings:", error);
    return res.status(500).json({ error: error.message });
  }
}
