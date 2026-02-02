import { NextApiRequest, NextApiResponse } from "next";
import { logErrorToSlack } from "../../src/lib/slackErrorReporter";

/**
 * API route for client-side error reporting. Accepts error details and forwards to Slack.
 * Used by client components (e.g. PickupConfirmationScanner, userPayment, DeliveryConfirmationModal).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { where, message, stack, extra } = req.body || {};
    if (!where || !message) {
      return res.status(400).json({
        error: "Missing required fields: where and message",
      });
    }

    const err =
      stack && message
        ? Object.assign(new Error(message), { stack })
        : new Error(message);

    await logErrorToSlack(where, err, extra && typeof extra === "object" ? extra : undefined);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: "Failed to report error" });
  }
}
