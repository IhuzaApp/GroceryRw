import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getSession } from "next-auth/react";
import { logger } from "../../../src/utils/logger";

const GET_SHOPPER_AVAILABILITY = gql`
  query GetShopperAvailability($userId: uuid!) {
    Shopper_Availability(
      where: { user_id: { _eq: $userId } }
      order_by: { day_of_week: asc }
    ) {
      id
      user_id
      is_available
      created_at
      end_time
      day_of_week
      start_time
      updated_at
    }
  }
`;

interface ShopperAvailabilityResponse {
  Shopper_Availability: Array<{
    id: string;
    user_id: string;
    is_available: boolean;
    created_at: string;
    end_time: string;
    day_of_week: number;
    start_time: string;
    updated_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession({ req });
    const userId = session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<ShopperAvailabilityResponse>(
      GET_SHOPPER_AVAILABILITY,
      { userId }
    );

    logger.info(
      "Shopper availability query result:",
      "ShopperAvailabilityAPI",
      {
        userId,
        availabilityCount: data.Shopper_Availability.length,
      }
    );

    res.status(200).json({ shopper_availability: data.Shopper_Availability });
  } catch (error) {
    logger.error(
      "Error fetching shopper availability:",
      "ShopperAvailabilityAPI",
      error
    );
    res.status(500).json({ error: "Failed to fetch shopper availability" });
  }
}
