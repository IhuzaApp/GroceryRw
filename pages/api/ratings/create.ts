import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const CREATE_RATING = gql`
  mutation CreateRating($rating: Ratings_insert_input!) {
    insert_Ratings_one(object: $rating) {
      id
      rating
      review
      delivery_experience
      packaging_quality
      professionalism
      order_id
      reel_order_id
      created_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get user session
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as any;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      order_id,
      reel_order_id,
      shopper_id,
      rating,
      review,
      delivery_experience,
      packaging_quality,
      professionalism,
    } = req.body;

    // Validate required fields
    if (!shopper_id || !rating) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate that either order_id or reel_order_id is provided
    if (!order_id && !reel_order_id) {
      return res.status(400).json({ error: "Either order_id or reel_order_id is required" });
    }

    // Create rating record
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const ratingData = {
      order_id: order_id || null,
      reel_order_id: reel_order_id || null,
      shopper_id,
      customer_id: session.user.id,
      rating,
      review: review || "",
      delivery_experience,
      packaging_quality,
      professionalism,
      reviewed_at: new Date().toISOString(),
    };

    const data = await hasuraClient.request(CREATE_RATING, {
      rating: ratingData,
    });

    // Add type checking for the response data
    if (data && typeof data === "object" && "insert_Ratings_one" in data) {
      return res.status(201).json(data.insert_Ratings_one);
    }

    throw new Error("Invalid response data");
  } catch (error) {
    console.error("Error creating rating:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to create rating",
    });
  }
}
