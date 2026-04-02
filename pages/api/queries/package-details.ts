import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import type { Session } from "next-auth";
import { logger } from "../../../src/utils/logger";

const GET_PACKAGE_DETAILS = gql`
  query GetPackageDetails($id: uuid!) {
    package_delivery(where: {id: {_eq: $id}}) {
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
      pickup_latitude
      pickup_longitude
      dropoff_latitude
      dropoff_longitude
      user_id
      payment_method
      shopper_id
      updated_at
      shopper {
        Employment_id
        Police_Clearance_Cert
        full_name
        phone
        phone_number
        profile_photo
        active
      }
      Users {
        email
        name
        phone
      }
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

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Package ID is required" });
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

    const data = (await hasuraClient.request(GET_PACKAGE_DETAILS, {
      id: id,
    })) as { package_delivery: any[] };

    const pkg = data.package_delivery?.[0];

    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }

    // Security check: verify the user owns the package
    if (pkg.user_id !== userId) {
      return res.status(403).json({ error: "Unauthorized access to package" });
    }

    return res.status(200).json({ 
      package: pkg 
    });
  } catch (error: any) {
    logger.error("Error fetching package details", "PackageDetailsAPI", error);
    res.status(500).json({ error: "Failed to fetch package details" });
  }
}
