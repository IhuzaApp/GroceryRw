import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const ADD_CAR_MUTATION = gql`
  mutation AddCar(
    $category: String = ""
    $disabled: Boolean = false
    $drive_provided: Boolean = false
    $engine: String = ""
    $exterior: String = ""
    $fuel_type: String = ""
    $interior: String = ""
    $location: String = ""
    $logisticAccount_id: uuid = ""
    $main_photo: String = ""
    $name: String = ""
    $passenger: String = ""
    $price: String = ""
    $refundable_amount: String = ""
    $seats: String = ""
    $status: String = ""
    $transmission: String = ""
    $updated_at: timestamptz = ""
  ) {
    insert_RentalVehicles(
      objects: {
        category: $category
        disabled: $disabled
        drive_provided: $drive_provided
        engine: $engine
        exterior: $exterior
        fuel_type: $fuel_type
        interior: $interior
        location: $location
        logisticAccount_id: $logisticAccount_id
        main_photo: $main_photo
        name: $name
        passenger: $passenger
        price: $price
        refundable_amount: $refundable_amount
        seats: $seats
        status: $status
        transmission: $transmission
        updated_at: $updated_at
      }
    ) {
      affected_rows
      returning {
        id
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
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const carData = req.body;

    // Add default values and timestamps
    const variables = {
      ...carData,
      updated_at: new Date().toISOString(),
      disabled: carData.disabled || false,
      status: carData.status || "active",
    };

    interface AddCarResponse {
      insert_RentalVehicles: {
        affected_rows: number;
        returning: Array<{ id: string }>;
      };
    }

    const result = await hasuraClient.request<AddCarResponse>(
      ADD_CAR_MUTATION,
      variables
    );

    return res.status(200).json({
      success: true,
      affected_rows: result.insert_RentalVehicles.affected_rows,
      car: result.insert_RentalVehicles.returning[0],
    });
  } catch (error: any) {
    console.error("Error adding car:", error);
    return res.status(500).json({
      error: "Failed to add car",
      details: error.message,
    });
  }
}
