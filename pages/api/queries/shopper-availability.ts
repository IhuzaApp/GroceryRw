import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_SHOPPER_AVAILABILITY = gql`
  query GetShopperAvailability {
    Shopper_Availability {
      id
      user_id
      is_available
      created_at
    }
  }
`;

interface ShopperAvailabilityResponse {
  Shopper_Availability: Array<{
    id: string;
    user_id: string;
    is_available: boolean;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await hasuraClient.request<ShopperAvailabilityResponse>(
      GET_SHOPPER_AVAILABILITY
    );
    res.status(200).json({ shopper_availability: data.Shopper_Availability });
  } catch (error) {
    console.error("Error fetching shopper availability:", error);
    res.status(500).json({ error: "Failed to fetch shopper availability" });
  }
}
