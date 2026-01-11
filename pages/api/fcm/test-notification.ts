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
    console.log("🧪 Test notification request for user:", userId);

    if (!userId) {
      return res.status(400).json({
        error: "Missing required field: userId",
      });
    }

    console.log("🔍 Getting FCM tokens for user:", userId);
    const tokens = await getFCMTokens(userId);
    console.log(`📱 Found ${tokens.length} FCM token(s)`);

    if (tokens.length === 0) {
      console.warn("⚠️ No FCM tokens found for user:", userId);
      return res.status(404).json({
        error: "No FCM tokens found",
        message: "Please refresh the page to register for notifications.",
      });
    }

    console.log("📤 Sending test notification...");
    await sendNotificationToUser(userId, {
      title: "🔔 FCM Test Notification",
      body: "This is sent via Firebase Cloud Messaging. If you see this, FCM works!",
      data: {
        type: "test",
        timestamp: Date.now().toString(),
      },
    });

    console.log("✅ Test notification sent successfully");
    return res.status(200).json({
      success: true,
      message: "Test notification sent successfully",
      tokenCount: tokens.length,
    });
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    return res.status(500).json({
      error: "Failed to send test notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
