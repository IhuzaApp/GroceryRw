import type { NextApiRequest, NextApiResponse } from "next";
import { logErrorToSlack } from "../../src/lib/slackErrorReporter";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { where, error, extra } = req.body;
    const session = await getServerSession(req, res, authOptions);

    if (!where || !error) {
      return res.status(400).json({ error: "Missing required fields: where, error" });
    }

    // Forward to Slack
    await logErrorToSlack(`[Client] ${where}`, error, {
      ...extra,
      user_id: (session?.user as any)?.id,
      user_name: session?.user?.name,
      user_email: session?.user?.email,
      userAgent: req.headers["user-agent"],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Slack Logger API Error:", err);
    return res.status(500).json({ error: "Failed to log error" });
  }
}
