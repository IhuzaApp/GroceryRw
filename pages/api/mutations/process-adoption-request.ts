import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSMS } from "../../../src/lib/pindo";
import { sendNotificationToUser } from "../../../src/services/fcmService";

const UPDATE_ADOPTION_STATUS = gql`
  mutation UpdateAdoptionStatus($id: uuid!, $status: String!) {
    update_petAdoption_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status }
    ) {
      id
      status
      customer_id
      pets {
        name
        vendor_id
      }
      User {
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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!hasuraClient) {
    return res.status(500).json({ error: "Database client not initialized" });
  }

  try {
    const session = await getServerSession(req, res, authOptions as any);
    if (!session || !(session as any).user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { adoptionId, action } = req.body; // action: 'ACCEPT' or 'CANCEL'
    if (!adoptionId || !action) {
      return res.status(400).json({ error: "Missing adoptionId or action" });
    }

    const newStatus = (action === "ACCEPT") ? "ACCEPTED" : "CANCELLED";

    const result = await hasuraClient.request<any>(UPDATE_ADOPTION_STATUS, {
      id: adoptionId,
      status: newStatus,
    });

    const adoption = result.update_petAdoption_by_pk;
    if (!adoption) {
       return res.status(404).json({ error: "Adoption not found" });
    }

    // Notify Customer
    try {
      const customerPhone = adoption.User?.phone;
      const petName = adoption.pets?.name || "Pet";
      const customerName = adoption.User?.name || "Customer";

      if (customerPhone) {
        let message = "";
        if (action === "ACCEPT") {
          message = `Hello ${customerName}, your adoption of "${petName}" has been ACCEPTED by the vendor! Please confirm receipt once you have the pet. 🐾`;
        } else {
          message = `Hello ${customerName}, unfortunately your adoption of "${petName}" has been CANCELLED as it is no longer available. Please contact support for a refund.`;
        }
        await sendSMS(customerPhone, message);
      }

      if (adoption.customer_id) {
        await sendNotificationToUser(adoption.customer_id, {
          title: action === "ACCEPT" ? "Adoption Accepted! 🐾" : "Adoption Cancelled",
          body: action === "ACCEPT" 
            ? `Your adoption of "${petName}" was accepted. Confirm receipt once you get it!`
            : `Your adoption of "${petName}" was cancelled.`,
          data: {
            type: "pet_adoption_status",
            status: newStatus,
            adoptionId,
          }
        });
      }
    } catch (notifErr) {
      console.error("Failed to notify customer:", notifErr);
    }

    return res.status(200).json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error("Error processing adoption request:", error);
    return res.status(500).json({ error: error.message || "Failed to process request" });
  }
}
