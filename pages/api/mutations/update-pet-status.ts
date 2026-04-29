import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const UPDATE_PET_STATUS = gql`
  mutation UpdatePetStatus($id: uuid!, $quantity_sold: String!) {
    update_pets_by_pk(
      pk_columns: { id: $id }
      _set: { quantity_sold: $quantity_sold, updated_at: "now()" }
    ) {
      id
      quantity
      quantity_sold
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id, quantity_sold } = req.body;

    if (!id || quantity_sold === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    interface UpdatePetStatusResponse {
      update_pets_by_pk: {
        id: string;
        quantity: string;
        quantity_sold: string;
      };
    }

    const result = await hasuraClient.request<UpdatePetStatusResponse>(UPDATE_PET_STATUS, {
      id,
      quantity_sold: quantity_sold.toString(),
    });

    return res.status(200).json({
      success: true,
      pet: result.update_pets_by_pk,
    });
  } catch (error: any) {
    console.error("Error updating pet status:", error);
    return res.status(500).json({ error: error.message });
  }
}
