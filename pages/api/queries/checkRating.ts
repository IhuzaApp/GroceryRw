import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CHECK_RATING = gql`
  query CheckOrderRating($orderId: uuid!) {
    Ratings(where: {order_id: {_eq: $orderId}}) {
      id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { orderId } = req.query;

  if (!orderId) {
    return res.status(400).json({ message: "Order ID is required" });
  }

  if (!hasuraClient) {
    return res.status(500).json({ message: "Hasura client not initialized" });
  }

  try {
    const data = await hasuraClient.request(CHECK_RATING, {
      orderId: orderId,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error("Error checking rating:", error);
    return res.status(500).json({ message: "Error checking rating" });
  }
} 