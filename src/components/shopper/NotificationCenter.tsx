"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

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
        localStorage.getItem('fcm_notification_history') || '[]'
      );
      // Filter to only show chat messages and order notifications
      const relevantNotifications = history.filter(
        (n: NotificationItem) => 
          n.type === 'chat_message' || 
          n.type === 'new_order' || 
          n.type === 'batch_orders'
      );
      setNotifications(relevantNotifications);
      setUnreadCount(relevantNotifications.filter((n: NotificationItem) => !n.read).length);
    } catch (error) {
      console.error("Error loading notification history:", error);
    }
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(
      'fcm_notification_history',
      JSON.stringify(updatedNotifications)
    );
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const clearAll = () => {
    // Only clear chat and order notifications, keep other types
    const allHistory = JSON.parse(
      localStorage.getItem('fcm_notification_history') || '[]'
    );
    const otherNotifications = allHistory.filter(
      (n: NotificationItem) => 
        n.type !== 'chat_message' && 
        n.type !== 'new_order' && 
        n.type !== 'batch_orders'
    );
    localStorage.setItem(
      'fcm_notification_history',
      JSON.stringify(otherNotifications)
    );
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat_message':
        return '💬';
      case 'new_order':
        return '📦';
      case 'batch_orders':
        return '📋';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'chat_message':
        return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
      case 'new_order':
        return theme === 'dark' ? 'text-green-400' : 'text-green-600';
      case 'batch_orders':
        return theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
      default:
        return theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
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
            ? "hover:bg-gray-700 text-gray-300"
            : "hover:bg-gray-100 text-gray-600"
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
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Panel */}
          <div
            className={`absolute right-0 top-12 z-50 w-96 rounded-lg shadow-2xl ${
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
                  Messages & Orders {unreadCount > 0 && `(${unreadCount})`}
                </h3>
                <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  Chat messages and order notifications
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
            <div className="max-h-96 overflow-y-auto">
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
                  <p className="mt-2">No messages or orders yet</p>
                  <p className="text-xs">Chat messages and new orders will appear here</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`border-b p-4 transition-colors cursor-pointer ${
                      theme === "dark"
                        ? "border-gray-700 hover:bg-gray-700"
                        : "border-gray-100 hover:bg-gray-50"
                    } ${!notification.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                    onClick={() => {
                      // Mark as read when clicked
                      if (!notification.read) {
                        const updatedNotifications = [...notifications];
                        updatedNotifications[index].read = true;
                        const allHistory = JSON.parse(
                          localStorage.getItem('fcm_notification_history') || '[]'
                        );
                        const updatedHistory = allHistory.map((n: NotificationItem) =>
                          n.timestamp === notification.timestamp ? { ...n, read: true } : n
                        );
                        localStorage.setItem(
                          'fcm_notification_history',
                          JSON.stringify(updatedHistory)
                        );
                        loadNotifications();
                      }
                      
                      // Navigate to relevant page
                      if (notification.type === 'chat_message' && notification.orderId) {
                        window.location.href = `/Messages/${notification.orderId}`;
                      } else if (notification.type === 'new_order' && notification.orderId) {
                        window.location.href = `/Plasa/active-batches`;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            !notification.read ? "bg-blue-500 animate-pulse" : "bg-gray-400"
                          }`}
                        />
                        <span className={`text-2xl ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </span>
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
                        {notification.type === 'chat_message' && notification.senderName && (
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
