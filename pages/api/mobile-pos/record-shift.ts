import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    closing_stock,
    opening_stock,
    orgUser_id,
    shift_durantion,
    shop_id
  } = req.body;

  if (!hasuraClient) {
    return res.status(500).json({ error: "Hasura client not initialized" });
  }

  try {
    const RECORD_SHIFT_MUTATION = gql`
      mutation RecordShift($closing_stock: String!, $opening_stock: String!, $orgUser_id: uuid!, $shift_durantion: String!, $shop_id: uuid!, $update_at: timestamptz!) {
        insert_SalesRecordings(objects: {
          closing_stock: $closing_stock, 
          opening_stock: $opening_stock, 
          orgUser_id: $orgUser_id, 
          shift_durantion: $shift_durantion, 
          shop_id: $shop_id, 
          update_at: $update_at
        }) {
          affected_rows
        }
      }
    `;

    const variables = {
      closing_stock: String(closing_stock),
      opening_stock: String(opening_stock),
      orgUser_id,
      shift_durantion,
      shop_id,
      update_at: new Date().toISOString()
    };

    const data: any = await hasuraClient.request(RECORD_SHIFT_MUTATION, variables);

    if (data.insert_SalesRecordings?.affected_rows > 0) {
      return res.status(200).json({ success: true });
    } else {
      throw new Error("Failed to insert sales recording");
    }

  } catch (error: any) {
    console.error("Failed to record shift:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
