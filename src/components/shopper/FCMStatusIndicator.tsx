"use client";

import React from "react";
import { useFCMNotifications } from "../../hooks/useFCMNotifications";

export default function FCMStatusIndicator() {
  const { isInitialized, hasPermission } = useFCMNotifications();

  if (process.env.NODE_ENV !== "development") {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`rounded-lg border px-3 py-2 text-xs font-medium shadow-lg ${
          isInitialized && hasPermission
            ? "border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900 dark:text-green-100"
            : "border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-900 dark:text-orange-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isInitialized && hasPermission
                ? "animate-pulse bg-green-500"
                : "bg-orange-500"
            }`}
          />
          <span>
            {isInitialized && hasPermission
              ? "🔔 FCM Active"
              : "⚠️ FCM Inactive"}
          </span>
        </div>
        {!isInitialized && (
          <div className="mt-1 text-[10px]">
            Check console for FCM initialization logs
          </div>
        )}
      </div>
    </div>
  );
}
