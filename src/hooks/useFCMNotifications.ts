import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { initializeFCM, setupFCMListener } from "../services/fcmClient";

interface FCMNotificationHook {
  isInitialized: boolean;
  hasPermission: boolean;
}

export const useFCMNotifications = (): FCMNotificationHook => {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      console.log("⚠️ [useFCMNotifications] No user session, skipping FCM initialization");
      return;
    }

    console.log("🔄 [useFCMNotifications] Initializing FCM for user:", session.user.id);
    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        console.log("📱 [useFCMNotifications] Starting FCM initialization...");
        // Initialize FCM and set up message listener
        unsubscribe = await initializeFCM(session.user.id, (payload) => {
          // Handle incoming FCM message
          console.log("📨 [useFCMNotifications] Received FCM message:", payload);
          const { notification, data } = payload;
          
          // Dispatch custom events based on notification type
          const type = data?.type;
          
          switch (type) {
            case "new_order":
              // Save to notification history
              if (notification && typeof window !== 'undefined') {
                const notificationHistory = JSON.parse(
                  localStorage.getItem('fcm_notification_history') || '[]'
                );
                notificationHistory.unshift({
                  title: notification.title,
                  body: notification.body,
                  timestamp: Date.now(),
                  type: 'new_order',
                  read: false,
                });
                if (notificationHistory.length > 50) {
                  notificationHistory.pop();
                }
                localStorage.setItem(
                  'fcm_notification_history',
                  JSON.stringify(notificationHistory)
                );
              }
              
              window.dispatchEvent(
                new CustomEvent("fcm-new-order", {
                  detail: {
                    order: {
                      id: data.orderId,
                      shopName: data.shopName,
                      distance: parseFloat(data.distance),
                      travelTimeMinutes: parseInt(data.travelTimeMinutes),
                      customerAddress: data.customerAddress,
                      estimatedEarnings: parseFloat(data.estimatedEarnings),
                      orderType: data.orderType,
                      createdAt: new Date().toISOString(),
                    },
                    expiresIn: parseInt(data.expiresIn || "60000"),
                    timestamp: parseInt(data.timestamp),
                  },
                })
              );
              break;

            case "batch_orders":
              const orders = JSON.parse(data.orders || "[]");
              
              // Save to notification history
              if (notification && typeof window !== 'undefined') {
                const notificationHistory = JSON.parse(
                  localStorage.getItem('fcm_notification_history') || '[]'
                );
                notificationHistory.unshift({
                  title: notification.title,
                  body: notification.body,
                  timestamp: Date.now(),
                  type: 'batch_orders',
                  read: false,
                });
                if (notificationHistory.length > 50) {
                  notificationHistory.pop();
                }
                localStorage.setItem(
                  'fcm_notification_history',
                  JSON.stringify(notificationHistory)
                );
              }
              
              window.dispatchEvent(
                new CustomEvent("fcm-batch-orders", {
                  detail: {
                    orders: orders,
                    expiresIn: parseInt(data.expiresIn || "60000"),
                    timestamp: parseInt(data.timestamp),
                  },
                })
              );
              break;

            case "order_expired":
              window.dispatchEvent(
                new CustomEvent("fcm-order-expired", {
                  detail: {
                    orderId: data.orderId,
                    reason: data.reason,
                  },
                })
              );
              break;

            case "chat_message":
              window.dispatchEvent(
                new CustomEvent("fcm-chat-message", {
                  detail: {
                    orderId: data.orderId,
                    conversationId: data.conversationId,
                    senderName: data.senderName,
                    message: notification?.body,
                  },
                })
              );
              break;

            case "test":
              // Show browser notification for test
              if (notification) {
                console.log("✅ Test notification received:", notification);
                
                // Show a visual toast to confirm receipt
                if (typeof window !== 'undefined') {
                  // Try to import and use toast dynamically
                  import('react-hot-toast').then(({ default: toast }) => {
                    toast.success(
                      `${notification.title}\n${notification.body}`,
                      {
                        duration: 8000, // Show for 8 seconds
                        style: {
                          background: '#10B981',
                          color: '#fff',
                          fontSize: '16px',
                          padding: '20px',
                          maxWidth: '500px',
                        },
                        icon: '🔔',
                      }
                    );
                  });
                  
                  // Store in notification history
                  const notificationHistory = JSON.parse(
                    localStorage.getItem('fcm_notification_history') || '[]'
                  );
                  notificationHistory.unshift({
                    title: notification.title,
                    body: notification.body,
                    timestamp: Date.now(),
                    type: data.type,
                    read: false,
                  });
                  // Keep only last 50 notifications
                  if (notificationHistory.length > 50) {
                    notificationHistory.pop();
                  }
                  localStorage.setItem(
                    'fcm_notification_history',
                    JSON.stringify(notificationHistory)
                  );
                  
                  console.log("✅ Notification saved to history");
                }
                
                // Dispatch event for any listeners
                window.dispatchEvent(
                  new CustomEvent("fcm-test-notification", {
                    detail: {
                      title: notification.title,
                      body: notification.body,
                      timestamp: data.timestamp,
                    },
                  })
                );
              }
              break;

            default:
              console.log("Received FCM notification:", notification, data);
          }
        });

        if (unsubscribe && typeof unsubscribe === 'function') {
          console.log("✅ [useFCMNotifications] FCM initialized successfully");
          setIsInitialized(true);
          setHasPermission(true);
        } else {
          console.warn("⚠️ [useFCMNotifications] FCM initialization failed - no token or permission denied");
          setIsInitialized(false);
          setHasPermission(false);
        }
      } catch (error) {
        console.error("❌ [useFCMNotifications] Failed to initialize FCM:", error);
        setIsInitialized(false);
        setHasPermission(false);
      }
    };

    init();

    // Cleanup
    return () => {
      console.log("🧹 [useFCMNotifications] Cleaning up FCM");
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [session?.user?.id]);

  return {
    isInitialized,
    hasPermission,
  };
};
