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

  const { fingerprint, userId, location, details } = req.body;

  if (!hasuraClient) {
    return res.status(500).json({ error: "Hasura client not initialized" });
  }

  try {
    const REGISTER_DEVICE_MUTATION = gql`
      mutation RecordLogin($fingerprint: String!, $loc: String!, $uid: uuid!, $details: String!) {
        insert_POSMobileConnect(objects: {
          fingerprint: $fingerprint, 
          location: $loc, 
          orgUser_id: $uid, 
          phone_details: $details
        }) { 
          affected_rows 
        }
      }
    `;

    const variables = { 
      fingerprint: fingerprint || "unknown", 
      loc: location || "unknown", 
      uid: userId, 
      details: details || "unknown" 
    };

    const data: any = await hasuraClient.request(REGISTER_DEVICE_MUTATION, variables);

    if (data.insert_POSMobileConnect?.affected_rows > 0) {
      return res.status(200).json({ success: true });
    } else {
      throw new Error("Failed to register device");
    }
  } catch (error: any) {
    console.error("Device registration failed:", error);
    // We return 200 even on error for device registration to not block the login flow
    return res.status(200).json({ success: false, message: "Device logging failed but login continues" });
  }
}
