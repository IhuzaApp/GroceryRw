import { NextApiRequest, NextApiResponse } from "next";
import { sendNotificationToUser, getFCMTokens } from "../../../src/services/fcmService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "Missing required field: userId",
      });
    }

    const tokens = await getFCMTokens(userId);

    if (tokens.length === 0) {
      return res.status(404).json({
        error: "No FCM tokens found",
        message: "Please ensure notification permissions are granted and the page is refreshed.",
      });
    }

    await sendNotificationToUser(userId, {
      title: "🎉 Test Notification",
      body: "This is a native device notification! It uses your system's default sound and appearance.",
      data: {
        type: "test",
        timestamp: Date.now().toString(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Test notification sent successfully",
      tokenCount: tokens.length,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return res.status(500).json({
      error: "Failed to send test notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
