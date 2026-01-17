import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { initializeFCM } from "../services/fcmClient";

interface FCMNotificationHook {
  isInitialized: boolean;
  hasPermission: boolean;
}

export const useFCMNotifications = (): FCMNotificationHook => {
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Check if shopper is online (has location cookies)
  const checkOnlineStatus = () => {
    const cookies = document.cookie
      .split("; ")
      .reduce((acc: Record<string, string>, cur) => {
        const [k, v] = cur.split("=");
        acc[k] = v;
        return acc;
      }, {} as Record<string, string>);

    return Boolean(cookies["user_latitude"] && cookies["user_longitude"]);
  };

  // Monitor online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = checkOnlineStatus();
      // Only update if status actually changed
      if (online !== isOnline) {
        setIsOnline(online);
      }
    };

    // Initial check
    updateOnlineStatus();

    // Listen for go live toggle events
    const handleToggle = () => {
      setTimeout(updateOnlineStatus, 300);
    };
    window.addEventListener("toggleGoLive", handleToggle);

    // Poll for cookie changes every 10 seconds (reduced from 5)
    const intervalId = setInterval(updateOnlineStatus, 10000);

    return () => {
      window.removeEventListener("toggleGoLive", handleToggle);
      clearInterval(intervalId);
    };
  }, [isOnline]); // Add isOnline as dependency to check against current value

  useEffect(() => {
    // Only initialize FCM when shopper is online
    if (!session?.user?.id || !isOnline) {
      if (!isOnline && isInitialized) {
        console.log("🔴 Shopper went offline - FCM paused");
        setIsInitialized(false);
        setHasPermission(false);
      }
      return;
    }

    let unsubscribe: (() => void) | null = null;

    const init = async () => {
      try {
        console.log(
          "🟢 Shopper is online - Initializing FCM for user:",
          session.user.id
        );

        // Initialize FCM and set up message listener
        unsubscribe = await initializeFCM(session.user.id, (payload) => {
          const { notification, data } = payload;

          // Dispatch custom events based on notification type
          const type = data?.type;

          // Save ALL FCM notifications to history (regardless of type or page visibility)
          // This ensures users can see notifications when they return to the app
          if (typeof window !== "undefined") {
            const notificationHistory = JSON.parse(
              localStorage.getItem("fcm_notification_history") || "[]"
            );

            // Create notification entry from notification object or data
            const notificationEntry = {
              title: notification?.title || data?.title || "New Notification",
              body: notification?.body || data?.body || data?.message || "",
              timestamp: Date.now(),
              type: type || "unknown",
              read: false,
              orderId: data?.orderId,
              conversationId: data?.conversationId,
              senderName: data?.senderName,
              // Combined order specific fields
              isCombinedOrder: data?.isCombinedOrder === "true",
              orderCount: data?.orderCount ? parseInt(data.orderCount) : undefined,
              totalEarnings: data?.totalEarnings
                ? parseFloat(data.totalEarnings)
                : data?.estimatedEarnings
                  ? parseFloat(data.estimatedEarnings)
                  : undefined,
              storeNames: data?.storeNames || data?.shopName,
              // Include any additional data
              ...(data || {}),
            };

            notificationHistory.unshift(notificationEntry);
            if (notificationHistory.length > 50) {
              notificationHistory.pop();
            }
            localStorage.setItem(
              "fcm_notification_history",
              JSON.stringify(notificationHistory)
            );

            // Let UI components (NotificationCenter badge/list) refresh immediately
            window.dispatchEvent(
              new CustomEvent("fcm-history-updated", {
                detail: { notification: notificationEntry },
              })
            );
          }

          // CRITICAL: Check page visibility before dispatching events
          // This prevents notifications from showing when user is on another page/tab
          // But we still save them to localStorage above so they appear in notification center
          if (document.hidden) {
            return;
          }

          switch (type) {
            case "new_order":
              // Double-check page visibility before dispatching
              if (!document.hidden) {
                window.dispatchEvent(
                  new CustomEvent("fcm-new-order", {
                    detail: {
                      order: {
                        id: data.orderId,
                        OrderID: data.displayOrderId || data.OrderID,
                        shopName: data.shopName,
                        distance: parseFloat(data.distance),
                        travelTimeMinutes: parseInt(data.travelTimeMinutes),
                        customerAddress: data.customerAddress,
                        estimatedEarnings: parseFloat(data.estimatedEarnings),
                        orderType: data.orderType,
                        createdAt: new Date().toISOString(),
                        // Add coordinates if available
                        shopLatitude: data.shopLatitude
                          ? parseFloat(data.shopLatitude)
                          : undefined,
                        shopLongitude: data.shopLongitude
                          ? parseFloat(data.shopLongitude)
                          : undefined,
                        customerLatitude: data.customerLatitude
                          ? parseFloat(data.customerLatitude)
                          : undefined,
                        customerLongitude: data.customerLongitude
                          ? parseFloat(data.customerLongitude)
                          : undefined,
                      },
                      expiresIn: parseInt(data.expiresIn || "90000"), // Default to 90 seconds
                      timestamp: parseInt(data.timestamp),
                    },
                  })
                );
              }
              break;

            case "batch_orders":
              const orders = JSON.parse(data.orders || "[]");

              window.dispatchEvent(
                new CustomEvent("fcm-batch-orders", {
                  detail: {
                    orders: orders,
                    expiresIn: parseInt(data.expiresIn || "60000"), // Default to 60 seconds
                    timestamp: parseInt(data.timestamp),
                  },
                })
              );
              break;

            case "order_expired":
              // Order expiration can be dispatched even if page is hidden
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
              // Chat messages can be dispatched even if page is hidden (user might come back)
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
          console.log(
            "✅ FCM Hook: Successfully initialized with push notifications"
          );
          setIsInitialized(true);
          setHasPermission(true);
        } else {
          console.log("FCM not available, using API polling instead");
          // Not an error - app will use API polling instead
          setIsInitialized(false);
          setHasPermission(false);
        }
      } catch (error) {
        // Not an error - app will use API polling instead
        setIsInitialized(false);
        setHasPermission(false);
      }
    };

    init();

    return () => {
      if (unsubscribe) {
        console.log("🧹 Cleaning up FCM subscription");
        unsubscribe();
      }
    };
  }, [session?.user?.id, isOnline]); // Re-initialize when online status changes

  return {
    isInitialized,
    hasPermission,
  };
};
