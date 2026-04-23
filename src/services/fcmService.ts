import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import { formatCurrency } from "../lib/formatCurrency";
import { ChatCollection } from "./chatService";

// Check if Firebase credentials are available
const hasFirebaseCredentials = () => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

// Initialize Firebase Admin SDK only if credentials are available
let messaging: any = null;
let db: any = null;

if (hasFirebaseCredentials()) {
  try {
    if (!getApps().length) {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (privateKey) {
        // Remove surrounding quotes and trim
        privateKey = privateKey.trim();
        privateKey = privateKey.replace(/^['"]+|['"]+$/g, "");
        // Replace literal \n with newlines
        privateKey = privateKey.replace(/\\n/g, "\n");

        // Ensure it starts and ends correctly (PKCS#8 format)
        if (!privateKey.startsWith("-----BEGIN PRIVATE KEY-----")) {
          privateKey = "-----BEGIN PRIVATE KEY-----\n" + privateKey;
        }
        if (!privateKey.includes("-----END PRIVATE KEY-----")) {
          privateKey = privateKey.trim() + "\n-----END PRIVATE KEY-----\n";
        }
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    }
    messaging = getMessaging();
    db = getFirestore();

    // console.log(`✅ [FCM Service] Firebase Admin SDK initialized successfully (Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID})`);
  } catch (error) {
    console.error(
      "❌ [FCM Service] Failed to initialize Firebase Admin SDK:",
      error
    );
  }
} else {
  console.warn(
    "⚠️ [FCM Service] Firebase credentials not found. FCM features will be disabled."
  );
}

export interface FCMToken {
  userId: string;
  token: string;
  platform: "web" | "android" | "ios";
  createdAt: Date;
  lastUsed: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: { [key: string]: string };
  imageUrl?: string;
}

/**
 * Save FCM token for a user
 */
export const saveFCMToken = async (
  userId: string,
  token: string,
  platform: "web" | "android" | "ios" = "web"
): Promise<void> => {
  try {
    if (!db) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping token save."
      );
      return;
    }

    const tokenData: FCMToken = {
      userId,
      token,
      platform,
      createdAt: new Date(),
      lastUsed: new Date(),
    };

    await db.collection("fcm_tokens").doc(token).set(tokenData);
  } catch (error) {
    console.error("❌ [FCM Service] Error saving token:", error);
    throw error;
  }
};

/**
 * Get FCM tokens for a user
 */
export const getFCMTokens = async (userId: string): Promise<FCMToken[]> => {
  try {
    if (!db) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Returning empty tokens."
      );
      return [];
    }

    const snapshot = await db
      .collection("fcm_tokens")
      .where("userId", "==", userId)
      .get();

    const tokens: FCMToken[] = [];
    snapshot.forEach((doc: any) => {
      tokens.push(doc.data() as FCMToken);
    });

    return tokens;
  } catch (error: any) {
    // gRPC code 5 = NOT_FOUND: Firestore database doesn't exist yet or hasn't been provisioned.
    // Return empty tokens gracefully so FCM just no-ops rather than crashing callers.
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      console.warn(
        "Please enable Firestore in the Firebase console for project: " +
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID +
          ". Returning empty tokens."
      );
      return [];
    }
    console.error("❌ [FCM Service] Error getting tokens:", error);
    return [];
  }
};

/**
 * Remove FCM token
 */
export const removeFCMToken = async (token: string): Promise<void> => {
  try {
    if (!db) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping token removal."
      );
      return;
    }

    await db.collection("fcm_tokens").doc(token).delete();
  } catch (error) {
    console.error("❌ [FCM Service] Error removing token:", error);
    throw error;
  }
};

/**
 * Send notification to a specific user
 */
export const sendNotificationToUser = async (
  userId: string,
  payload: NotificationPayload
): Promise<void> => {
  try {
    if (!messaging) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping notification."
      );
      return;
    }

    const tokens = await getFCMTokens(userId);

    if (tokens.length === 0) {
      return;
    }

    const fcmTokens = tokens.map((token) => token.token);

    const message: any = {
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: payload.data || {},
      tokens: fcmTokens,
      android: {
        priority: "high",
        notification: {
          sound: "default",
          priority: "high",
          channelId: "high_importance",
          // Use a timestamp-based tag for re-triggered notifications if requested
          // or fallback to a general type-based tag to avoid duplicates
          tag: payload.data?.tag || payload.data?.type || "general",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
            "content-available": 1,
          },
        },
      },
    };

    // Use sendEachForMulticast for better performance and reliability
    const response = await messaging.sendEachForMulticast(message);

    const invalidTokens: string[] = [];

    response.responses.forEach((resp: any, idx: number) => {
      if (!resp.success) {
        const error = resp.error;
        if (
          error?.code === "messaging/invalid-registration-token" ||
          error?.code === "messaging/registration-token-not-registered"
        ) {
          invalidTokens.push(fcmTokens[idx]);
        }
      }
    });

    // Remove invalid tokens
    if (invalidTokens.length > 0) {
      for (const token of invalidTokens) {
        await removeFCMToken(token);
      }
    }
  } catch (error) {
    // Silent fail - don't propagate so callers aren't disrupted by FCM issues
    console.error("❌ [FCM Service] Error sending notification:", error);
  }
};

/**
 * Send notification to multiple users
 */
export const sendNotificationToUsers = async (
  userIds: string[],
  payload: NotificationPayload
): Promise<void> => {
  try {
    if (!messaging) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping notification."
      );
      return;
    }

    // Fetch tokens in parallel for better performance
    const tokenResults = await Promise.all(
      userIds.map((userId) => getFCMTokens(userId))
    );

    const allTokens = tokenResults.flat().map((t) => t.token);

    if (allTokens.length === 0) {
      return;
    }

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: payload.data || {},
      tokens: allTokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log("✅ [FCM Service] Notification sent:", {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error("❌ [FCM Service] Error sending notification:", error);
    throw error;
  }
};

/**
 * Send chat message notification
 */
export const sendChatNotification = async (
  recipientId: string,
  senderName: string,
  message: string,
  orderId: string | undefined | null,
  conversationId: string,
  collectionPath: ChatCollection = "chat_conversations"
): Promise<void> => {
  try {
    if (!messaging) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping chat notification."
      );
      return;
    }

    const payload: NotificationPayload = {
      title: `New message from ${senderName}`,
      body: message.length > 100 ? message.substring(0, 100) + "..." : message,
      data: {
        type: "chat_message",
        ...(orderId && { orderId }),
        conversationId,
        collectionPath,
        senderName,
        tag: `chat_${conversationId}`,
      },
    };

    await sendNotificationToUser(recipientId, payload);
  } catch (error) {
    console.error("Error sending chat notification:", error);
    throw error;
  }
};

/**
 * Send new order notification to a shopper
 */
export const sendNewOrderNotification = async (
  shopperId: string,
  orderData: {
    id: string;
    shopName: string;
    distance: number;
    travelTimeMinutes: number;
    estimatedEarnings: number;
    orderType: string;
    customerAddress: string;
    expiresInMs?: number; // Optional: if not provided, defaults to 60000ms
    isCombinedOrder?: boolean; // Flag for combined orders
    orderCount?: number; // Number of stores in combined order
    storeNames?: string; // Comma-separated store names
    displayOrderId?: string; // Human-readable order number (e.g. OrderID)
    OrderID?: number | string; // Numeric order ID for notification card fallback
    combinedOrderId?: string; // combined_order_id (UUID)
    orderIds?: string[]; // order IDs in combined order group
    tag?: string; // Optional: custom tag for notification replacement/re-triggering
  }
): Promise<void> => {
  try {
    if (!messaging) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping order notification."
      );
      return;
    }

    // Use provided expiresInMs or default to 60 seconds
    const expiresInMs = orderData.expiresInMs || 60000;

    // Create title and body based on whether it's a combined order
    let title: string;
    let body: string;

    if (orderData.isCombinedOrder && orderData.orderCount) {
      title = `🛒 New Combined Order - ${orderData.orderCount} Stores!`;
      body = `${orderData.storeNames || orderData.shopName} - ${formatCurrency(
        orderData.estimatedEarnings
      )} total earnings • ${orderData.distance.toFixed(1)}km away`;
    } else {
      title = `New ${orderData.orderType} batch available!`;
      body = `From ${orderData.shopName} - ${formatCurrency(
        orderData.estimatedEarnings
      )} • ${orderData.distance.toFixed(1)}km away`;
    }

    const payload: NotificationPayload = {
      title,
      body,
      data: {
        type: "new_order",
        orderId: orderData.id,
        orderType: orderData.orderType,
        shopName: orderData.shopName,
        distance: orderData.distance.toString(),
        travelTimeMinutes: orderData.travelTimeMinutes.toString(),
        estimatedEarnings: orderData.estimatedEarnings.toString(),
        customerAddress: orderData.customerAddress,
        expiresIn: expiresInMs.toString(),
        timestamp: Date.now().toString(),
        ...(orderData.tag && { tag: orderData.tag }),
        ...(orderData.displayOrderId && {
          displayOrderId: orderData.displayOrderId,
        }),
        ...(orderData.OrderID != null && {
          OrderID: String(orderData.OrderID),
        }),
        // Combined order specific data
        ...(orderData.isCombinedOrder && {
          isCombinedOrder: "true",
          orderCount: orderData.orderCount?.toString() || "1",
          storeNames: orderData.storeNames || orderData.shopName,
          ...(orderData.combinedOrderId && {
            combinedOrderId: orderData.combinedOrderId,
          }),
          ...(orderData.orderIds && {
            orderIds: JSON.stringify(orderData.orderIds),
          }),
        }),
      },
    };

    await sendNotificationToUser(shopperId, payload);
  } catch (error) {
    console.error("Error sending order notification:", error);
    throw error;
  }
};

/**
 * Send batch orders notification to multiple shoppers
 */
export const sendBatchOrdersNotification = async (
  shopperIds: string[],
  ordersData: Array<{
    id: string;
    shopName: string;
    distance: number;
    estimatedEarnings: number;
    orderType: string;
  }>
): Promise<void> => {
  try {
    if (!messaging) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping batch notification."
      );
      return;
    }

    const totalOrders = ordersData.length;
    const totalEarnings = ordersData.reduce(
      (sum, order) => sum + order.estimatedEarnings,
      0
    );

    const payload: NotificationPayload = {
      title: `${totalOrders} new batch in your area!`,
      body: `Potential earnings: ${formatCurrency(totalEarnings)}`,
      data: {
        type: "batch_orders",
        orderCount: totalOrders.toString(),
        totalEarnings: totalEarnings.toString(),
        orders: JSON.stringify(ordersData),
        expiresIn: "60000", // 60 seconds
        timestamp: Date.now().toString(),
      },
    };

    await sendNotificationToUsers(shopperIds, payload);
  } catch (error) {
    console.error("Error sending batch notification:", error);
    throw error;
  }
};

/**
 * Send order expiration notification
 */
export const sendOrderExpiredNotification = async (
  shopperId: string,
  orderId: string,
  reason: string = "timeout"
): Promise<void> => {
  try {
    if (!messaging) {
      console.warn(
        "⚠️ [FCM Service] Firebase not initialized. Skipping expiration notification."
      );
      return;
    }

    const payload: NotificationPayload = {
      title: "Order expired",
      body: "The order you were viewing is no longer available",
      data: {
        type: "order_expired",
        orderId,
        reason,
        timestamp: Date.now().toString(),
      },
    };

    await sendNotificationToUser(shopperId, payload);
  } catch (error) {
    // Silent fail for expiration notifications
  }
};
