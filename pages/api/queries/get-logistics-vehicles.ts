import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_LOGISTICS_VEHICLES = gql`
  query GetLogisticsVehicles($logisticAccount_id: uuid!) {
    RentalVehicles(
      where: { logisticAccount_id: { _eq: $logisticAccount_id } }
      order_by: { updated_at: desc }
    ) {
      id
      name
      category
      engine
      fuel_type
      location
      main_photo
      passenger
      price
      refundable_amount
      seats
      status
      transmission
      drive_provided
      disabled
      updated_at
      exterior
      interior
      logisticsAccounts {
        id
        fullname
        businessName
        Users {
          profile_picture
        }
      }
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

    const { logisticAccount_id } = req.query;
    if (!logisticAccount_id) {
      return res.status(400).json({ error: "Missing logisticAccount_id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ RentalVehicles: any[] }>(
      GET_LOGISTICS_VEHICLES,
      {
        logisticAccount_id,
      }
    );

    return res.status(200).json({
      vehicles: result.RentalVehicles,
    });
  } catch (error: any) {
    console.error("Error fetching logistics vehicles:", error);
    return res.status(500).json({
      error: "Failed to fetch vehicles",
      details: error.message,
    });
  }
}
