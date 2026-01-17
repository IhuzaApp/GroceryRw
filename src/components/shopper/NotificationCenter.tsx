"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";

// Check if mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
}

export default function NotificationCenter() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currency, setCurrency] = useState<string>("UGX");
  const lastLoadedCountRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Ensure FCM is initialized anywhere the notification bell exists
  // (singleton guarded in fcmClient to prevent duplicate listeners)
  const { isInitialized, hasPermission } = useFCMNotifications();

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    const onHistoryUpdated = () => loadNotifications();
    window.addEventListener("fcm-history-updated", onHistoryUpdated as EventListener);
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
  }, []);

  // Load currency from system configuration
  useEffect(() => {
    let cancelled = false;
    const loadCurrency = async () => {
      try {
        const resp = await fetch("/api/queries/system-configuration");
        if (!resp.ok) return;
        const data = await resp.json();
        const configCurrency = data?.config?.currency;
        if (!cancelled && typeof configCurrency === "string" && configCurrency.trim()) {
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
  }, [isOpen]);

  const loadNotifications = () => {
    try {
      const history = JSON.parse(
        localStorage.getItem("fcm_notification_history") || "[]"
      );
      if (process.env.NODE_ENV === "development") {
        // Avoid spamming the console every refresh; only log when the count changes
        if (lastLoadedCountRef.current !== history.length) {
          console.log(
            "📋 NotificationCenter: Loading notifications from localStorage",
            {
              count: history.length,
            }
          );
          lastLoadedCountRef.current = history.length;
        }
      }
      // Show ALL FCM notifications (no filtering)
      // Sort by timestamp (newest first)
      const sortedNotifications = history.sort(
        (a: NotificationItem, b: NotificationItem) => b.timestamp - a.timestamp
      );
      setNotifications(sortedNotifications);
      setUnreadCount(
        sortedNotifications.filter((n: NotificationItem) => !n.read).length
      );
      if (process.env.NODE_ENV === "development") {
        // Only log when count changes (handled above); keep this silent to reduce noise
      }
    } catch (error) {
      console.error("❌ NotificationCenter: Error loading notification history:", error);
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
        className={`relative rounded-lg p-2 transition-colors ${
          theme === "dark"
            ? "text-gray-300 hover:bg-gray-700"
            : "text-gray-600 hover:bg-gray-100"
        }`}
        title="Notifications"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown/Modal */}
      {isOpen && (
        <>
          {/* Dropdown Panel - Full screen on mobile, dropdown on desktop */}
          <div
            ref={panelRef}
            className={`${
              isMobile
                ? "fixed inset-x-0 bottom-0 top-16 z-50 overflow-hidden rounded-t-3xl"
                : "absolute right-0 top-12 z-50 w-[24rem] overflow-hidden rounded-2xl"
            } ${
              theme === "dark"
                ? "border border-white/10 bg-gray-900/90 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-xl"
                : "border border-black/10 bg-white/90 shadow-2xl shadow-black/10 ring-1 ring-black/5 backdrop-blur-xl"
            } transition-all`}
          >
            {/* Header */}
            <div
              className={`sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 ${
                theme === "dark"
                  ? "border-white/10 bg-gray-900/80"
                  : "border-black/10 bg-white/80"
              } backdrop-blur-xl`}
            >
              <div>
                <h3 className="text-base font-semibold">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <p
                  className={`text-[11px] ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  All FCM push notifications
                </p>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        theme === "dark"
                          ? "text-blue-300 hover:bg-white/10 hover:text-blue-200"
                          : "text-blue-600 hover:bg-black/5 hover:text-blue-700"
                      }`}
                      aria-label="Mark all as read"
                      title="Mark all as read"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 12l2 2 4-4" />
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      </svg>
                    </button>
                    <button
                      onClick={clearAll}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        theme === "dark"
                          ? "text-red-300 hover:bg-white/10 hover:text-red-200"
                          : "text-red-600 hover:bg-black/5 hover:text-red-700"
                      }`}
                      aria-label="Clear all notifications"
                      title="Clear all"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
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
                  className={`ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                    theme === "dark"
                      ? "text-gray-300 hover:bg-white/10"
                      : "text-gray-600 hover:bg-black/5"
                  }`}
                  aria-label="Close notifications"
                  title="Close"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18" />
                    <path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div
              className={`overflow-y-auto ${
                isMobile ? "max-h-[calc(100vh-12rem)]" : "max-h-96"
              }`}
            >
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <p className="mt-2 text-sm">No notifications yet</p>
                  <p className="text-[11px]">
                    FCM push notifications will appear here
                  </p>
                  <div className="mt-3 text-[11px]">
                    <p
                      className={
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }
                    >
                      FCM status:{" "}
                      <span className="font-semibold">
                        {hasPermission
                          ? isInitialized
                            ? "Connected"
                            : "Connecting…"
                          : "No permission / unsupported"}
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-b px-4 py-3 transition-colors ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-100 hover:bg-gray-50"
                    } ${
                      !notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""
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
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            !notification.read
                              ? "animate-pulse bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        />
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type, notification.isCombinedOrder)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium">
                              {notification.title}
                            </h4>
                            {(notification.type === "new_order" &&
                              (notification.displayOrderId ||
                                notification.OrderID)) && (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  theme === "dark"
                                    ? "bg-emerald-900/40 text-emerald-200"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                                title="Order ID"
                              >
                                #{notification.displayOrderId ??
                                  notification.OrderID}
                              </span>
                            )}
                            {notification.isCombinedOrder && (
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  theme === "dark"
                                    ? "bg-purple-900/50 text-purple-300"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                🛒 {notification.orderCount} Stores
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-xs ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
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
        </>
      )}
    </div>
  );
}
