import { NextApiRequest, NextApiResponse } from "next";
import { saveFCMToken } from "../../../src/services/fcmService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId, token, platform = "web" } = req.body;

    if (!userId || !token) {
      return res.status(400).json({
        error: "Missing required fields: userId and token",
      });
    }

    console.log("🔍 [FCM API] Saving token:", { userId, token, platform });

    await saveFCMToken(userId, token, platform);

    res.status(200).json({
      success: true,
      message: "Token saved successfully",
    });
  } catch (error) {
    console.error("❌ [FCM API] Error saving token:", error);
    res.status(500).json({
      error: "Failed to save token",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
