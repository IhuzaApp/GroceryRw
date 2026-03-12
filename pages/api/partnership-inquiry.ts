import type { NextApiRequest, NextApiResponse } from "next";
import { notifyPartnershipInquiryToSlack, PartnershipInquiryPayload } from "../../src/lib/slackSystemNotifier";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const payload: PartnershipInquiryPayload = req.body;

    // Basic validation
    if (!payload.businessName || !payload.contactPerson || !payload.phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await notifyPartnershipInquiryToSlack(payload);

    return res.status(200).json({ message: "Inquiry sent successfully" });
  } catch (error) {
    console.error("Error in partnership-inquiry API:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
