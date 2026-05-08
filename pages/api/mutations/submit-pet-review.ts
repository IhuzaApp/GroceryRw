import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CHECK_EXISTING_REVIEW = gql`
  query CheckExistingReview($pet_id: uuid!, $customer_id: uuid!) {
    Ratings(
      where: {
        businessProduct_id: { _eq: $pet_id }
        customer_id: { _eq: $customer_id }
      }
    ) {
      id
    }
  }
`;

const SUBMIT_PET_REVIEW = gql`
  mutation SubmitPetReview(
    $pet_id: uuid!
    $customer_id: uuid!
    $rating: Int!
    $review: String!
  ) {
    insert_Ratings_one(
      object: {
        rating: $rating
        review: $review
        customer_id: $customer_id
        Pets_id: $pet_id
        businessProduct_id: null
        order_id: null
        package_id: null
        shopper_id: null
        reel_order_id: null
        vehicleBookingsId: null
      }
    ) {
      id
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

    const { pet_id, rating, review } = req.body;
    if (!pet_id || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Manual check for existing review
    const existing = await hasuraClient.request<
      { Ratings: any[] },
      { pet_id: string; customer_id: string }
    >(CHECK_EXISTING_REVIEW, { pet_id, customer_id: (session as any).user.id });

    if (existing.Ratings.length > 0) {
      return res.status(400).json({ error: "You have already rated this pet" });
    }

    const result = await hasuraClient.request<
      { insert_Ratings_one: { id: string } },
      { pet_id: string; customer_id: string; rating: number; review: string }
    >(SUBMIT_PET_REVIEW, {
      pet_id,
      customer_id: (session as any).user.id,
      rating,
      review: review || "",
    });

    return res.status(200).json({
      success: true,
      id: result.insert_Ratings_one.id,
    });
  } catch (error: any) {
    console.error("Error submitting pet review:", error);
    return res.status(500).json({ error: error.message });
  }
}
