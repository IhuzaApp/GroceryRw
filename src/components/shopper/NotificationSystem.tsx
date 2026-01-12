import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Message, Button } from "rsuite";
import toast, { Toaster } from "react-hot-toast";
import { logger } from "../../utils/logger";
import { formatCurrencySync } from "../../utils/formatCurrency";
import { useTheme } from "../../context/ThemeContext";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";

// Create a separate toast instance for batch notifications
const batchToast = toast;

interface Order {
  id: string;
  shopName: string;
  distance: number;
  travelTimeMinutes?: number;
  createdAt: string;
  customerAddress: string;
  itemsCount?: number;
  estimatedEarnings?: number;
  orderType?: "regular" | "reel" | "restaurant";
  // Coordinates for map route display
  shopLatitude?: number;
  shopLongitude?: number;
  customerLatitude?: number;
  customerLongitude?: number;
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
  onNotificationShow?: (order: Order | null) => void; // Callback when notification is shown/hidden
}

export default function NotificationSystem({
  onNewOrder,
  currentLocation,
  activeShoppers = [],
  onAcceptBatch,
  onViewBatchDetails,
  onNotificationShow,
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
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);
  const lastNotificationTime = useRef<number>(0);
  const batchAssignments = useRef<BatchAssignment[]>([]);
  const lastOrderIds = useRef<Set<string>>(new Set());
  const activeToasts = useRef<Map<string, any>>(new Map()); // Track active toasts by order ID
  const isCheckingOrders = useRef<boolean>(false); // Prevent concurrent API calls

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
        travelTimeMinutes: order.travelTimeMinutes,
        // Include coordinates for map route display
        shopLatitude: order.shopLatitude,
        shopLongitude: order.shopLongitude,
        customerLatitude: order.customerLatitude,
        customerLongitude: order.customerLongitude,
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
          travelTimeMinutes: order.travelTimeMinutes,
          // Include coordinates for map route display
          shopLatitude: order.shopLatitude,
          shopLongitude: order.shopLongitude,
          customerLatitude: order.customerLatitude,
          customerLongitude: order.customerLongitude,
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
        batchToast.dismiss(existingToast);
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
      if (existingToast === "map-modal") {
        // Close the map modal
        setShowMapModal(false);
        setSelectedOrder(null);
        // Notify parent that notification is hidden
        onNotificationShow?.(null);
      } else {
        batchToast.dismiss(existingToast);
      }
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
      batchToast.dismiss(existingToast);
      activeToasts.current.delete(order.id);
    }

    // Show full-screen map modal instead of toast
    setSelectedOrder(order);
    setShowMapModal(true);

    // Notify parent component about the order being shown
    onNotificationShow?.(order);

    // Store a placeholder in activeToasts to track this order
    activeToasts.current.set(order.id, "map-modal");

    // Send Firebase push notification for batch notifications
    if (type === "info") {
      sendFirebaseNotification(order, "batch");
    }

    return "map-modal";
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

    // If map modal is already showing, just play warning sound
    // The modal will continue to display with the order information
    if (showMapModal && selectedOrder?.id === order.id) {
      playNotificationSound({ enabled: true, volume: 0.8 });
      sendFirebaseNotification(order, "warning");
      return;
    }

    // Otherwise show the map modal (it's already designed to handle urgent orders)
    setSelectedOrder(order);
    setShowMapModal(true);
    activeToasts.current.set(order.id, "map-modal");

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
    // Prevent concurrent API calls
    if (isCheckingOrders.current) {
      return;
    }

    if (!session?.user?.id || !currentLocation) {
      return;
    }

    const now = new Date();
    const currentTime = now.getTime();

    // Set flag to prevent concurrent calls
    isCheckingOrders.current = true;

    // Check if we should skip this check (25-second cooldown to prevent spam)
    if (currentTime - lastNotificationTime.current < 25000) {
      isCheckingOrders.current = false; // Reset flag when skipping
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
        
        // Update lastNotificationTime to prevent rapid API calls
        // This is updated regardless of whether we show a notification
        lastNotificationTime.current = currentTime;

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
                batchToast.dismiss(existingToast);
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
          
          // Validate order data before showing notification
          if (!order.itemsCount || order.itemsCount === 0) {
            logger.warn(
              "Order has 0 items, skipping notification",
              "NotificationSystem",
              { orderId: order.id, orderData: order }
            );
            return;
          }

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
            itemsCount: order.itemsCount,
            estimatedEarnings: order.estimatedEarnings || 0,
            orderType: order.orderType || "regular",
            travelTimeMinutes: order.travelTimeMinutes,
            // Include coordinates for map route display
            shopLatitude: order.shopLatitude,
            shopLongitude: order.shopLongitude,
            customerLatitude: order.customerLatitude,
            customerLongitude: order.customerLongitude,
          };

          console.log("📍 Showing notification with coordinates:", {
            orderId: orderForNotification.id,
            shopName: orderForNotification.shopName,
            customerLatitude: orderForNotification.customerLatitude,
            customerLongitude: orderForNotification.customerLongitude,
            shopLatitude: orderForNotification.shopLatitude,
            shopLongitude: orderForNotification.shopLongitude,
          });

          await playNotificationSound({ enabled: true, volume: 0.7 });
          showToast(orderForNotification);
          showDesktopNotification(orderForNotification);
          
          // FCM notification is already sent by the backend API (smart-assign-order.ts)
          // No need to send duplicate notification from frontend
          
          // Warning notification removed - shoppers now have full 90 seconds to respond
          // No intermediate warning needed as 90 seconds is sufficient time

          // Note: lastNotificationTime is updated at the top of this block

          // Smart order finder: Order shown to shopper for review
        } else {
          // lastNotificationTime was already updated above to prevent rapid API calls
        }
      } else {
        // Update lastNotificationTime even when no orders found to prevent rapid polling
        lastNotificationTime.current = currentTime;
      }
    } catch (error) {
      logger.error(
        "Error in smart order finder system",
        "NotificationSystem",
        error
      );
    } finally {
      // Always reset the flag when done
      isCheckingOrders.current = false;
    }
  };

  const startNotificationSystem = () => {
    if (!session?.user?.id || !currentLocation) return;

    // If already running, don't restart
    if (checkInterval.current) {
      logger.debug(
        "Notification system already running, skipping restart",
        "NotificationSystem"
      );
      return;
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

    // Clear all active batch notification toasts
    activeToasts.current.forEach((toastKey) => {
      batchToast.dismiss(toastKey);
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
    
    // Cleanup on unmount or when dependencies change
    return () => {
      // Don't stop when location updates, only when session changes
      if (!session) {
        stopNotificationSystem();
      }
    };
  }, [session?.user?.id]); // Only depend on session user ID, not location

  // The component renders a separate Toaster for batch notifications
  return (
    <>
      {/* Separate Toaster for batch notifications - positioned independently */}
      <Toaster
        position="top-right"
        containerClassName="batch-notification-container"
        toastOptions={{
          // Only show toasts with our batch notification classes
          className: "",
          style: {
            background: "transparent",
            boxShadow: "none",
            padding: 0,
            margin: 0,
          },
        }}
      />

      {/* Notification Card */}
      {showMapModal && selectedOrder && (
        <div className="fixed inset-x-0 bottom-0 z-50">
          {/* Bottom Sheet Card */}
          <div className="relative w-full rounded-t-3xl bg-white shadow-2xl">
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-12 rounded-full bg-gray-300"></div>
            </div>

            <div className="px-6 pb-6">
              {/* Restaurant Info with Call Button */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-purple-500">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  {/* Restaurant Name */}
                  <div>
                    <p className="text-xs text-gray-500">Restaurant Name</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedOrder.shopName}
                    </p>
                  </div>
                </div>
                {/* Call Button */}
                <button className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-md hover:bg-green-600 transition-colors">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </button>
              </div>

              {/* Location Route with Dashed Line */}
              <div className="relative mb-4">
                {/* Dashed Line */}
                <div className="absolute left-[7px] top-0 h-full w-0.5 border-l-2 border-dashed border-green-500"></div>

                {/* You - Current Location */}
                <div className="relative mb-4 flex items-start space-x-3 pl-6">
                  {/* Green Dot Icon */}
                  <div className="absolute left-0 flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">You</p>
                    <p className="text-sm font-medium text-gray-900">
                      {currentLocation 
                        ? `${currentLocation.lat.toFixed(4)}° N, ${currentLocation.lng.toFixed(4)}° E`
                        : "Current Location"}
                    </p>
                  </div>
                </div>

                {/* Pick Up Location */}
                <div className="relative flex items-start space-x-3 pl-6">
                  {/* Location Pin Icon */}
                  <div className="absolute left-0 flex h-4 w-4 items-center justify-center">
                    <svg
                      className="h-4 w-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Pick Up</p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedOrder.customerAddress}
                        </p>
                      </div>
                      {/* Time Badge */}
                      <div className="ml-2 flex items-center space-x-1 rounded-full bg-red-50 px-2 py-1">
                        <svg
                          className="h-3 w-3 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-red-600">
                          {selectedOrder.travelTimeMinutes ||
                            calculateTravelTime(selectedOrder.distance)}{" "}
                          minute
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-5 space-y-3">
                {/* Items and Earnings */}
                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                  <div className="flex items-center space-x-2">
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
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedOrder.itemsCount || 0} Items
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrencySync(selectedOrder.estimatedEarnings || 0)}
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Payment Info :</span>{" "}
                    <span className="font-semibold text-green-600">Online</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {/* Decline Button */}
                <button
                  onClick={() => {
                    removeToastForOrder(selectedOrder.id);
                    // Remove from local state
                    batchAssignments.current = batchAssignments.current.filter(
                      (assignment) => assignment.orderId !== selectedOrder.id
                    );
                  }}
                  className="flex-1 rounded-xl bg-red-500 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
                >
                  Decline
                </button>

                {/* Accept Batch Button */}
                <button
                  onClick={async () => {
                    const success = await handleAcceptOrder(selectedOrder.id);
                    if (success) {
                      setShowMapModal(false);
                      setSelectedOrder(null);
                      // Notify parent that notification is hidden
                      onNotificationShow?.(null);
                    }
                  }}
                  disabled={acceptingOrders.has(selectedOrder.id)}
                  className={`flex-1 rounded-xl py-4 text-base font-bold text-white shadow-lg transition-all active:scale-95 ${
                    acceptingOrders.has(selectedOrder.id)
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {acceptingOrders.has(selectedOrder.id)
                    ? "Accepting..."
                    : "Accept Batch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
