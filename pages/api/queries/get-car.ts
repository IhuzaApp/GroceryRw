import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_CAR_BY_ID = gql`
  query GetCarById($id: uuid!) {
    RentalVehicles_by_pk(id: $id) {
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
        Users {
          id
          image: profile_picture
        }
      }
      vehicleBookings(where: { status: { _in: ["PAID", "approved"] } }) {
        id
        pickup_date
        return_date
        status
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{ RentalVehicles_by_pk: any }>(
      GET_CAR_BY_ID,
      {
        id,
      }
    );

    return res.status(200).json({
      car: result.RentalVehicles_by_pk,
    });
  } catch (error: any) {
    console.error("Error fetching car by id:", error);
    return res.status(500).json({
      error: "Failed to fetch car",
      details: error.message,
    });
  }
}
