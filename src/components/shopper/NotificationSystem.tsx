import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Message, Button } from "rsuite";
import toast from "react-hot-toast";
import { logger } from "../../utils/logger";

interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
  itemsCount?: number;
  estimatedEarnings?: number;
  // Add other order properties as needed
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
  expiresAt: number; // Add expiration time
  warningShown: boolean; // Track if warning was shown
  warningTimeout: NodeJS.Timeout | null; // Track warning timeout
}

interface ShopperSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface NotificationSystemProps {
  onNewOrder?: (order: any) => void;
  currentLocation?: { lat: number; lng: number } | null;
  activeShoppers?: Array<{ id: string; name: string }>;
  onAcceptBatch?: (orderId: string) => void;
  onViewBatchDetails?: (orderId: string) => void; // Add callback for viewing details
}

export default function NotificationSystem({
  onNewOrder,
  currentLocation,
  activeShoppers = [],
  onAcceptBatch,
  onViewBatchDetails,
}: NotificationSystemProps) {
  const { data: session } = useSession();
  const [isListening, setIsListening] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [audioLoaded, setAudioLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTime = useRef<number>(0);
  const batchAssignments = useRef<BatchAssignment[]>([]);
  const lastOrderIds = useRef<Set<string>>(new Set());
  const activeToasts = useRef<Map<string, any>>(new Map()); // Track active toasts by order ID

  // Initialize audio immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        logger.info("Initializing notification sound...", "NotificationSystem");
        const audio = new Audio("/notifySound.mp3");

        // Set audio properties
        audio.preload = "auto";
        audio.volume = 0.7; // Slightly reduce volume

        // Add event listeners
        audio.addEventListener("canplaythrough", () => {
          logger.info(
            "Notification sound loaded successfully",
            "NotificationSystem"
          );
          setAudioLoaded(true);
        });

        audio.addEventListener("error", (e) => {
          logger.error(
            "Error loading notification sound",
            "NotificationSystem",
            e
          );
          setAudioLoaded(false);
        });

        audioRef.current = audio;
      } catch (error) {
        logger.error(
          "Error initializing notification sound",
          "NotificationSystem",
          error
        );
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (session?.user && currentLocation) {
      startNotificationSystem();
    }
    return () => stopNotificationSystem();
  }, [session, currentLocation]);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await window.Notification.requestPermission();
        setNotificationPermission(permission);

        // Create dummy order objects for permission notifications
        const dummyOrder: Order = {
          id: "permission",
          shopName: "",
          distance: 0,
          createdAt: new Date().toISOString(),
          customerAddress:
            permission === "granted"
              ? "You will receive order alerts."
              : "You will still receive in-app notifications.",
        };

        if (permission === "granted") {
          showToast(dummyOrder, "success");
        } else if (permission === "denied") {
          showToast(dummyOrder, "info");
        }
      } catch (error) {
        logger.error(
          "Error requesting notification permission",
          "NotificationSystem",
          error
        );
      }
    }
  };

  // Helper to format order ID with date
  const formatOrderId = (orderId: string, createdAt: string) => {
    const date = new Date(createdAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}-${orderId}`;
  };

  const removeToastForOrder = (orderId: string) => {
    const existingToast = activeToasts.current.get(orderId);
    if (existingToast) {
      toast.dismiss(existingToast);
      activeToasts.current.delete(orderId);
      logger.info(
        `Removed toast for accepted order ${orderId}`,
        "NotificationSystem"
      );
    }
    
    // Also remove from batch assignments
    batchAssignments.current = batchAssignments.current.filter(
      (assignment) => assignment.orderId !== orderId
    );
  };

  const showToast = (
    order: Order,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    // Remove any existing toast for this order
    const existingToast = activeToasts.current.get(order.id);
    if (existingToast) {
      toast.dismiss(existingToast);
      activeToasts.current.delete(order.id);
    }

    const toastKey = toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } pointer-events-auto flex w-full max-w-md rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
        >
          <div className="w-0 flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {type === "success" && (
                  <svg
                    className="h-6 w-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {type === "warning" && (
                  <svg
                    className="h-6 w-6 text-yellow-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                )}
                {type === "error" && (
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {type === "info" && (
                  <svg
                    className="h-6 w-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">New Batch!</p>
                <div className="mt-1 text-sm text-gray-500">
            <div>{order.customerAddress}</div>
            <div>
              {order.shopName} ({order.distance}km)
            </div>
                  <div className="mt-1 font-medium text-green-600">
                    📦 {order.itemsCount || 0} items • 💰 RWF{order.estimatedEarnings || 0}
                  </div>
          </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      removeToastForOrder(order.id);
                      onAcceptBatch?.(order.id);
                      toast.dismiss(t.id);
                    }}
                    className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
            >
              Accept Batch
                  </button>
                  <button
                    onClick={() => {
                      removeToastForOrder(order.id);
                      // Remove assignment to allow other shoppers to get this order
                      batchAssignments.current = batchAssignments.current.filter(
                        (assignment) => assignment.orderId !== order.id
                      );
                      toast.dismiss(t.id);
                      logger.info(
                        `Skipped order ${order.id} - allowing other shoppers`,
                        "NotificationSystem"
                      );
                    }}
                    className="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                removeToastForOrder(order.id);
                toast.dismiss(t.id);
              }}
              className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Never auto-dismiss
        position: "top-right",
      }
    );

    // Store the toast key for this order
    activeToasts.current.set(order.id, toastKey);

    return toastKey;
  };

  const playNotificationSound = async (soundSettings?: {
    enabled: boolean;
    volume: number;
  }) => {
    // Check if sound is enabled in settings
    if (soundSettings && !soundSettings.enabled) {
      logger.info(
        "Sound notifications disabled in settings",
        "NotificationSystem"
      );
      return;
    }

    try {
      if (!audioRef.current) {
        logger.warn(
          "Cannot play sound - Audio not initialized",
          "NotificationSystem"
        );
        return;
      }

      // Reset the audio to start
      audioRef.current.currentTime = 0;

      // Create and play a new instance for better reliability
      const soundInstance = new Audio("/notifySound.mp3");
      soundInstance.volume = soundSettings?.volume || 0.7;

      await soundInstance.play();
      logger.info(
        "Notification sound played successfully",
        "NotificationSystem"
      );

      // Clean up after playing
      soundInstance.addEventListener("ended", () => {
        soundInstance.src = "";
      });
    } catch (error) {
      logger.error(
        "Error playing notification sound",
        "NotificationSystem",
        error
      );

      // Fallback attempt with the original audio element
      try {
        if (audioRef.current) {
          audioRef.current.volume = soundSettings?.volume || 0.7;
          await audioRef.current.play();
        }
      } catch (fallbackError) {
        logger.error(
          "Fallback audio play also failed",
          "NotificationSystem",
          fallbackError
        );
      }
    }
  };

  const showDesktopNotification = (order: Order) => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      notificationPermission === "granted"
    ) {
      try {
        const notification = new window.Notification("New Batch Available!", {
          body: `${order.shopName} (${order.distance}km)\n${order.customerAddress}`,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234F46E5'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/></svg>",
          tag: `batch-${order.id}`,
          requireInteraction: false,
        });

      notification.onclick = () => {
        window.focus();
          notification.close();
        };

        // Auto-close after 10 seconds
        setTimeout(() => {
          notification.close();
        }, 10000);

        logger.info("Desktop notification shown", "NotificationSystem");
      } catch (error) {
        logger.error(
          "Error showing desktop notification",
          "NotificationSystem",
          error
        );
      }
    }
  };

  const showWarningNotification = (order: Order) => {
    // Check if assignment still exists and warning hasn't been shown
    const assignment = batchAssignments.current.find(
      (a) => a.orderId === order.id && a.shopperId === session?.user?.id
    );

    if (!assignment || assignment.warningShown) {
      return; // Assignment expired or warning already shown
    }

    // Mark warning as shown
    assignment.warningShown = true;

    // Remove existing toast for this order and show warning toast
    const existingToast = activeToasts.current.get(order.id);
    if (existingToast) {
      toast.dismiss(existingToast);
      activeToasts.current.delete(order.id);
    }

    const warningToastKey = toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } pointer-events-auto flex w-full max-w-md rounded-lg border-l-4 border-yellow-400 bg-white shadow-lg ring-1 ring-black ring-opacity-5`}
        >
          <div className="w-0 flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  ⚠️ Batch Expiring Soon!
                </p>
                <div className="mt-1 text-sm text-gray-500">
                  <div>{order.customerAddress}</div>
                  <div>
                    {order.shopName} ({order.distance}km)
                  </div>
                  <div className="mt-1 font-medium text-green-600">
                    📦 {order.itemsCount || 0} items • 💰 RWF{order.estimatedEarnings || 0}
                  </div>
                  <div className="mt-1 font-medium text-orange-600">
                    ⚠️ This batch will be reassigned in 20 seconds!
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      removeToastForOrder(order.id);
                      onAcceptBatch?.(order.id);
                      toast.dismiss(t.id);
                    }}
                    className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700"
                  >
                    Accept Now
                  </button>
                  <button
                    onClick={() => {
                      removeToastForOrder(order.id);
                      // Remove assignment to allow other shoppers to get this order
                      batchAssignments.current = batchAssignments.current.filter(
                        (assignment) => assignment.orderId !== order.id
                      );
                      toast.dismiss(t.id);
                      logger.info(
                        `Skipped expiring order ${order.id} - allowing other shoppers`,
                        "NotificationSystem"
                      );
                    }}
                    className="rounded bg-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-400"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                removeToastForOrder(order.id);
                toast.dismiss(t.id);
              }}
              className="flex w-full items-center justify-center rounded-none rounded-r-lg border border-transparent p-4 text-sm font-medium text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Never auto-dismiss
        position: "top-right",
      }
    );

    // Store the warning toast key for this order
    activeToasts.current.set(order.id, warningToastKey);

    // Show warning desktop notification
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      notificationPermission === "granted"
    ) {
      try {
        const notification = new window.Notification(
          "⚠️ Batch Expiring Soon!",
          {
            body: `${order.shopName} (${order.distance}km)\n${order.customerAddress}\n\nThis batch will be reassigned in 20 seconds!`,
            icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23F59E0B'><path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/></svg>",
            tag: `warning-${order.id}`,
            requireInteraction: false,
          }
        );

        notification.onclick = () => {
          window.focus();
        notification.close();
      };

        // Auto-close after 20 seconds
        setTimeout(() => {
          notification.close();
        }, 20000);

        logger.info("Warning desktop notification shown", "NotificationSystem");
      } catch (error) {
        logger.error(
          "Error showing warning desktop notification",
          "NotificationSystem",
          error
        );
      }
    }

    // Play warning sound
    playNotificationSound({ enabled: true, volume: 0.8 });

    logger.info(
      `Warning notification shown for order ${order.id} - expires in 20 seconds`,
      "NotificationSystem"
    );
  };

  const isWithinSchedule = async (): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay();
      const currentTime = now.toTimeString().split(" ")[0] + "+00:00";

      const response = await fetch("/api/queries/shopper-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session.user.id,
          day_of_week: currentDay,
          current_time: currentTime,
        }),
      });

      const data = await response.json();
      return data.is_available;
    } catch (error) {
      logger.error("Error checking schedule", "NotificationSystem", error);
      return false;
    }
  };

  const hasActiveOrders = async (): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/shopper/activeBatches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session.user.id,
        }),
      });

      const data = await response.json();
      return data.hasActiveOrders;
    } catch (error) {
      logger.error("Error checking active orders", "NotificationSystem", error);
      return false;
    }
  };

  const isShopperActive = async (): Promise<boolean> => {
    if (!session?.user?.id) return false;

    try {
      const response = await fetch("/api/queries/shopper-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session.user.id,
        }),
      });

      const data = await response.json();
      return data.is_available;
    } catch (error) {
      logger.error(
        "Error checking shopper status",
        "NotificationSystem",
        error
      );
      return false;
    }
  };

  const checkForNewOrders = async () => {
    if (!session?.user?.id || !currentLocation) {
      logger.debug(
        "Missing session or location, skipping check",
        "NotificationSystem"
      );
      return;
    }

    const now = new Date();
    const currentTime = now.getTime();

    // Check if we should skip this check (60-second cooldown)
    if (currentTime - lastNotificationTime.current < 60000) {
      logger.debug(
        `Skipping notification check - ${Math.floor(
          (60000 - (currentTime - lastNotificationTime.current)) / 1000
        )}s until next check`,
        "NotificationSystem"
      );
      return;
    }

    logger.info(
      "Checking for pending orders with settings (API handles all conditions)",
      "NotificationSystem"
    );

    try {
      // Use the new API that respects notification settings
      const response = await fetch(
        "/api/shopper/check-notifications-with-settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: session.user.id,
            current_location: currentLocation,
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.notifications && data.notifications.length > 0) {
        logger.info(
          `Found ${data.notifications.length} notifications based on settings`,
          "NotificationSystem"
        );

        // Clean up expired assignments and clear warning timeouts
        const oneMinuteAgo = currentTime - 60000;
        batchAssignments.current = batchAssignments.current.filter(
          (assignment) => {
            if (assignment.expiresAt <= currentTime) {
              // Clear warning timeout if assignment is expired
              if (assignment.warningTimeout) {
                clearTimeout(assignment.warningTimeout);
              }

              // Remove toast for expired order
              const existingToast = activeToasts.current.get(
                assignment.orderId
              );
              if (existingToast) {
                toast.dismiss(existingToast);
                activeToasts.current.delete(assignment.orderId);
                logger.info(
                  `Removed toast for expired order ${assignment.orderId}`,
                  "NotificationSystem"
                );
              }

              logger.info(
                `Assignment expired for order ${assignment.orderId} - reassigning to next shopper`,
                "NotificationSystem"
              );
              return false; // Remove expired assignment
            }
            return true; // Keep active assignment
          }
        );

        // Sort notifications by creation time (oldest first)
        const sortedNotifications = [...data.notifications].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        const assignedOrderIds = new Set(
          batchAssignments.current.map((a) => a.orderId)
        );
        const availableNotifications = sortedNotifications.filter(
          (notification) => !assignedOrderIds.has(notification.id)
        );

        if (availableNotifications.length > 0) {
          const currentUserAssignment = batchAssignments.current.find(
            (assignment) => assignment.shopperId === session.user.id
          );

          if (!currentUserAssignment) {
            const nextNotification = availableNotifications[0];

            const newAssignment: BatchAssignment = {
              shopperId: session.user.id,
              orderId: nextNotification.id,
              assignedAt: currentTime,
              expiresAt: currentTime + 60000, // Expires in 1 minute
              warningShown: false,
              warningTimeout: null,
            };
            batchAssignments.current.push(newAssignment);

            // Convert notification to Order format for compatibility
            const orderForNotification: Order = {
              id: nextNotification.id,
              shopName: nextNotification.shopName,
              distance: nextNotification.distance,
              createdAt: nextNotification.createdAt,
              customerAddress: nextNotification.customerAddress,
              itemsCount: nextNotification.itemsCount || nextNotification.totalItems || 0,
              estimatedEarnings: nextNotification.estimatedEarnings || nextNotification.totalEarnings || 0,
            };

            await playNotificationSound(data.settings?.sound_settings);
            showToast(orderForNotification);
            showDesktopNotification(orderForNotification);

            // Set up warning notification after 40 seconds
            const warningTimeout = setTimeout(() => {
              showWarningNotification(orderForNotification);
            }, 40000); // 40 seconds

            // Update assignment with warning timeout
            newAssignment.warningTimeout = warningTimeout;

            lastNotificationTime.current = currentTime;
            logger.info(
              `Showing initial notification for ${nextNotification.type} from ${nextNotification.shopName} (${nextNotification.locationName}) - warning in 40s, expires in 1 minute`,
              "NotificationSystem",
              nextNotification
            );
          } else {
            logger.debug(
              "User already has an active batch assignment, skipping notification",
              "NotificationSystem"
            );
          }
        } else {
          logger.debug(
            "No available notifications (all assigned or expired)",
            "NotificationSystem"
          );
        }

        // Don't call onNewOrder to prevent page refreshes
        // The notification system should be independent
        logger.info(
          "Notification shown, not triggering page refresh",
          "NotificationSystem"
        );
      } else {
        logger.debug(
          "No notifications found based on settings",
          "NotificationSystem"
        );
      }
    } catch (error) {
      logger.error(
        "Error checking for notifications with settings",
        "NotificationSystem",
        error
      );
    }
  };

  const startNotificationSystem = () => {
    if (!session?.user?.id || !currentLocation) return;

    // Clear existing interval if any
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
    }

    // Reset notification state
    lastNotificationTime.current = 0;

    logger.info("Starting notification system", "NotificationSystem");
    logger.info(
      "Will check for pending orders every 60 seconds with 1-minute assignment timeout",
      "NotificationSystem"
    );

    // Initial check
    checkForNewOrders();

    // Set up interval for checking
    checkInterval.current = setInterval(() => {
      const now = new Date();
      logger.debug(
        `Interval triggered at ${now.toLocaleTimeString()}`,
        "NotificationSystem"
      );
      checkForNewOrders();
    }, 60000); // Check every 60 seconds

    setIsListening(true);
  };

  const stopNotificationSystem = () => {
    logger.info("Stopping notification system", "NotificationSystem");
    if (checkInterval.current) {
      clearInterval(checkInterval.current);
      checkInterval.current = null;
    }

    // Clear all warning timeouts
    batchAssignments.current.forEach((assignment) => {
      if (assignment.warningTimeout) {
        clearTimeout(assignment.warningTimeout);
      }
    });

    // Clear all active toasts
    activeToasts.current.forEach((toastKey) => {
      toast.dismiss(toastKey);
    });
    activeToasts.current.clear();

    setIsListening(false);
    lastOrderIds.current.clear();
    batchAssignments.current = []; // Clear all assignments
  };

  useEffect(() => {
    logger.info("NotificationSystem component mounted", "NotificationSystem");
    return () => {
      logger.info(
        "NotificationSystem component unmounting",
        "NotificationSystem"
      );
      stopNotificationSystem();
    };
  }, []);

  useEffect(() => {
    if (session && currentLocation) {
      logger.info(
        "User logged in and location available, starting notification system",
        "NotificationSystem"
      );
      startNotificationSystem();
    } else {
      logger.warn(
        "Missing requirements for notification system",
        "NotificationSystem",
        {
          hasSession: !!session,
          hasLocation: !!currentLocation,
        }
      );
      stopNotificationSystem();
    }
  }, [session, currentLocation]);

  // The component doesn't render anything visible
  return null;
}
