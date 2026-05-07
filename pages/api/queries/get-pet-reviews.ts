import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_PET_REVIEWS = gql`
  query GetPetReviews($pet_id: uuid!) {
    Ratings(
      where: { pets: { id: { _eq: $pet_id } } }
      order_by: { created_at: desc }
    ) {
      id
      rating
      review
      created_at
      # Assuming there's a customer relationship
      customer_id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { pet_id } = req.query;
    if (!pet_id) {
      return res.status(400).json({ error: "Missing pet_id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ Ratings: any[] }>(
      GET_PET_REVIEWS,
      {
        pet_id,
      }
    );

    return res.status(200).json({
      reviews: result.Ratings,
    });
  } catch (error: any) {
    console.error("Error fetching pet reviews:", error);
    return res.status(500).json({ error: error.message });
  }
}
