import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Message,
  toaster,
  Notification as ToastNotification,
  Button,
} from "rsuite";
import { logger } from "../../utils/logger";

interface Order {
  id: string;
  shopName: string;
  distance: number;
  createdAt: string;
  customerAddress: string;
  // Add other order properties as needed
}

interface BatchAssignment {
  shopperId: string;
  orderId: string;
  assignedAt: number;
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

  const showToast = (
    order: Order,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    toaster.push(
      <ToastNotification
        type={type}
        header="New Batch!"
        closable
        duration={60000}
      >
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex flex-col gap-1 text-gray-600">
            <div>{order.customerAddress}</div>
            <div>
              {order.shopName} ({order.distance}km)
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              appearance="primary"
              size="sm"
              onClick={() => onAcceptBatch?.(order.id)}
            >
              Accept Batch
            </Button>
            <Button
              appearance="subtle"
              size="sm"
              onClick={() => {
                if (onViewBatchDetails) {
                  onViewBatchDetails(order.id);
                  logger.info("Opening batch details for:", order.id);
                } else {
                  logger.warn(
                    "onViewBatchDetails callback not provided",
                    "NotificationSystem"
                  );
                }
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </ToastNotification>,
      { placement: "topEnd" }
    );
  };

  const playNotificationSound = async (soundSettings?: { enabled: boolean; volume: number }) => {
    // Check if sound is enabled in settings
    if (soundSettings && !soundSettings.enabled) {
      logger.info("Sound notifications disabled in settings", "NotificationSystem");
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
          logger.info(
            "Notification sound played successfully (fallback)",
            "NotificationSystem"
          );
        }
      } catch (fallbackError) {
        logger.error(
          "Fallback notification sound also failed",
          "NotificationSystem",
          fallbackError
        );
      }
    }
  };

  const showDesktopNotification = (order: Order) => {
    if (window.Notification && window.Notification.permission === "granted") {
      const options: NotificationOptions = {
        body: `${order.customerAddress}\n${order.shopName} (${order.distance}km)`,
        icon: "/app-icon.png",
        badge: "/app-icon.png",
        tag: "grocery-notification",
        requireInteraction: true,
        silent: true, // We'll handle the sound separately
      };

      const notification = new window.Notification("New Batch!", options);

      notification.onclick = () => {
        window.focus();
        if (onViewBatchDetails) {
          onViewBatchDetails(order.id);
          logger.info(
            "Opening batch details from notification click:",
            order.id
          );
        }
        notification.close();
      };
    }
  };

  // Check if current time is within shopper's schedule
  const isWithinSchedule = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/shopper/schedule");
      const data = await response.json();

      if (!data.schedule || data.schedule.length === 0) {
        logger.info("No schedule found for shopper", "NotificationSystem");
        return false;
      }

      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7

      // Get current time in minutes since midnight
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTimeInMinutes = currentHours * 60 + currentMinutes;

      const todaySchedule = data.schedule.find(
        (s: ShopperSchedule) => s.day_of_week === currentDay
      );

      if (!todaySchedule || !todaySchedule.is_available) {
        logger.info(
          "No schedule or not available for today",
          "NotificationSystem"
        );
        return false;
      }

      // Convert schedule times to minutes since midnight
      const [startHours, startMinutes] = todaySchedule.start_time
        .split(":")
        .map(Number);
      const [endHours, endMinutes] = todaySchedule.end_time
        .split(":")
        .map(Number);

      const startTimeInMinutes = startHours * 60 + startMinutes;
      const endTimeInMinutes = endHours * 60 + endMinutes;

      const isTimeWithinRange =
        currentTimeInMinutes >= startTimeInMinutes &&
        currentTimeInMinutes <= endTimeInMinutes;

      logger.info("Schedule check:", "NotificationSystem", {
        currentDay,
        currentTime: `${currentHours}:${currentMinutes}`,
        scheduleStart: todaySchedule.start_time,
        scheduleEnd: todaySchedule.end_time,
        isTimeWithinRange,
      });

      return isTimeWithinRange;
    } catch (error) {
      logger.error("Error checking schedule:", "NotificationSystem", error);
      return false;
    }
  };

  // Check if shopper has any active orders
  const hasActiveOrders = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/shopper/activeOrders");
      const data = await response.json();

      const hasActive = data.orders && data.orders.length > 0;
      logger.debug("Active orders check", "NotificationSystem", {
        hasActive,
        count: data.orders?.length || 0,
      });

      return hasActive;
    } catch (error) {
      logger.error("Error checking active orders", "NotificationSystem", error);
      return true; // Assume has active orders on error to prevent notifications
    }
  };

  // Check if shopper status is active based on their availability schedule
  const isShopperActive = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/shopper/schedule");
      const data = await response.json();

      if (!data.schedule || data.schedule.length === 0) {
        logger.info("No schedule found for shopper", "NotificationSystem");
        return false;
      }

      const now = new Date();
      const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Convert Sunday from 0 to 7
      const currentTime = now.toLocaleTimeString("en-US", { hour12: false });

      const todaySchedule = data.schedule.find(
        (s: ShopperSchedule) => s.day_of_week === currentDay
      );

      if (!todaySchedule) {
        logger.info("No schedule for today", "NotificationSystem");
        return false;
      }

      if (!todaySchedule.is_available) {
        logger.info("Shopper is not available today", "NotificationSystem");
        return false;
      }

      const isTimeWithinRange =
        currentTime >= todaySchedule.start_time &&
        currentTime <= todaySchedule.end_time;

      logger.info("Schedule check result", "NotificationSystem", {
        currentDay,
        currentTime,
        scheduleStart: todaySchedule.start_time,
        scheduleEnd: todaySchedule.end_time,
        isWithinRange: isTimeWithinRange,
      });

      return isTimeWithinRange;
    } catch (error) {
      logger.error(
        "Error checking shopper availability",
        "NotificationSystem",
        error
      );
      return false;
    }
  };

  const checkForNewOrders = async () => {
    if (!currentLocation || !session?.user?.id) return;

    const now = new Date();
    const currentTime = now.getTime();

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
      const response = await fetch("/api/shopper/check-notifications-with-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: session.user.id,
          current_location: currentLocation,
        }),
      });

      const data = await response.json();

      if (data.success && data.notifications && data.notifications.length > 0) {
        logger.info(
          `Found ${data.notifications.length} notifications based on settings`,
          "NotificationSystem"
        );

        // Clean up expired assignments
        batchAssignments.current = batchAssignments.current.filter(
          (assignment) => currentTime - assignment.assignedAt < 60000
        );

        // Sort notifications by creation time (oldest first)
        const sortedNotifications = [...data.notifications].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
            };
            batchAssignments.current.push(newAssignment);

            // Convert notification to Order format for compatibility
            const orderForNotification: Order = {
              id: nextNotification.id,
              shopName: nextNotification.shopName,
              distance: nextNotification.distance,
              createdAt: nextNotification.createdAt,
              customerAddress: nextNotification.customerAddress,
            };

            await playNotificationSound(data.settings?.sound_settings);
            showToast(orderForNotification);
            showDesktopNotification(orderForNotification);

            lastNotificationTime.current = currentTime;
            logger.info(
              `Showing notification for ${nextNotification.type} from ${nextNotification.shopName} (${nextNotification.locationName})`,
              "NotificationSystem",
              nextNotification
            );
          } else {
            logger.debug(
              "User already has an active batch assignment, skipping notification",
              "NotificationSystem"
            );
          }
        }

        if (onNewOrder) {
          // Convert notifications back to order format for compatibility
          const orders = data.notifications.map((notification: any) => ({
            id: notification.id,
            shopName: notification.shopName,
            distance: notification.distance,
            createdAt: notification.createdAt,
            customerAddress: notification.customerAddress,
          }));
          onNewOrder(orders);
        }
      } else {
        logger.debug("No notifications found based on settings", "NotificationSystem");
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
      "Will check for pending orders every 60 seconds",
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
    setIsListening(false);
    lastOrderIds.current.clear();
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
