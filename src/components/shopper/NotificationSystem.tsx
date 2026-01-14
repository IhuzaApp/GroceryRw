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
  const declinedOrders = useRef<Map<string, number>>(new Map()); // Track declined orders with timestamp
  const lastDeclineTime = useRef<number>(0); // Track when user last declined an order
  const declineClickCount = useRef<number>(0); // Track decline button clicks
  const acceptClickCount = useRef<number>(0); // Track accept button clicks
  const directionsClickCount = useRef<number>(0); // Track directions button clicks
  const showToastLock = useRef<Map<string, number>>(new Map()); // Prevent duplicate showToast calls
  const pageLoadTimestamp = useRef<number>(Date.now()); // Track when page was loaded
  const isPageVisible = useRef<boolean>(true); // Track if page is visible
  const lastUserActivityTime = useRef<number>(Date.now()); // Track last user activity
  const [isShopperOnline, setIsShopperOnline] = useState(false); // Track if shopper is online (has location cookies)
  const componentId = useRef<string>(Math.random().toString(36).substring(7)); // Unique component ID for debugging

  // FCM integration
  const { isInitialized, hasPermission } = useFCMNotifications();

  // Log component mount for debugging duplicate instances
  useEffect(() => {
    // Track active instances globally to detect duplicates
    if (!(window as any).__notificationSystemInstances) {
      (window as any).__notificationSystemInstances = new Set();
    }

    const instances = (window as any).__notificationSystemInstances;
    const hadInstancesBefore = instances.size;
    instances.add(componentId.current);

    if (instances.size > 1) {
      console.error("⚠️ DUPLICATE NotificationSystem DETECTED!", {
        activeInstances: Array.from(instances),
        thisComponentId: componentId.current,
        message:
          "Multiple NotificationSystem components are running! This will cause duplicate API calls.",
      });
    } else if (process.env.NODE_ENV === "development") {
    }

    return () => {
      instances.delete(componentId.current);

    };
  }, []);

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
    const updateShopperOnlineStatus = () => {
      const online = checkOnlineStatus();

      // Only update if status actually changed
      if (online !== isShopperOnline) {
        setIsShopperOnline(online);

        // Clear notifications when going offline (only if we were actually running)
        if (!online && checkInterval.current !== null) {
          console.log("🔴 Going offline - stopping notification system", {
            componentId: componentId.current,
          });
          stopNotificationSystem();

          // Close any open notification modals
          setShowMapModal(false);
          setSelectedOrder(null);
          onNotificationShow?.(null);
        }
      }
    };

    // Initial check
    updateShopperOnlineStatus();

    // Listen for go live toggle events
    const handleToggle = () => {
      setTimeout(updateShopperOnlineStatus, 300);
    };
    window.addEventListener("toggleGoLive", handleToggle);

    // Poll for cookie changes every 10 seconds
    const intervalId = setInterval(updateShopperOnlineStatus, 10000);

    return () => {
      window.removeEventListener("toggleGoLive", handleToggle);
      clearInterval(intervalId);
    };
  }, [isShopperOnline]); // Check against current value

  // Load declined orders from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("declined_orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        // Only restore orders that haven't expired (5 minutes)
        Object.entries(parsed).forEach(([orderId, expiresAt]) => {
          if ((expiresAt as number) > now) {
            declinedOrders.current.set(orderId, expiresAt as number);
          }
        });
      }
    } catch (error) {
      console.error("Failed to load declined orders from localStorage:", error);
    }
  }, []);

  // Track page visibility and user activity
  useEffect(() => {
    const handleVisibilityChange = () => {
      isPageVisible.current = !document.hidden;
      if (!document.hidden) {
        lastUserActivityTime.current = Date.now();
      }
      console.log("👁️ Page visibility changed:", {
        visible: isPageVisible.current,
        timestamp: new Date().toISOString(),
      });
    };

    const handleUserActivity = () => {
      lastUserActivityTime.current = Date.now();
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("touchstart", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    window.addEventListener("keydown", handleUserActivity);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("touchstart", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      window.removeEventListener("keydown", handleUserActivity);
    };
  }, []);

  // FCM event listeners
  useEffect(() => {
    const handleFCMNewOrder = (event: CustomEvent) => {
      const { order } = event.detail;
      const now = Date.now();

      console.log("📲 FCM NEW ORDER EVENT", {
        orderId: order.id,
        timestamp: new Date().toISOString(),
        isDeclined: declinedOrders.current.has(order.id),
        alreadyShowing: activeToasts.current.has(order.id),
        recentlyShown: showToastLock.current.has(order.id),
        pageVisible: isPageVisible.current,
        timeSincePageLoad: now - pageLoadTimestamp.current,
        timeSinceLastActivity: now - lastUserActivityTime.current,
      });

      // CRITICAL: Don't show notifications within 10 seconds of page load (prevent page refresh spam)
      if (now - pageLoadTimestamp.current < 10000) {
        console.log("🚫 FCM: Blocking - page just loaded/refreshed", {
          orderId: order.id,
          timeSincePageLoad: now - pageLoadTimestamp.current,
        });
        return;
      }

      // CRITICAL: Only show notifications if page is visible and user is active
      if (!isPageVisible.current) {
        console.log("🚫 FCM: Blocking - page not visible", {
          orderId: order.id,
        });
        return;
      }

      // Check if user has been inactive for more than 5 minutes
      if (now - lastUserActivityTime.current > 300000) {
        console.log("🚫 FCM: Blocking - user inactive for too long", {
          orderId: order.id,
          inactiveTime: now - lastUserActivityTime.current,
        });
        return;
      }

      // Check if order was declined
      if (declinedOrders.current.has(order.id)) {
        console.log("🚫 FCM: Order was declined, ignoring", {
          orderId: order.id,
        });
        return;
      }

      // Skip if order is already showing
      if (activeToasts.current.has(order.id)) {
        console.log("🚫 FCM: Order already showing, ignoring", {
          orderId: order.id,
        });
        return;
      }

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
      const now = Date.now();

      console.log("📲 FCM BATCH ORDERS EVENT", {
        orderCount: orders.length,
        timestamp: new Date().toISOString(),
        pageVisible: isPageVisible.current,
        timeSincePageLoad: now - pageLoadTimestamp.current,
        timeSinceLastActivity: now - lastUserActivityTime.current,
      });

      // CRITICAL: Don't show notifications within 10 seconds of page load
      if (now - pageLoadTimestamp.current < 10000) {
        console.log("🚫 FCM BATCH: Blocking - page just loaded/refreshed", {
          timeSincePageLoad: now - pageLoadTimestamp.current,
        });
        return;
      }

      // CRITICAL: Only show notifications if page is visible and user is active
      if (!isPageVisible.current) {
        console.log("🚫 FCM BATCH: Blocking - page not visible");
        return;
      }

      // Check if user has been inactive for more than 5 minutes
      if (now - lastUserActivityTime.current > 300000) {
        console.log("🚫 FCM BATCH: Blocking - user inactive for too long", {
          inactiveTime: now - lastUserActivityTime.current,
        });
        return;
      }

      // Show notifications for each order
      orders.forEach((order: any) => {
        // Check if order was declined
        if (declinedOrders.current.has(order.id)) {
          return;
        }

        // Skip if order is already showing
        if (activeToasts.current.has(order.id)) {
          console.log("🚫 FCM BATCH: Order already showing, ignoring", {
            orderId: order.id,
          });
          return;
        }

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

    // Clear deduplication lock after 5 seconds to allow re-showing if needed
    setTimeout(() => {
      showToastLock.current.delete(orderId);
      console.log("🔓 Cleared deduplication lock for order", { orderId });
    }, 5000);

    // Also remove from batch assignments
    batchAssignments.current = batchAssignments.current.filter(
      (assignment) => assignment.orderId !== orderId
    );
  };

  /**
   * Helper function to show a new order notification
   * This function is called either immediately for new orders,
   * or after a 400ms delay when replacing an existing notification
   * to allow for smooth exit animations
   */
  const showNewOrderNotification = async (order: any, currentTime: number) => {
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
      expiresAt: currentTime + 60000, // Expires in 60 seconds
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

    // Store active offer in localStorage for persistence across page refreshes
    try {
      localStorage.setItem(
        "active_offer",
        JSON.stringify({
          order: orderForNotification,
          expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
          assignedAt: currentTime,
        })
      );
    } catch (error) {
      logger.warn("Failed to store active offer in localStorage", "NotificationSystem", error);
    }

    await playNotificationSound({ enabled: true, volume: 0.7 });
    showToast(orderForNotification);
    showDesktopNotification(orderForNotification);
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
    const now = Date.now();

    // Check if order was declined - CRITICAL CHECK
    if (declinedOrders.current.has(order.id)) {
      return;
    }

    // DEDUPLICATION LOCK: Prevent showing same order within 2 seconds
    const lastShown = showToastLock.current.get(order.id);
    if (lastShown && now - lastShown < 2000) {
      return;
    }

    // Check if this order is already being shown - prevent duplicates
    const existingToast = activeToasts.current.get(order.id);
    if (
      existingToast === "map-modal" &&
      showMapModal &&
      selectedOrder?.id === order.id
    ) {
      return;
    }

    // Remove any existing toast for this order if it's not currently displayed
    if (existingToast) {
      batchToast.dismiss(existingToast);
      activeToasts.current.delete(order.id);
    }

    // Set deduplication lock
    showToastLock.current.set(order.id, now);

    // Show full-screen map modal instead of toast
    setSelectedOrder(order);
    setShowMapModal(true);

    // Notify parent component about the order being shown
    onNotificationShow?.(order);

    // Dispatch custom event for other components (e.g., MapSection) to listen to
    window.dispatchEvent(
      new CustomEvent("notification-order-shown", {
        detail: { order },
      })
    );

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
    // CRITICAL: Prevent concurrent API calls with early return
    if (isCheckingOrders.current) {
      return; // Silent skip - already checking
    }

    if (!session?.user?.id || !currentLocation) {
      return;
    }

    // CRITICAL: Only check if shopper is online (has location cookies)
    if (!isShopperOnline) {
      return; // Silent skip - shopper offline
    }

    const now = new Date();
    const currentTime = now.getTime();

    // Set flag IMMEDIATELY to prevent concurrent calls
    isCheckingOrders.current = true;

    // CRITICAL: Don't check for new orders within 15 seconds of page load
    if (currentTime - pageLoadTimestamp.current < 15000) {
      isCheckingOrders.current = false;
      return; // Silent skip - page just loaded
    }

    // CRITICAL: Only check if page is visible and user is active
    if (!isPageVisible.current) {
      isCheckingOrders.current = false;
      return; // Silent skip - page not visible
    }

    // Check if user has been inactive for more than 5 minutes
    if (currentTime - lastUserActivityTime.current > 300000) {
      isCheckingOrders.current = false;
      return; // Silent skip - user inactive
    }

    // Check if user just declined an order (10-second cooldown)
    if (currentTime - lastDeclineTime.current < 10000) {
      isCheckingOrders.current = false;
      return; // Silent skip - decline cooldown
    }

    // Check if we should skip this check (25-second cooldown to prevent spam)
    if (currentTime - lastNotificationTime.current < 25000) {
      isCheckingOrders.current = false; // Reset flag when skipping
      return; // Silent skip - rate limiting
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

        // Clean up expired order reviews (60 seconds)
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

        // Clean up expired declined orders
        for (const [orderId, expiresAt] of declinedOrders.current.entries()) {
          if (expiresAt <= currentTime) {
            declinedOrders.current.delete(orderId);
          }
        }

        // Check if user already has an active order review
        const currentUserAssignment = batchAssignments.current.find(
          (assignment) => assignment.shopperId === session.user.id
        );

        // Check if this order was declined
        const order = data.order;
        const wasDeclined = declinedOrders.current.has(order.id);

        // Check if a better order is available (higher earnings)
        const currentOrderEarnings = currentUserAssignment
          ? selectedOrder?.estimatedEarnings || 0
          : 0;
        const newOrderEarnings = order.estimatedEarnings || 0;
        const isBetterOrder = newOrderEarnings > currentOrderEarnings;

        // Skip if order is already showing
        if (activeToasts.current.has(order.id)) {
          return; // Silent skip - order already showing
        }

        // Show order if: no current assignment OR this is a better order (not declined)
        if ((!currentUserAssignment || isBetterOrder) && !wasDeclined) {
          // If replacing a current order, remove the old one first with smooth transition
          if (currentUserAssignment && isBetterOrder) {
            console.log("🔄 Replacing current order with better one", {
              oldOrderId: currentUserAssignment.orderId,
              oldEarnings: currentOrderEarnings,
              newOrderId: order.id,
              newEarnings: newOrderEarnings,
            });

            // Remove old assignment
            batchAssignments.current = batchAssignments.current.filter(
              (a) => a.orderId !== currentUserAssignment.orderId
            );

            // Dismiss old notification
            removeToastForOrder(currentUserAssignment.orderId);

            // Wait for exit animation to complete before showing new notification
            console.log("⏳ Waiting for exit animation (500ms)...", {
              oldOrderId: currentUserAssignment.orderId,
              newOrderId: order.id,
            });

            setTimeout(() => {
              console.log(
                "✨ Exit animation complete, showing new notification",
                {
                  newOrderId: order.id,
                }
              );

              // Now show the new order after old one has disappeared
              showNewOrderNotification(order, currentTime);
            }, 500); // Wait 500ms for exit animation

            return; // Exit early, we'll show the new notification after the delay
          }

          // Continue with showing new order (if not replacing)...
          // Show the new order notification immediately
          await showNewOrderNotification(order, currentTime);

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

    // CRITICAL: Only start if shopper is online
    if (!isShopperOnline) {
      return;
    }

    // If already running, don't restart
    if (checkInterval.current) {
      return;
    }

    // Reset notification state
    lastNotificationTime.current = 0;

    console.log("🟢 Starting smart notification system - shopper is online", {
      componentId: componentId.current,
      isDevelopment: process.env.NODE_ENV === "development",
      hasStrictMode: "React StrictMode may cause duplicate logs in development",
    });

    // Initial check with slight delay to prevent race conditions and StrictMode double-calls
    setTimeout(() => {
      checkForNewOrders();
    }, 2000); // Increased to 2 seconds

    // Set up interval for checking (less frequent when FCM is active)
    // Polling is mainly a backup - FCM handles most notifications
    const intervalTime = isInitialized ? 180000 : 60000; // 3 minutes with FCM, 1 minute without
    checkInterval.current = setInterval(() => {
      checkForNewOrders();
    }, intervalTime);

    setIsListening(true);
  };

  const stopNotificationSystem = () => {
    // Only log if something was actually running
    if (checkInterval.current || isListening) {
    }

    // Force release the lock
    isCheckingOrders.current = false;

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

  // Track when notification card shows/hides
  // Check for active offers on mount and restore notification
  const checkForActiveOffer = async () => {
    if (!session?.user?.id || !currentLocation || !isShopperOnline) {
      return;
    }

    try {
      // Check localStorage first for quick restore
      const storedActiveOffer = localStorage.getItem("active_offer");
      if (storedActiveOffer) {
        try {
          const offer = JSON.parse(storedActiveOffer);
          // Verify offer is still valid (not expired)
          if (offer.expiresAt && new Date(offer.expiresAt) > new Date()) {
            // Restore notification from localStorage
            showNewOrderNotification(offer.order, Date.now());
            return; // Exit early, offer restored from cache
          } else {
            // Offer expired, remove from localStorage
            localStorage.removeItem("active_offer");
          }
        } catch (e) {
          // Invalid stored data, remove it
          localStorage.removeItem("active_offer");
        }
      }

      // Query backend to check for active offers
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

      if (data.success && data.order) {
        // Active offer found - show notification immediately
        // showNewOrderNotification will store it in localStorage
        const order = data.order;
        await showNewOrderNotification(order, Date.now());
      } else if (data.reason === "ACTIVE_OFFER_PENDING") {
        // Shopper has an active offer but API didn't return order details
        // This shouldn't happen, but if it does, we'll check again in the normal polling
      }
    } catch (error) {
      logger.error(
        "Error checking for active offer on mount",
        "NotificationSystem",
        error
      );
    }
  };

  useEffect(() => {
    if (showMapModal && selectedOrder) {
      // Reset click counters for new notification
      declineClickCount.current = 0;
      acceptClickCount.current = 0;
      directionsClickCount.current = 0;
    }
  }, [showMapModal, selectedOrder]);

  // Check for active offers immediately on mount
  useEffect(() => {
    if (session?.user?.id && currentLocation && isShopperOnline) {
      // Check for active offers immediately (before normal polling starts)
      checkForActiveOffer();
    }
  }, [session?.user?.id, currentLocation, isShopperOnline]);

  useEffect(() => {
    if (session && currentLocation && isShopperOnline) {
      startNotificationSystem();
    } else {
      if (!isShopperOnline) {
        // Shopper is offline - notification system stopped
      } else {
        logger.warn(
          "Missing requirements for notification system",
          "NotificationSystem",
          {
            hasSession: !!session,
            hasLocation: !!currentLocation,
            isShopperOnline,
          }
        );
      }
      stopNotificationSystem();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      // Don't stop when location updates, only when session or online status changes
      if (!session || !isShopperOnline) {
        stopNotificationSystem();
      }
    };
  }, [session?.user?.id, isShopperOnline]); // Depend on session user ID and online status

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
      {showMapModal && selectedOrder ? (
        <div
          key={selectedOrder.id}
          className="fixed inset-x-0 bottom-0 z-50 flex md:justify-end md:px-8 md:pb-6"
          onClick={(e) => {
            // Only log if clicking on the background, not the card itself
            // Background click handler
          }}
        >
          {/* Bottom Sheet Card */}
          <div
            className="relative w-full rounded-t-3xl bg-white shadow-2xl md:max-w-md md:rounded-2xl"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-3">
              <div className="h-1 w-12 rounded-full bg-gray-300"></div>
            </div>

            <div className="px-6 pb-6">
              {/* Order Info with Directions Button */}
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
                  {/* Shop Name */}
                  <div>
                    <p className="text-xs text-gray-500">Shop</p>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedOrder.shopName}
                    </p>
                  </div>
                </div>
                {/* Directions Button */}
                <button
                  onPointerDown={(e) => {
                    console.log("👆 DIRECTIONS POINTER DOWN", {
                      orderId: selectedOrder.id,
                      timestamp: new Date().toISOString(),
                      pointerType: e.pointerType,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onPointerUp={(e) => {
                    console.log("👆 DIRECTIONS POINTER UP", {
                      orderId: selectedOrder.id,
                      timestamp: new Date().toISOString(),
                      pointerType: e.pointerType,
                    });
                  }}
                  onClick={() => {
                    directionsClickCount.current += 1;
                    console.log("🗺️ DIRECTIONS BUTTON CLICKED", {
                      orderId: selectedOrder.id,
                      timestamp: new Date().toISOString(),
                      clickCount: directionsClickCount.current,
                      totalClicks: `This is click #${directionsClickCount.current}`,
                      coordinates: {
                        lat: selectedOrder.customerLatitude,
                        lng: selectedOrder.customerLongitude,
                      },
                    });

                    // Open Google Maps with directions to delivery address
                    const destLat = selectedOrder.customerLatitude;
                    const destLng = selectedOrder.customerLongitude;
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
                    window.open(mapsUrl, "_blank");
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-md transition-colors hover:bg-blue-600"
                  title="Open in Google Maps"
                >
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
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
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
                        ? `${currentLocation.lat.toFixed(
                            4
                          )}° N, ${currentLocation.lng.toFixed(4)}° E`
                        : "Current Location"}
                    </p>
                  </div>
                </div>

                {/* Delivery Location */}
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
                        <p className="text-xs text-gray-500">
                          Delivery Address
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {selectedOrder.customerAddress}
                        </p>
                      </div>
                      {/* Time Badge */}
                      <div className="ml-2 flex items-center space-x-1 rounded-full bg-green-50 px-2 py-1">
                        <svg
                          className="h-3 w-3 text-green-600"
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
                        <span className="text-xs font-medium text-green-600">
                          {selectedOrder.travelTimeMinutes ||
                            calculateTravelTime(selectedOrder.distance)}{" "}
                          min
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
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {/* Decline Button */}
                <button
                  onClick={() => {
                    declineClickCount.current += 1;

                    // Save order ID before clearing state
                    const orderId = selectedOrder.id;
                    const expiresAt = Date.now() + 300000; // 5 minutes

                    // Add to declined orders list (expires after 5 minutes)
                    declinedOrders.current.set(orderId, expiresAt);

                    // Persist to localStorage
                    try {
                      const declinedObj: Record<string, number> = {};
                      declinedOrders.current.forEach((value, key) => {
                        declinedObj[key] = value;
                      });
                      localStorage.setItem(
                        "declined_orders",
                        JSON.stringify(declinedObj)
                      );
                      console.log("💾 Saved declined orders to localStorage", {
                        count: declinedOrders.current.size,
                      });
                    } catch (error) {
                      console.error(
                        "Failed to save declined orders to localStorage:",
                        error
                      );
                    }

                    // Clear active offer from localStorage since it's been declined
                    try {
                      localStorage.removeItem("active_offer");
                    } catch (error) {
                      logger.warn("Failed to clear active offer from localStorage", "NotificationSystem", error);
                    }

                    // Set decline cooldown (10 seconds before showing next notification)
                    lastDeclineTime.current = Date.now();

                    // Remove from tracking
                    removeToastForOrder(orderId);

                    // Remove from local state
                    batchAssignments.current = batchAssignments.current.filter(
                      (assignment) => assignment.orderId !== orderId
                    );

                    // Close the notification modal
                    setShowMapModal(false);
                    setSelectedOrder(null);

                    // Notify parent that notification is hidden
                    onNotificationShow?.(null);

                    // Dispatch custom event
                    window.dispatchEvent(
                      new CustomEvent("notification-order-hidden", {
                        detail: { orderId },
                      })
                    );


                    // 🚀 CALL BACKEND API TO DECLINE OFFER AND ROTATE TO NEXT SHOPPER
                    (async () => {
                      try {
                        console.log(
                          "📡 Calling decline API to rotate to next shopper...",
                          {
                            orderId,
                            shopperId: session?.user?.id,
                          }
                        );

                        const declineResponse = await fetch(
                          "/api/shopper/decline-offer",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              orderId: orderId,
                              userId: session?.user?.id,
                            }),
                          }
                        );

                        const declineData = await declineResponse.json();

                        if (declineResponse.ok) {
                          console.log(
                            "✅ Decline API successful - order rotated to next shopper:",
                            {
                              orderId,
                              nextShopperId: declineData.nextShopper?.id,
                              message: declineData.message,
                            }
                          );
                        } else {
                          console.error("❌ Decline API failed:", declineData);
                        }
                      } catch (error) {
                        console.error("❌ Error calling decline API:", error);
                      }
                    })();
                  }}
                  className="flex-1 rounded-xl bg-red-500 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
                >
                  Decline
                </button>

                {/* Accept Batch Button */}
                <button
                  onPointerDown={(e) => {
                    console.log("👆 ACCEPT POINTER DOWN", {
                      orderId: selectedOrder.id,
                      timestamp: new Date().toISOString(),
                      pointerType: e.pointerType,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onClick={async () => {
                    acceptClickCount.current += 1;

                    const success = await handleAcceptOrder(selectedOrder.id);

                    console.log("🟢 ACCEPT RESULT", {
                      orderId: selectedOrder.id,
                      success,
                      timestamp: new Date().toISOString(),
                    });

                    if (success) {
                      setShowMapModal(false);
                      setSelectedOrder(null);
                      // Notify parent that notification is hidden
                      onNotificationShow?.(null);

                      // Dispatch custom event
                      window.dispatchEvent(
                        new CustomEvent("notification-order-hidden", {
                          detail: { orderId: selectedOrder.id },
                        })
                      );
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
      ) : null}
    </>
  );
}
