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

    // Test payload similar to the actual batch notification
    const testPayload = {
      title: "🚀 Test Batch Available!",
      body: "5.4km • 2 units • 4500 RWF",
      data: {
        type: "batch_notification",
        orderId: "test-order-" + Date.now(),
        OrderID: "test-order-" + Date.now(), // For compatibility
        distance: "5.4",
        units: "2",
        earnings: "4500",
        click_action: "view_batch",
        action_url: "/Plasa/active-batches/batch/test-order-" + Date.now(),
        notification_id: "batch_test_" + Date.now(),
      },
    };

    console.log("🧪 [Test FCM] Sending test batch notification to consolidated service worker:", {
      userId,
      payload: testPayload,
    });

    // Import the FCM service
    const { sendNotificationToUser } = await import("../../src/services/fcmService");
    
    await sendNotificationToUser(userId, testPayload);

    return res.status(200).json({
      success: true,
      message: "Test batch notification sent successfully",
      payload: testPayload,
    });
  } catch (error) {
    console.error("❌ [Test FCM] Error sending test batch notification:", error);
    return res.status(500).json({
      error: "Failed to send test batch notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
