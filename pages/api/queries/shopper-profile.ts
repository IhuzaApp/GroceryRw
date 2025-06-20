import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";

const GET_SHOPPER_PROFILE = gql`
  query GetShopperProfile($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      id
      full_name
      address
      phone_number
      national_id
      driving_license
      transport_mode
      profile_photo
      status
      active
      background_check_completed
      onboarding_step
      created_at
      updated_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any) as { user?: { id?: string } } | null;

    if (!session?.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!hasuraClient) {
      return res.status(500).json({ message: "Internal server error" });
    }

    type ShopperProfileResponse = { shoppers: any[] };
    const { shoppers } = await hasuraClient.request<ShopperProfileResponse>(GET_SHOPPER_PROFILE, {
      user_id: session.user.id,
    });

    return res.status(200).json({
      shopper: shoppers[0] || null,
    });
  } catch (error) {
    console.error("Error fetching shopper profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
} 