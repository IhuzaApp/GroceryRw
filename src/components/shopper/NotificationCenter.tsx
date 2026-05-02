"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";
import { useSession } from "next-auth/react";
import { useHideBottomBar } from "../../context/HideBottomBarContext";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { createPortal } from "react-dom";
import { requestNotificationPermission } from "../../services/fcmClient";

// Check if mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

interface NotificationItem {
  title: string;
  body: string;
  timestamp: number;
  type: string;
  read: boolean;
  orderId?: string;
  displayOrderId?: string | number;
  OrderID?: string | number;
  conversationId?: string;
  senderName?: string;
  isCombinedOrder?: boolean;
  orderCount?: number;
  totalEarnings?: number;
  storeNames?: string;
  orderIds?: string | string[]; // For combined orders - can be string (JSON) or array
  orderType?: string; // regular | reel | restaurant - for deduplication
  combinedOrderId?: string;
}

export default function NotificationCenter() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { setHideFloatingUI } = useHideBottomBar();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currency, setCurrency] = useState<string>("UGX");
  const [assignedOrderIds, setAssignedOrderIds] = useState<Set<string>>(
    new Set()
  );
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const router = useRouter();
  const isShopping = router.pathname.includes("/Plasa/active-batches");
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<number>(0);

  // Ensure FCM is initialized anywhere the notification bell exists
  // (singleton guarded in fcmClient to prevent duplicate listeners)
  const { isInitialized, hasPermission } = useFCMNotifications();

  // Fetch active orders to filter out notifications for already-assigned orders
  // Only for shoppers - regular users don't need this
  useEffect(() => {
    const fetchActiveOrders = async () => {
      if (!session?.user?.id) return;

      // Only fetch active orders for shoppers
      const role = (session.user as any)?.role;
      const isShopper = role === "shopper";
      if (!isShopper) {
        return;
      }

      try {
        const response = await fetch("/api/shopper/activeOrders");
        if (response.ok) {
          const data = await response.json();
          const orders = data.orders || [];
          // Create a set of assigned order IDs (ensure they're strings)
          const orderIds = new Set<string>(
            orders.map((o: any) => String(o.id)).filter(Boolean)
          );
          setAssignedOrderIds(orderIds);
        }
      } catch (error) {
        console.error("Error fetching active orders:", error);
      }
    };

    fetchActiveOrders();
    // Refresh active orders every 10 seconds
    const interval = setInterval(fetchActiveOrders, 10000);
    return () => clearInterval(interval);
  }, [session?.user?.id]);

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    const onHistoryUpdated = () => loadNotifications();
    window.addEventListener(
      "fcm-history-updated",
      onHistoryUpdated as EventListener
    );
    // Also refresh when another tab updates localStorage
    window.addEventListener("storage", onHistoryUpdated as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "fcm-history-updated",
        onHistoryUpdated as EventListener
      );
      window.removeEventListener("storage", onHistoryUpdated as EventListener);
    };
  }, [assignedOrderIds]); // Reload when assigned orders change

  // Detect new notifications and show a small toast if we are on the active-batches page
  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0]; // notifications are sorted newest first
      if (latest.timestamp > lastSeenTimestamp && !latest.read) {
        setLastSeenTimestamp(latest.timestamp);

        // Play notification sound
        try {
          const audio = new Audio("/notifySound.mp3");
          audio.volume = 0.6;
          audio.play().catch(() => {
            // Play failed (e.g. user hasn't interacted with page) - ignore
          });
        } catch (e) {
          // ignore sound errors
        }

        // Show small toast if shopping
        if (isShopping) {
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible
                    ? "duration-300 animate-in fade-in slide-in-from-top-2"
                    : "duration-300 animate-out fade-out slide-out-to-top-2"
                } pointer-events-auto flex w-full max-w-sm overflow-hidden rounded-2xl border border-black/5 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#1A1A1A]/90`}
              >
                <div className="w-0 flex-1 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          theme === "dark"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p
                        className={`text-sm font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {latest.title}
                      </p>
                      <p
                        className={`mt-1 line-clamp-2 text-xs ${
                          theme === "dark" ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {latest.body}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`flex border-l ${
                    theme === "dark" ? "border-white/10" : "border-gray-200"
                  }`}
                >
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className={`flex w-full items-center justify-center rounded-none border border-transparent p-4 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${
                      theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Close
                  </button>
                </div>
              </div>
            ),
            { duration: 5000, position: "top-center" }
          );
        }
      } else if (lastSeenTimestamp === 0) {
        // Initialize on first load
        setLastSeenTimestamp(latest.timestamp);
      }
    }
  }, [notifications, isShopping, lastSeenTimestamp, theme]);

  // Load currency from system configuration
  useEffect(() => {
    let cancelled = false;
    const loadCurrency = async () => {
      try {
        const resp = await fetch("/api/queries/system-configuration");
        if (!resp.ok) return;
        const data = await resp.json();
        const configCurrency = data?.config?.currency;
        if (
          !cancelled &&
          typeof configCurrency === "string" &&
          configCurrency.trim()
        ) {
          setCurrency(configCurrency.trim());
        }
      } catch {
        // ignore; keep default
      }
    };
    loadCurrency();
    return () => {
      cancelled = true;
    };
  }, []);

  // Close when clicking outside (since we removed the overlay/backdrop)
  useEffect(() => {
    if (!isOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // When opening the dropdown, refresh immediately (latest history)
  useEffect(() => {
    if (isOpen) loadNotifications();
  }, [isOpen, assignedOrderIds]);

  // Hide bottom elements when modal is open on mobile
  useEffect(() => {
    if (isMobile) {
      setHideFloatingUI(isOpen);
    }

    return () => {
      // Ensure we always clean up when unmounting
      if (isMobile) {
        setHideFloatingUI(false);
      }
    };
  }, [isOpen, isMobile, setHideFloatingUI]);

  const loadNotifications = () => {
    try {
      const history = JSON.parse(
        localStorage.getItem("fcm_notification_history") || "[]"
      );

      // Check user role to filter notifications
      const role = (session?.user as any)?.role;
      const isShopper = role === "shopper";

      // Filter notifications based on user role
      let filteredHistory = history.filter((n: NotificationItem) => {
        // Regular users (non-shoppers): ONLY show chat_message and partner notifications
        if (!isShopper) {
          return n.type === "chat_message" || n.type === "vehicle_booking" || n.type === "pet_adoption";
        }

        // Shoppers: show all notification types, but filter out already-assigned orders
        // If notification has an orderId, check if it's in assignedOrderIds
        if (n.orderId && assignedOrderIds.size > 0) {
          // For combined orders, check if any order in the group is assigned
          if (n.orderIds) {
            try {
              // Handle both string (JSON) and array formats
              const orderIdsArray =
                typeof n.orderIds === "string"
                  ? JSON.parse(n.orderIds)
                  : Array.isArray(n.orderIds)
                  ? n.orderIds
                  : [];
              const hasAssignedOrder = orderIdsArray.some((id: string) =>
                assignedOrderIds.has(String(id))
              );
              if (hasAssignedOrder) {
                return false; // Filter out - order is already assigned
              }
            } catch {
              // If parsing fails, check the main orderId
            }
          }
          // Check if the main orderId is assigned
          if (assignedOrderIds.has(String(n.orderId))) {
            return false; // Filter out - order is already assigned
          }
        }
        return true; // Keep notification
      });

      // Deduplicate order notifications: show at most one per order (avoid same reel/order twice)
      // Especially important for reel orders that must not re-notify after shopper declined
      if (isShopper) {
        const seenOrderKeys = new Set<string>();
        const deduped: NotificationItem[] = [];
        for (const n of filteredHistory) {
          if (n.type !== "new_order" && n.type !== "batch_orders") {
            deduped.push(n);
            continue;
          }
          const orderId = n.orderId != null ? String(n.orderId) : "";
          const orderType = n.orderType || "regular";
          const combinedId = n.combinedOrderId || "";
          const key = combinedId
            ? `combined:${combinedId}`
            : `${orderType}:${orderId}`;
          if (!key || !orderId) {
            deduped.push(n);
            continue;
          }
          if (seenOrderKeys.has(key)) continue; // skip duplicate for same order
          seenOrderKeys.add(key);
          deduped.push(n);
        }
        filteredHistory = deduped;
      }

      // Sort by timestamp (newest first)
      const sortedNotifications = filteredHistory.sort(
        (a: NotificationItem, b: NotificationItem) => b.timestamp - a.timestamp
      );
      setNotifications(sortedNotifications);
      setUnreadCount(
        sortedNotifications.filter((n: NotificationItem) => !n.read).length
      );
    } catch (error) {
      console.error(
        "❌ NotificationCenter: Error loading notification history:",
        error
      );
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));
    localStorage.setItem(
      "fcm_notification_history",
      JSON.stringify(updatedNotifications)
    );
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const clearAll = () => {
    // Clear all notifications
    localStorage.setItem("fcm_notification_history", JSON.stringify([]));
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string, isCombined?: boolean) => {
    const iconClass = `h-5 w-5 ${getNotificationColor(type, isCombined)}`;

    // Special icon for combined orders
    if (isCombined) {
      return (
        <svg
          className={iconClass}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      );
    }

    switch (type) {
      case "chat_message":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      case "vehicle_booking":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7h8M4 11h16a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2zm0 0V7a2 2 0 012-2h8a2 2 0 012 2v4M6 15a2 2 0 100 4 2 2 0 000-4zm12 0a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
        );
      case "pet_adoption":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "new_order":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        );
      case "batch_orders":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        );
      case "order_expired":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "test":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className={iconClass}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        );
    }
  };

  const getNotificationColor = (type: string, isCombined?: boolean) => {
    // Combined orders get special purple color
    if (isCombined) {
      return theme === "dark" ? "text-purple-400" : "text-purple-600";
    }

    switch (type) {
      case "chat_message":
        return theme === "dark" ? "text-blue-400" : "text-blue-600";
      case "vehicle_booking":
        return theme === "dark" ? "text-emerald-400" : "text-emerald-600";
      case "pet_adoption":
        return theme === "dark" ? "text-rose-400" : "text-rose-600";
      case "new_order":
        return theme === "dark" ? "text-green-400" : "text-green-600";
      case "batch_orders":
        return theme === "dark" ? "text-purple-400" : "text-purple-600";
      case "order_expired":
        return theme === "dark" ? "text-orange-400" : "text-orange-600";
      case "test":
        return theme === "dark" ? "text-gray-400" : "text-gray-600";
      case "warning":
        return theme === "dark" ? "text-yellow-400" : "text-yellow-600";
      default:
        return theme === "dark" ? "text-gray-400" : "text-gray-600";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300 active:scale-90 ${
          theme === "dark"
            ? "bg-gradient-to-br from-white/10 to-white/5 text-emerald-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-white/10 hover:from-white/15 hover:to-white/10"
            : "bg-gradient-to-br from-white to-gray-50 text-emerald-600 shadow-md ring-1 ring-black/5 hover:shadow-lg"
        }`}
        title="Notifications"
      >
        <svg
          className="h-5 w-5 drop-shadow-sm transition-transform group-hover:rotate-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-[10px] font-black text-white shadow-lg ring-2 ring-white duration-300 animate-in zoom-in dark:ring-[#0A0A0A]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown/Modal */}
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[10001] flex flex-col md:relative md:block">
            {/* Backdrop for mobile */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm duration-500 animate-in fade-in md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel - Cinematic Bottom Sheet on mobile */}
            <div
              ref={panelRef}
              className={`${
                isMobile
                  ? "fixed inset-x-0 bottom-0 top-[15%] z-50 flex flex-col overflow-hidden rounded-t-[2.5rem] duration-500 animate-in slide-in-from-bottom"
                  : "fixed right-[20px] top-[70px] z-50 w-[24rem] origin-top-right overflow-hidden rounded-3xl shadow-2xl duration-300 animate-in zoom-in-95"
              } ${
                theme === "dark"
                  ? "border border-white/10 bg-[#0A0A0A]/80 shadow-[0_30px_100px_-15px_rgba(0,0,0,1)] backdrop-blur-3xl"
                  : "border border-black/5 bg-white/80 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.15)] backdrop-blur-3xl"
              }`}
            >
              {/* Grab Handle for Mobile */}
              {isMobile && (
                <div className="flex justify-center p-3">
                  <div
                    className={`h-1 w-12 rounded-full ${
                      theme === "dark" ? "bg-white/10" : "bg-black/10"
                    }`}
                  ></div>
                </div>
              )}
              {/* Header */}
              <div
                className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-5 ${
                  theme === "dark"
                    ? "border-white/5 bg-[#0A0A0A]/40"
                    : "border-black/5 bg-white/40"
                } backdrop-blur-md`}
              >
                <div>
                  <h3
                    className={`text-lg font-black tracking-tight ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Notifications{" "}
                    {unreadCount > 0 && (
                      <span className="ml-1 font-bold text-emerald-500">
                        ({unreadCount})
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={markAllAsRead}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-90 ${
                          theme === "dark"
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        }`}
                        aria-label="Mark all as read"
                        title="Mark all as read"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 12l2 2 4-4" />
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                        </svg>
                      </button>
                      <button
                        onClick={clearAll}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-all active:scale-90 ${
                          theme === "dark"
                            ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        aria-label="Clear all notifications"
                        title="Clear all"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                        </svg>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className={`ml-2 inline-flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90 ${
                      theme === "dark"
                        ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900"
                    }`}
                    aria-label="Close notifications"
                    title="Close"
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div
                className={`overflow-y-auto ${
                  isMobile ? "max-h-[calc(100vh-12rem)] pb-24" : "max-h-96"
                }`}
              >
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <div
                      className={`mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border-2 border-dashed ${
                        theme === "dark"
                          ? "border-white/10 bg-white/[0.03]"
                          : "border-black/5 bg-gray-50"
                      }`}
                    >
                      <svg
                        className={`h-10 w-10 ${
                          theme === "dark" ? "text-white/20" : "text-gray-300"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <h4
                      className={`text-sm font-black tracking-tight ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      No notifications yet
                    </h4>
                    <p
                      className={`mt-2 max-w-[200px] text-[11px] leading-relaxed ${
                        theme === "dark" ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      We'll notify you when you have new messages or order
                      updates.
                    </p>

                    <div
                      className={`mt-8 rounded-2xl border px-4 py-2 ${
                        theme === "dark"
                          ? "border-white/5 bg-white/[0.02]"
                          : "border-black/5 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            hasPermission
                              ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <button
                          onClick={async () => {
                            if (!hasPermission) {
                              const granted = await requestNotificationPermission();
                              if (granted) {
                                window.location.reload();
                              } else {
                                toast.error(
                                  "Please enable notifications in your browser settings."
                                );
                              }
                            }
                          }}
                          className={`text-[10px] font-bold outline-none transition-colors ${
                            theme === "dark"
                              ? "text-gray-400 hover:text-white"
                              : "text-gray-600 hover:text-black"
                          } ${
                            !hasPermission
                              ? "cursor-pointer underline decoration-dashed underline-offset-4"
                              : "cursor-default"
                          }`}
                        >
                          FCM STATUS:{" "}
                          {hasPermission
                            ? isInitialized
                              ? "CONNECTED"
                              : "SYNCING..."
                            : "DISABLED - CLICK TO ENABLE"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  notifications.map((notification, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer border-b px-6 py-5 transition-all duration-300 ${
                        theme === "dark"
                          ? "border-white/5 hover:bg-white/[0.03]"
                          : "border-black/5 hover:bg-gray-50"
                      } ${
                        !notification.read
                          ? theme === "dark"
                            ? "bg-emerald-500/10"
                            : "bg-emerald-50/50"
                          : ""
                      }`}
                      onClick={() => {
                        // Mark as read when clicked
                        if (!notification.read) {
                          const updatedNotifications = [...notifications];
                          updatedNotifications[index].read = true;
                          const allHistory = JSON.parse(
                            localStorage.getItem("fcm_notification_history") ||
                              "[]"
                          );
                          const updatedHistory = allHistory.map(
                            (n: NotificationItem) =>
                              n.timestamp === notification.timestamp
                                ? { ...n, read: true }
                                : n
                          );
                          localStorage.setItem(
                            "fcm_notification_history",
                            JSON.stringify(updatedHistory)
                          );
                          loadNotifications();
                        }

                        // Navigate to relevant page
                        if (
                          notification.type === "chat_message" &&
                          notification.orderId
                        ) {
                          window.location.href = `/Messages/${notification.orderId}`;
                        } else if (
                          (notification.type === "new_order" ||
                            notification.type === "batch_orders") &&
                          notification.orderId
                        ) {
                          window.location.href = `/Plasa/active-batches`;
                        } else if (notification.type === "batch_orders") {
                          // Batch orders without specific orderId
                          window.location.href = `/Plasa/active-batches`;
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Tactical Icon Module */}
                        <div
                          className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 ${
                            theme === "dark"
                              ? "border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]"
                              : "border border-black/5 bg-white shadow-gray-200"
                          }`}
                        >
                          {getNotificationIcon(
                            notification.type,
                            notification.isCombinedOrder
                          )}
                          {!notification.read && (
                            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] ring-2 ring-[#0A0A0A] dark:ring-gray-900"></span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <h4
                              className={`truncate text-sm font-black tracking-tight ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <span
                              className={`whitespace-nowrap text-[10px] font-bold uppercase tracking-wider opacity-40 ${
                                theme === "dark"
                                  ? "text-white"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                          <p
                            className={`line-clamp-2 text-xs leading-relaxed ${
                              theme === "dark"
                                ? "text-gray-400"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.body}
                          </p>

                          {/* Combined Order Details */}
                          {notification.isCombinedOrder && (
                            <div
                              className={`mt-2 rounded-lg border p-2 ${
                                theme === "dark"
                                  ? "border-purple-800 bg-purple-900/20"
                                  : "border-purple-200 bg-purple-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p
                                    className={`text-[11px] font-medium ${
                                      theme === "dark"
                                        ? "text-purple-300"
                                        : "text-purple-900"
                                    }`}
                                  >
                                    Combined Order
                                  </p>
                                  {notification.storeNames && (
                                    <p
                                      className={`mt-0.5 text-[11px] ${
                                        theme === "dark"
                                          ? "text-purple-400"
                                          : "text-purple-700"
                                      }`}
                                    >
                                      {notification.storeNames}
                                    </p>
                                  )}
                                </div>
                                {notification.totalEarnings !== undefined && (
                                  <div className="text-right">
                                    <p
                                      className={`text-[11px] ${
                                        theme === "dark"
                                          ? "text-gray-400"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      Total Earnings
                                    </p>
                                    <p
                                      className={`text-base font-bold ${
                                        theme === "dark"
                                          ? "text-green-400"
                                          : "text-green-600"
                                      }`}
                                    >
                                      {currency}{" "}
                                      {notification.totalEarnings.toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Regular earnings display for single orders */}
                          {!notification.isCombinedOrder &&
                            notification.totalEarnings !== undefined && (
                              <div className="mt-2 flex items-center gap-2">
                                <span
                                  className={`text-[11px] ${
                                    theme === "dark"
                                      ? "text-gray-400"
                                      : "text-gray-600"
                                  }`}
                                >
                                  Earnings:
                                </span>
                                <span
                                  className={`text-xs font-semibold ${
                                    theme === "dark"
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                >
                                  {currency}{" "}
                                  {notification.totalEarnings.toLocaleString()}
                                </span>
                              </div>
                            )}

                          {notification.type === "chat_message" &&
                            notification.senderName && (
                              <p className="mt-1 text-xs text-gray-500">
                                From: {notification.senderName}
                              </p>
                            )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
