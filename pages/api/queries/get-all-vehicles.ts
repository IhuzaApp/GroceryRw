import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ALL_VEHICLES = gql`
  query GetAllVehicles {
    RentalVehicles(
      where: { disabled: { _eq: false }, status: { _eq: "active" } }
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
      logisticAccount_id
      logisticsAccounts {
        id
        fullname
        businessName
        user {
          image: profile_picture
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
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ RentalVehicles: any[] }>(
      GET_ALL_VEHICLES
    );

    return res.status(200).json({
      vehicles: result.RentalVehicles,
    });
  } catch (error: any) {
    console.error("Error fetching all vehicles:", error);
    return res.status(500).json({
      error: "Failed to fetch vehicles",
      details: error.message,
    });
  }
}
