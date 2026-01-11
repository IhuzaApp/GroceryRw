import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Message, Button } from "rsuite";
import toast from "react-hot-toast";
import { logger } from "../../utils/logger";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { useTheme } from "../../context/ThemeContext";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";

interface Order {
  id: string;
  shopName: string;
  distance: number;
  travelTimeMinutes?: number;
  createdAt: string;
  customerAddress: string;
  itemsCount?: number;
  estimatedEarnings?: number;
  orderType?: "regular" | "reel";
  // Add other order properties as needed
}

// Calculate estimated travel time in minutes
const calculateTravelTime = (distanceKm: number): number => {
  // Assuming average speed of 20 km/h for city driving
  // This can be adjusted based on your city's traffic conditions
  const averageSpeedKmh = 20;
  const travelTimeHours = distanceKm / averageSpeedKmh;
  return Math.round(travelTimeHours * 60); // Convert to minutes
};

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
  const { theme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [acceptingOrders, setAcceptingOrders] = useState<Set<string>>(
    new Set()
  ); // Track orders being accepted
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTime = useRef<number>(0);
  const batchAssignments = useRef<BatchAssignment[]>([]);
  const lastOrderIds = useRef<Set<string>>(new Set());
  const activeToasts = useRef<Map<string, any>>(new Map()); // Track active toasts by order ID

  // FCM integration
  const { isInitialized, hasPermission } = useFCMNotifications();

  // FCM event listeners
  useEffect(() => {
    const handleFCMNewOrder = (event: CustomEvent) => {
      const { order } = event.detail;

      // Convert to Order format and show notification
      const orderForNotification: Order = {
        id: order.id,
        shopName: order.shopName,
        distance: order.distance,
        createdAt: order.createdAt,
        customerAddress: order.customerAddress,
        itemsCount: order.itemsCount || 0,
        estimatedEarnings: order.estimatedEarnings || 0,
        orderType: order.orderType || "regular",
      };

      // Show notification
      showToast(orderForNotification);
      showDesktopNotification(orderForNotification);
    };

    const handleFCMBatchOrders = (event: CustomEvent) => {
      const { orders } = event.detail;

      // Show notifications for each order
      orders.forEach((order: any) => {
        const orderForNotification: Order = {
          id: order.id,
          shopName: order.shopName,
          distance: order.distance,
          createdAt: order.createdAt,
          customerAddress: order.customerAddress,
          itemsCount: order.itemsCount || 0,
          estimatedEarnings: order.estimatedEarnings || 0,
          orderType: order.orderType || "regular",
        };

        showToast(orderForNotification);
        showDesktopNotification(orderForNotification);
      });
    };

    const handleFCMOrderExpired = (event: CustomEvent) => {
      const { orderId } = event.detail;

      // Remove expired order from active assignments
      batchAssignments.current = batchAssignments.current.filter(
        (assignment) => assignment.orderId !== orderId
      );

      // Dismiss toast
      const existingToast = activeToasts.current.get(orderId);
      if (existingToast) {
        toast.dismiss(existingToast);
        activeToasts.current.delete(orderId);
      }
    };

    // Add event listeners for FCM notifications
    window.addEventListener(
      "fcm-new-order",
      handleFCMNewOrder as EventListener
    );
    window.addEventListener(
      "fcm-batch-orders",
      handleFCMBatchOrders as EventListener
    );
    window.addEventListener(
      "fcm-order-expired",
      handleFCMOrderExpired as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "fcm-new-order",
        handleFCMNewOrder as EventListener
      );
      window.removeEventListener(
        "fcm-batch-orders",
        handleFCMBatchOrders as EventListener
      );
      window.removeEventListener(
        "fcm-order-expired",
        handleFCMOrderExpired as EventListener
      );
    };
  }, []);

  // Initialize audio immediately
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        // Initializing notification sound
        const audio = new Audio("/notifySound.mp3");

        // Set audio properties
        audio.preload = "auto";
        audio.volume = 0.7; // Slightly reduce volume

        // Add event listeners
        audio.addEventListener("canplaythrough", () => {
          // Notification sound loaded successfully
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
      // Removed toast for accepted order
    }

    // Also remove from batch assignments
    batchAssignments.current = batchAssignments.current.filter(
      (assignment) => assignment.orderId !== orderId
    );
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to accept orders");
      return false;
    }

    // Prevent multiple acceptance attempts
    if (acceptingOrders.has(orderId)) {
      return false;
    }

    setAcceptingOrders((prev) => new Set(prev).add(orderId));

    try {
      // Accept order via API
      const response = await fetch("/api/shopper/accept-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          userId: session.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to accept order");
      }

      const success = true;

      if (success) {
        // Remove toast and show success message
        removeToastForOrder(orderId);
        toast.success("Order accepted successfully! 🎉");

        // Call parent callback if provided
        onAcceptBatch?.(orderId);

        return true;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept order";
      toast.error(errorMessage);
      return false;
    } finally {
      setAcceptingOrders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }

    return false;
  };

  const sendFirebaseNotification = async (
    order: Order,
    type: "batch" | "warning" = "batch"
  ) => {
    try {
      if (!session?.user?.id) return;

      const payload = {
        shopperId: session.user.id,
        orderId: order.id,
        shopName: order.shopName,
        customerAddress: order.customerAddress,
        distance: order.distance,
        itemsCount: order.itemsCount || 0,
        estimatedEarnings: order.estimatedEarnings || 0,
        orderType: order.orderType || "regular",
        ...(type === "warning" && { timeRemaining: 20 }),
      };

      const endpoint =
        type === "warning"
          ? "/api/fcm/send-warning-notification"
          : "/api/fcm/send-batch-notification";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Firebase notification sent successfully
      } else {
        logger.warn(
          `Failed to send Firebase ${type} notification: ${response.statusText}`,
          "NotificationSystem"
        );
      }
    } catch (error) {
      logger.error(
        `Error sending Firebase ${type} notification:`,
        "NotificationSystem",
        error
      );
    }
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
          } pointer-events-auto w-full max-w-sm rounded-2xl shadow-xl ${
            theme === "dark"
              ? "border border-gray-700 bg-gray-800"
              : "border border-gray-200 bg-white"
          }`}
        >
          {/* Header */}
          <div
            className={`rounded-t-2xl px-4 py-3 ${
              theme === "dark" ? "bg-green-600" : "bg-green-500"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
                <p className="text-sm font-semibold text-white">
                  New Order Available
                </p>
              </div>
              <button
                onClick={() => {
                  removeToastForOrder(order.id);
                  toast.dismiss(t.id);
                }}
                className="text-white/80 transition-colors hover:text-white"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Shop Info */}
            <div className="mb-3 flex items-start space-x-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {order.shopName}
                </p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {order.travelTimeMinutes ||
                    calculateTravelTime(order.distance)}{" "}
                  min away
                </p>
              </div>
            </div>

            {/* Order Details */}
            <div
              className={`mb-4 space-y-2 rounded-lg p-3 ${
                theme === "dark" ? "bg-gray-700/50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  } flex items-center gap-1`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 12v6a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-6m16-4l-8-4-8 4m16 0l-8 4-8-4m16 0v2m-16-2v2"
                    />
                  </svg>
                  Items
                </span>
                <span
                  className={`font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {order.itemsCount || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span
                  className={`${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  } flex items-center gap-1`}
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V4m0 12v2m8-6a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                  Earnings
                </span>
                <span
                  className={`font-semibold ${
                    theme === "dark" ? "text-green-400" : "text-green-600"
                  }`}
                >
                  {formatCurrencySync(order.estimatedEarnings || 0)}
                </span>
              </div>
              <div className="flex items-center gap-1 truncate text-xs text-gray-500">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 0c-4 0-7 2.5-7 5v1h14v-1c0-2.5-3-5-7-5z"
                  />
                </svg>
                {order.customerAddress}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  const success = await handleAcceptOrder(order.id);
                  if (success) {
                    toast.dismiss(t.id);
                  }
                }}
                disabled={acceptingOrders.has(order.id)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  acceptingOrders.has(order.id)
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {acceptingOrders.has(order.id)
                  ? "Accepting..."
                  : "Accept Order"}
              </button>
              <button
                onClick={() => {
                  removeToastForOrder(order.id);
                  // Remove from local state
                  batchAssignments.current = batchAssignments.current.filter(
                    (assignment) => assignment.orderId !== order.id
                  );
                  toast.dismiss(t.id);
                  // Skipped order - allowing other shoppers
                }}
                className="flex-1 rounded-lg bg-gray-500 px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Skip Order
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: 90000, // 90 seconds (1 minute 30 seconds)
        position: "top-right",
      }
    );

    // Store the toast key for this order
    activeToasts.current.set(order.id, toastKey);

    // Send Firebase push notification for batch notifications
    if (type === "info") {
      sendFirebaseNotification(order, "batch");
    }

    return toastKey;
  };

  const playNotificationSound = async (soundSettings?: {
    enabled: boolean;
    volume: number;
  }) => {
    // Check if sound is enabled in settings
    if (soundSettings && !soundSettings.enabled) {
      // Sound notifications disabled in settings
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
      // Notification sound played successfully

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

        // Desktop notification shown
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
          } pointer-events-auto flex w-full max-w-md rounded-xl shadow-2xl backdrop-blur-lg ${
            theme === "dark"
              ? "bg-gradient-to-r from-orange-500 to-red-500 ring-1 ring-white ring-opacity-20"
              : "bg-gradient-to-r from-orange-400 to-red-400 ring-1 ring-black ring-opacity-10"
          }`}
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
                : "linear-gradient(135deg, #fb923c 0%, #f87171 100%)",
            backdropFilter: "blur(10px)",
            border:
              theme === "dark"
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(0,0,0,0.1)",
          }}
        >
          <div className="w-0 flex-1 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-sm ${
                    theme === "dark" ? "bg-white/20" : "bg-white/30"
                  }`}
                >
                  <svg
                    className="h-6 w-6 text-white"
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
              </div>
              <div className="ml-3 flex-1">
                <p className="flex items-center gap-2 text-sm font-bold text-white">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01M10.29 3.86l-7.6 13.15A2 2 0 004.29 20h15.42a2 2 0 001.71-2.99l-7.6-13.15a2 2 0 00-3.52 0z"
                    />
                  </svg>
                  Order Expiring Soon!
                </p>
                <div className="mt-1 text-sm text-white/90">
                  <div className="font-medium">{order.customerAddress}</div>
                  <div className="text-white/80">
                    {order.shopName} (
                    {order.travelTimeMinutes ||
                      calculateTravelTime(order.distance)}{" "}
                    min)
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-1 text-sm text-white/90">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 12v6a2 2 0 01-2 2h-3m-6 0H6a2 2 0 01-2-2v-6m16-4l-8-4-8 4m16 0l-8 4-8-4m16 0v2m-16-2v2"
                        />
                      </svg>
                      {order.itemsCount || 0} items
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-white">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10V4m0 12v2m8-6a8 8 0 11-16 0 8 8 0 0116 0z"
                        />
                      </svg>
                      {formatCurrencySync(order.estimatedEarnings || 0)}
                    </div>
                  </div>
                  <div className="mt-1 animate-pulse font-bold text-white">
                    ⏰ This batch will be reassigned in 20 seconds!
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      const success = await handleAcceptOrder(order.id);
                      if (success) {
                        toast.dismiss(t.id);
                      }
                    }}
                    disabled={acceptingOrders.has(order.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      acceptingOrders.has(order.id)
                        ? "cursor-not-allowed bg-gray-400"
                        : theme === "dark"
                        ? "animate-pulse bg-white/20 hover:bg-white/30"
                        : "animate-pulse bg-white/25 hover:bg-white/35"
                    }`}
                  >
                    {acceptingOrders.has(order.id)
                      ? "Accepting..."
                      : "Accept Now"}
                  </button>
                  <button
                    onClick={() => {
                      removeToastForOrder(order.id);
                      // Remove from local state
                      batchAssignments.current =
                        batchAssignments.current.filter(
                          (assignment) => assignment.orderId !== order.id
                        );
                      toast.dismiss(t.id);
                      // Skipped expiring order - allowing other shoppers
                    }}
                    className={`rounded-lg px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                      theme === "dark"
                        ? "bg-white/10 hover:bg-white/20"
                        : "bg-white/15 hover:bg-white/25"
                    }`}
                  >
                    ⏭️ Skip Order
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-white/20">
            <button
              onClick={() => {
                removeToastForOrder(order.id);
                toast.dismiss(t.id);
              }}
              className="flex w-full items-center justify-center rounded-none rounded-r-xl border border-transparent p-4 text-sm font-medium text-white/70 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
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
        position: "top-center",
        style: {
          background: "transparent",
          boxShadow: "none",
          maxWidth: "420px",
          margin: "0 auto",
        },
        className: "batch-warning-toast",
      }
    );

    // Store the warning toast key for this order
    activeToasts.current.set(order.id, warningToastKey);

    // Send Firebase push notification for warning
    sendFirebaseNotification(order, "warning");

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

        // Warning desktop notification shown
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

    // Warning notification shown for order - expires in 20 seconds
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

    // Check if we should skip this check (30-second cooldown for smart order finder)
    if (currentTime - lastNotificationTime.current < 30000) {
      logger.debug(
        `Skipping smart order finder check - ${Math.floor(
          (30000 - (currentTime - lastNotificationTime.current)) / 1000
        )}s until next check`,
        "NotificationSystem"
      );
      return;
    }

    // Using smart order finder system to find best order

    try {
      // Use smart order finder API instead of polling
      const response = await fetch("/api/shopper/smart-assign-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_location: currentLocation,
          user_id: session.user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        logger.error(
          `Smart order finder API error: ${response.status} - ${
            data.error || "Unknown error"
          }`,
          "NotificationSystem"
        );
        return;
      }

      if (data.success && data.order) {
        // Smart order finder found order

        // Clean up expired order reviews
        const ninetySecondsAgo = currentTime - 90000;
        batchAssignments.current = batchAssignments.current.filter(
          (assignment) => {
            if (assignment.expiresAt <= currentTime) {
              // Clean up warning timeout if it exists (legacy support)
              if (assignment.warningTimeout) {
                clearTimeout(assignment.warningTimeout);
              }
              const existingToast = activeToasts.current.get(
                assignment.orderId
              );
              if (existingToast) {
                toast.dismiss(existingToast);
                activeToasts.current.delete(assignment.orderId);
              }
              return false;
            }
            return true;
          }
        );

        // Check if user already has an active order review
        const currentUserAssignment = batchAssignments.current.find(
          (assignment) => assignment.shopperId === session.user.id
        );

        if (!currentUserAssignment) {
          const order = data.order;
          const newAssignment: BatchAssignment = {
            shopperId: session.user.id,
            orderId: order.id,
            assignedAt: currentTime,
            expiresAt: currentTime + 90000, // Expires in 90 seconds (1 minute 30 seconds)
            warningShown: false,
            warningTimeout: null,
          };
          batchAssignments.current.push(newAssignment);

          // Convert to Order format for compatibility
          const orderForNotification: Order = {
            id: order.id,
            shopName: order.shopName,
            distance: order.distance,
            createdAt: order.createdAt,
            customerAddress: order.customerAddress,
            itemsCount: order.itemsCount || 0,
            estimatedEarnings: order.estimatedEarnings || 0,
            orderType: order.orderType || "regular",
          };

          await playNotificationSound({ enabled: true, volume: 0.7 });
          showToast(orderForNotification);
          showDesktopNotification(orderForNotification);
          sendFirebaseNotification(orderForNotification, "batch");

          // Warning notification removed - shoppers now have full 90 seconds to respond
          // No intermediate warning needed as 90 seconds is sufficient time

          lastNotificationTime.current = currentTime;

          // Smart order finder: Order shown to shopper for review
        } else {
          logger.debug(
            "User already has an active order review, skipping smart order finder",
            "NotificationSystem"
          );
        }
      } else {
        logger.debug(
          data.message || "No suitable orders available for review",
          "NotificationSystem"
        );
      }
    } catch (error) {
      logger.error(
        "Error in smart order finder system",
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

    // Starting smart notification system

    // Initial check
    checkForNewOrders();

    // Set up interval for checking (less frequent when FCM is active)
    const intervalTime = isInitialized ? 120000 : 30000; // 2 minutes with FCM, 30 seconds without
    checkInterval.current = setInterval(() => {
      checkForNewOrders();
    }, intervalTime);

    setIsListening(true);
  };

  const stopNotificationSystem = () => {
    // Stopping notification system
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
    // NotificationSystem component mounted
    return () => {
      // NotificationSystem component unmounting
      stopNotificationSystem();
    };
  }, []);

  useEffect(() => {
    if (session && currentLocation) {
      // User logged in and location available, starting notification system
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
  // FCM connection status indicator (optional UI element)
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="fixed right-4 top-4 z-50">
        <div
          className={`rounded-lg px-3 py-2 text-xs font-medium ${
            isInitialized && hasPermission
              ? "border border-green-200 bg-green-100 text-green-800"
              : "border border-orange-200 bg-orange-100 text-orange-800"
          }`}
        >
          {isInitialized && hasPermission
            ? "🔔 FCM Notifications Active"
            : "📡 Polling Mode"}
        </div>
      </div>
    );
  }

  return null;
}
