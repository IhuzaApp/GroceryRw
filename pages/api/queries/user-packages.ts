import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";
import { logger } from "../../../src/utils/logger";

const GET_USER_PACKAGES = gql`
  query GetUserPackages($user_id: uuid!) {
    package_delivery(
      where: { user_id: { _eq: $user_id } }
      order_by: { created_at: desc }
    ) {
      id
      DeliveryCode
      pickupLocation
      dropoffLocation
      status
      delivery_fee
      created_at
      package_image
      receiverName
      receiverPhone
      comment
      deliveryMethod
      distance
      dropoffDetails
      pickupDetials
      scheduled
      timeAndDate
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = (session.user as any).id;

    if (!userId) {
      return res.status(400).json({ error: "User ID not found in session" });
    }

    const data = await hasuraClient.request(GET_USER_PACKAGES, {
      user_id: userId,
    });

    return res.status(200).json({
      packages: data.package_delivery || [],
    });
  } catch (error) {
    logger.error("Error fetching user packages", "UserPackagesAPI", error);
    res.status(500).json({ error: "Failed to fetch user packages" });
  }
}
