import { NextApiRequest, NextApiResponse } from "next";
import { sendNotificationToUser } from "../../../src/services/fcmService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { 
      orderId, 
      shopName, 
      customerAddress, 
      distance, 
      itemsCount, 
      estimatedEarnings,
      orderType = "regular"
    } = req.body;

    if (!orderId || !shopName || !customerAddress) {
      return res.status(400).json({
        error: "Missing required fields: orderId, shopName, customerAddress",
      });
    }

    console.log("🔔 [FCM API] Sending batch notifications to nearby shoppers:", {
      orderId,
      shopName,
      distance,
      itemsCount,
      earnings: estimatedEarnings,
    });

    // Get nearby available shoppers from the database
    const nearbyShoppersResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/queries/get-nearby-available-shoppers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": req.headers.cookie || "", // Pass cookies for authentication
      },
      body: JSON.stringify({
        orderId,
        maxDistance: 10, // 10km radius
        excludeShopperId: null, // Don't exclude anyone - send to all nearby shoppers
      }),
    });

    if (!nearbyShoppersResponse.ok) {
      console.warn("⚠️ [FCM API] Failed to get nearby shoppers:", nearbyShoppersResponse.statusText);
      return res.status(200).json({
        success: true,
        message: "Batch notification processing completed",
        notificationsSent: 0,
        error: "Could not fetch nearby shoppers"
      });
    }

    const nearbyShoppersData = await nearbyShoppersResponse.json();
    const nearbyShoppers = nearbyShoppersData.shoppers || [];

    if (nearbyShoppers.length === 0) {
      console.log("ℹ️ [FCM API] No nearby available shoppers found");
      return res.status(200).json({
        success: true,
        message: "No nearby shoppers found",
        notificationsSent: 0,
      });
    }

    // Format the notification message
    const title = `🚀 New Batch Available!`;
    const body = `${distance}km • ${itemsCount} items • ${estimatedEarnings ? `${estimatedEarnings} RWF` : 'Check details'}`;
    
    // Create notification payload
    const payload = {
      title,
      body,
      data: {
        type: "batch_notification",
        orderId,
        OrderID: orderId, // For compatibility
        distance: distance?.toString() || "0",
        units: itemsCount?.toString() || "0",
        earnings: estimatedEarnings?.toString() || "0",
        shopName,
        customerAddress,
        orderType,
        click_action: "view_batch",
        action_url: `/Plasa/active-batches/batch/${orderId}`,
        notification_id: `batch_${orderId}_${Date.now()}`,
        // Mark as background notification (no click actions needed)
        background_notification: "true",
      },
      imageUrl: "/images/batch-notification-icon.png",
    };

    // Send notifications to all nearby shoppers
    const notificationPromises = nearbyShoppers.map(async (shopper: { id: string }) => {
      try {
        await sendNotificationToUser(shopper.id, payload);
        console.log(`✅ [FCM API] Sent batch notification to shopper ${shopper.id}`);
        return { shopperId: shopper.id, success: true };
      } catch (error) {
        console.error(`❌ [FCM API] Failed to send notification to shopper ${shopper.id}:`, error);
        return { shopperId: shopper.id, success: false, error };
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    console.log(`🔔 [FCM API] Batch notifications sent: ${successful}/${nearbyShoppers.length} successful`);

    return res.status(200).json({
      success: true,
      message: "Batch notifications sent to nearby shoppers",
      notificationsSent: successful,
      totalShoppers: nearbyShoppers.length,
      orderId,
    });

  } catch (error) {
    console.error("❌ [FCM API] Error sending batch notifications to nearby shoppers:", error);
    return res.status(500).json({
      error: "Failed to send batch notifications to nearby shoppers",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
