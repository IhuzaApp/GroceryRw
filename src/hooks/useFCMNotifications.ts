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
    if (!session?.user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        // Initialize FCM and set up message listener
        unsubscribe = await initializeFCM(session.user.id, (payload) => {
          const { notification, data } = payload;

          // Dispatch custom events based on notification type
          const type = data?.type;

          switch (type) {
            case "new_order":
              // Save to notification history
              if (notification && typeof window !== "undefined") {
                const notificationHistory = JSON.parse(
                  localStorage.getItem("fcm_notification_history") || "[]"
                );
                notificationHistory.unshift({
                  title: notification.title,
                  body: notification.body,
                  timestamp: Date.now(),
                  type: "new_order",
                  read: false,
                  orderId: data.orderId,
                });
                if (notificationHistory.length > 50) {
                  notificationHistory.pop();
                }
                localStorage.setItem(
                  "fcm_notification_history",
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
                    expiresIn: parseInt(data.expiresIn || "90000"), // Default to 90 seconds
                    timestamp: parseInt(data.timestamp),
                  },
                })
              );
              break;

            case "batch_orders":
              const orders = JSON.parse(data.orders || "[]");

              // Save to notification history
              if (notification && typeof window !== "undefined") {
                const notificationHistory = JSON.parse(
                  localStorage.getItem("fcm_notification_history") || "[]"
                );
                notificationHistory.unshift({
                  title: notification.title,
                  body: notification.body,
                  timestamp: Date.now(),
                  type: "batch_orders",
                  read: false,
                });
                if (notificationHistory.length > 50) {
                  notificationHistory.pop();
                }
                localStorage.setItem(
                  "fcm_notification_history",
                  JSON.stringify(notificationHistory)
                );
              }

              window.dispatchEvent(
                new CustomEvent("fcm-batch-orders", {
                  detail: {
                    orders: orders,
                    expiresIn: parseInt(data.expiresIn || "90000"), // Default to 90 seconds
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

            case "test":
              // Test notification received
              if (typeof window !== "undefined") {
                import("react-hot-toast").then(({ default: toast }) => {
                  toast.success("FCM notification received successfully!", {
                    duration: 4000,
                    icon: "🔔",
                  });
                });
              }
              break;

            case "chat_message":
              // Save chat message to notification history
              if (notification && typeof window !== "undefined") {
                const notificationHistory = JSON.parse(
                  localStorage.getItem("fcm_notification_history") || "[]"
                );
                notificationHistory.unshift({
                  title: notification.title,
                  body: notification.body,
                  timestamp: Date.now(),
                  type: "chat_message",
                  read: false,
                  orderId: data.orderId,
                  conversationId: data.conversationId,
                  senderName: data.senderName,
                });
                if (notificationHistory.length > 50) {
                  notificationHistory.pop();
                }
                localStorage.setItem(
                  "fcm_notification_history",
                  JSON.stringify(notificationHistory)
                );
              }

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

            default:
              break;
          }
        });

        if (unsubscribe && typeof unsubscribe === "function") {
          setIsInitialized(true);
          setHasPermission(true);
        } else {
          setIsInitialized(false);
          setHasPermission(false);
        }
      } catch (error) {
        console.error("Failed to initialize FCM:", error);
        setIsInitialized(false);
        setHasPermission(false);
      }
    };

    init();

    return () => {
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
