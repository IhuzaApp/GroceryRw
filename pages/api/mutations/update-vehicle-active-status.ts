import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const UPDATE_VEHICLE_ACTIVE = gql`
  mutation UpdateVehicleActive($id: uuid!, $status: String!) {
    update_RentalVehicles_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
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

    const { vehicleId, active } = req.body;
    if (!vehicleId || active === undefined) {
      return res.status(400).json({ error: "Missing vehicleId or active status" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request(UPDATE_VEHICLE_ACTIVE, {
      id: vehicleId,
      status: active ? "active" : "disabled",
    });

    return res.status(200).json({ success: true, vehicle: (result as any).update_RentalVehicles_by_pk });
  } catch (error: any) {
    console.error("Error updating vehicle status:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
