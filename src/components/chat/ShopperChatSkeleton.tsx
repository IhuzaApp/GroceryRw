"use client";

import React from "react";

interface ShopperChatSkeletonProps {
  isDark: boolean;
}

export const ShopperChatSkeleton: React.FC<ShopperChatSkeletonProps> = ({
  isDark,
}) => (
  <div
    className={`flex h-screen w-screen flex-col ${
      isDark ? "bg-[#0A0A0A]" : "bg-gray-50"
    }`}
  >
    <div
      className={`flex items-center gap-4 border-b px-6 py-4 ${
        isDark ? "border-white/10" : "border-black/5"
      }`}
    >
      <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
      </div>
    </div>
    <div className="flex-1 space-y-8 p-6">
      <div className="flex items-end gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-16 w-48 animate-pulse rounded-2xl rounded-bl-none bg-gray-100 dark:bg-gray-800" />
      </div>
      <div className="flex flex-row-reverse items-end gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-20 w-64 animate-pulse rounded-2xl rounded-br-none bg-emerald-500/10" />
      </div>
      <div className="flex items-end gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-12 w-40 animate-pulse rounded-2xl rounded-bl-none bg-gray-100 dark:bg-gray-800" />
      </div>
    </div>
    <div className="p-6">
      <div className="h-14 w-full animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
    </div>
  </div>
);
