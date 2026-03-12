import type { NextApiRequest, NextApiResponse } from "next";
import { sendBusinessRegistrationNoticeToSlack } from "../../src/lib/slackSupportNotifier";
import { logErrorToSlack } from "../../src/lib/slackErrorReporter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fullName, businessName, email, phone, description } = req.body;

    // Basic validation
    if (!fullName || !businessName || !email || !phone) {
      return res.status(400).json({
        error: "Missing required fields: fullName, businessName, email, phone",
      });
    }

    // Send to Slack
    await sendBusinessRegistrationNoticeToSlack({
      fullName,
      businessName,
      email,
      phone,
      description: description || "",
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Business registration error:", err);
    await logErrorToSlack("api/business-registration", err, req.body);
    return res.status(500).json({
      error: "Failed to submit registration",
    });
  }
}
