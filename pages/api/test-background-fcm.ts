import { NextApiRequest, NextApiResponse } from "next";

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

    // Test payload for background batch notification (no click actions)
    const testPayload = {
      title: "🚀 Background Batch Available!",
      body: "5.4km • 2 items • 4500 RWF",
      data: {
        type: "batch_notification",
        orderId: "background-test-" + Date.now(),
        OrderID: "background-test-" + Date.now(),
        distance: "5.4",
        units: "2",
        earnings: "4500",
        shopName: "Test Shop",
        customerAddress: "Test Address",
        orderType: "regular",
        click_action: "view_batch",
        action_url: "/Plasa/active-batches/batch/background-test-" + Date.now(),
        notification_id: "background_batch_test_" + Date.now(),
        // Mark as background notification (no click actions needed)
        background_notification: "true",
      },
    };

    console.log("🧪 [Test Background FCM] Sending background batch notification:", {
      userId,
      payload: testPayload,
    });

    // Import the FCM service
    const { sendNotificationToUser } = await import("../../src/services/fcmService");
    
    await sendNotificationToUser(userId, testPayload);

    return res.status(200).json({
      success: true,
      message: "Background batch notification sent successfully",
      payload: testPayload,
      note: "This notification should appear without click actions and not require user interaction"
    });
  } catch (error) {
    console.error("❌ [Test Background FCM] Error sending background batch notification:", error);
    return res.status(500).json({
      error: "Failed to send background batch notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
