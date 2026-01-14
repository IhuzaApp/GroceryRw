"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

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
  conversationId?: string;
  senderName?: string;
}

export default function NotificationCenter() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();

    // Refresh notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = () => {
    try {
      const history = JSON.parse(
        localStorage.getItem("fcm_notification_history") || "[]"
      );
      // Show ALL FCM notifications (no filtering)
      // Sort by timestamp (newest first)
      const sortedNotifications = history.sort(
        (a: NotificationItem, b: NotificationItem) => b.timestamp - a.timestamp
      );
      setNotifications(sortedNotifications);
      setUnreadCount(
        sortedNotifications.filter((n: NotificationItem) => !n.read).length
      );
    } catch (error) {
      console.error("Error loading notification history:", error);
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

  const getNotificationIcon = (type: string) => {
    const iconClass = `h-5 w-5 ${getNotificationColor(type)}`;
    
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

  const getNotificationColor = (type: string) => {
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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel - Full screen on mobile, dropdown on desktop */}
          <div
            className={`${
              isMobile
                ? "fixed inset-x-0 bottom-0 top-16 z-50 rounded-t-2xl"
                : "absolute right-0 top-12 z-50 w-96 rounded-lg shadow-2xl"
            } ${
              theme === "dark"
                ? "border border-gray-700 bg-gray-800"
                : "border border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b p-4 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold">
                  Notifications {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  All FCM push notifications
                </p>
              </div>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-500 hover:text-blue-600"
                    >
                      Mark all read
                    </button>
                    <button
                      onClick={clearAll}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Clear all
                    </button>
                  </>
                )}
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
                  <p className="mt-2">No notifications yet</p>
                  <p className="text-xs">
                    FCM push notifications will appear here
                  </p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer border-b p-4 transition-colors ${
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
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.timestamp)}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-sm ${
                            theme === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {notification.body}
                        </p>
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
