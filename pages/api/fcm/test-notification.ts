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

    console.log("🔔 [Test Notification API] Called with userId:", userId);

    if (!userId) {
      console.error("❌ [Test Notification API] Missing userId");
      return res.status(400).json({
        error: "Missing required field: userId",
      });
    }

    // Check if user has FCM tokens
    console.log("🔍 [Test Notification API] Checking for FCM tokens...");
    const tokens = await getFCMTokens(userId);
    console.log(`📱 [Test Notification API] Found ${tokens.length} FCM token(s) for user ${userId}`);

    if (tokens.length === 0) {
      console.warn("⚠️ [Test Notification API] No FCM tokens found for user");
      return res.status(404).json({
        error: "No FCM tokens found",
        message: "Please ensure notification permissions are granted and the page is refreshed.",
      });
    }

    // Send a test notification using native device notification
    console.log("📤 [Test Notification API] Sending test notification...");
    await sendNotificationToUser(userId, {
      title: "🎉 Test Notification",
      body: "This is a native device notification! It uses your system's default sound and appearance.",
      data: {
        type: "test",
        timestamp: Date.now().toString(),
      },
    });

    console.log("✅ [Test Notification API] Test notification sent successfully");
    return res.status(200).json({
      success: true,
      message: "Test notification sent successfully",
      tokenCount: tokens.length,
    });
  } catch (error) {
    console.error("❌ [Test Notification API] Error sending test notification:", error);
    return res.status(500).json({
      error: "Failed to send test notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
