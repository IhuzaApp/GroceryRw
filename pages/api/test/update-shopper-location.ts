import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

interface UpdateShopperResponse {
  update_Shopper_Availability: {
    returning: Array<{
      id: string;
      current_latitude: number;
      current_longitude: number;
    }>;
  };
}

const UPDATE_SHOPPER_LOCATION = gql`
  mutation UpdateShopperLocation(
    $user_id: uuid!
    $latitude: float8!
    $longitude: float8!
  ) {
    update_Shopper_Availability(
      where: { user_id: { _eq: $user_id } }
      _set: { current_latitude: $latitude, current_longitude: $longitude }
    ) {
      returning {
        id
        current_latitude
        current_longitude
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const { location } = req.body;
    if (!location?.latitude || !location?.longitude) {
      return res.status(400).json({ error: "Invalid location data" });
    }

    // Update shopper's location
    const response = await hasuraClient.request<UpdateShopperResponse>(
      UPDATE_SHOPPER_LOCATION,
      {
        user_id: session.user.id,
        latitude: location.latitude,
        longitude: location.longitude,
      }
    );

    if (!response.update_Shopper_Availability?.returning?.length) {
      return res.status(404).json({ error: "Shopper not found" });
    }

    return res.status(200).json({
      success: true,
      location: response.update_Shopper_Availability.returning[0],
    });
  } catch (error) {
    console.error("Error updating shopper location:", error);
    return res.status(500).json({
      error: "Failed to update shopper location",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
