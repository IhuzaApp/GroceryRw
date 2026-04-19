"use client";

import React from "react";
import { useTheme } from "../../../context/ThemeContext";

/**
 * Skeleton loaders for the Batch Details page components.
 * These components provide loading placeholders that match the actual UI structure
 * and improve perceived performance during data fetching.
 */

// Base skeleton component
const Skeleton = ({
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const boneBackground = isDark
    ? "rgba(255, 255, 255, 0.05)"
    : "rgba(0, 0, 0, 0.05)";

  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{
        background: boneBackground,
        ...style,
      }}
      {...props}
    />
  );
};

// Main content header skeleton
export const HeaderSkeleton = () => (
  <div className="px-0 py-2 text-gray-900 dark:text-gray-100 sm:p-6">
    <div className="flex flex-row items-center justify-between gap-2 px-3 sm:gap-4 sm:px-0">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        {/* Back button */}
        <Skeleton className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10" />
        {/* Divider */}
        <div className="h-5 w-px flex-shrink-0 bg-black/5 dark:bg-white/10 sm:h-6" />
        {/* Title */}
        <div className="min-w-0 flex-1">
          <Skeleton className="h-6 w-48 sm:h-8 sm:w-64" />
          <Skeleton className="mt-1 h-4 w-32 sm:h-5 sm:w-40" />
        </div>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
        {/* Status tag */}
        <Skeleton className="h-6 w-16 rounded-full sm:h-7 sm:w-20" />
      </div>
    </div>
  </div>
);

// Order progress steps skeleton (desktop only)
export const ProgressStepsSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="hidden rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5 sm:block sm:p-6"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <Skeleton className="h-6 w-6 rounded-full sm:h-8 sm:w-8" />
        <Skeleton className="h-6 w-32 sm:h-7 sm:w-40" />
      </div>
      <div className="rounded-lg border border-black/5 bg-black/5 p-4 dark:border-white/5 dark:bg-white/5 sm:p-6">
        <div className="flex items-center justify-between">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <Skeleton className="mb-2 h-8 w-8 rounded-full" />
              <Skeleton className="mb-1 h-4 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mobile tabs skeleton (mobile only)
export const MobileTabsSkeleton = () => (
  <div className="border-b border-black/5 dark:border-white/5 sm:hidden">
    <div className="flex">
      <button className="flex-1 px-4 py-3 text-sm font-medium">
        <Skeleton className="mx-auto h-5 w-12" />
      </button>
      <button className="flex-1 px-4 py-3 text-sm font-medium">
        <Skeleton className="mx-auto h-5 w-20" />
      </button>
    </div>
  </div>
);

// Shop/Reel info card skeleton
export const ShopInfoCardSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="rounded-none border border-black/5 bg-black/5 p-3 dark:border-white/5 dark:bg-white/5 sm:rounded-xl sm:p-6"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <Skeleton className="h-6 w-6 rounded-full sm:h-8 sm:w-8" />
        <Skeleton className="h-6 w-32 sm:h-7 sm:w-36" />
      </div>

      {/* For reel orders */}
      <div className="mb-4 flex gap-3 sm:gap-4">
        <Skeleton className="h-14 w-14 flex-shrink-0 rounded-lg sm:h-20 sm:w-20" />
        <div className="flex-1">
          <Skeleton className="mb-1 h-5 w-3/4 sm:h-6" />
          <Skeleton className="mb-2 h-4 w-full sm:h-5" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
      </div>

      {/* Restaurant/Shop info */}
      <div className="rounded-lg border border-black/5 bg-black/5 p-3 dark:border-white/5 dark:bg-white/5">
        <Skeleton className="mb-1 h-4 w-24" />
        <Skeleton className="mb-1 h-3 w-32" />
        <Skeleton className="h-3 w-28" />
      </div>

      {/* Contact info */}
      <div className="mt-3 space-y-2 border-t border-black/5 pt-3 dark:border-white/5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
};

// Customer info card skeleton
export const CustomerInfoCardSkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="rounded-none border border-black/5 bg-black/5 p-3 dark:border-white/5 dark:bg-white/5 sm:rounded-xl sm:p-6"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <Skeleton className="h-6 w-6 rounded-full sm:h-8 sm:w-8" />
        <Skeleton className="h-6 w-24 sm:h-7 sm:w-28" />
      </div>

      <div className="mb-4 space-y-3 rounded-lg border border-black/5 p-3 dark:border-white/5 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          <Skeleton className="h-16 w-16 flex-shrink-0 rounded-full sm:h-20 sm:w-20" />
          <div className="flex-1">
            <Skeleton className="mb-1 h-5 w-32 sm:h-6" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Delivery address */}
        <div className="mt-3 space-y-2 border-t border-black/5 pt-3 dark:border-white/5">
          <div className="flex items-start gap-2">
            <Skeleton className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-3 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex items-center justify-center gap-3 border-t border-black/5 pt-3 dark:border-white/5">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-12 w-12 rounded-full" />
        </div>
      </div>
    </div>
  );
};

// Order items section skeleton
export const OrderItemsSkeleton = ({
  itemCount = 4,
}: {
  itemCount?: number;
}) => (
  <div>
    <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
      <Skeleton className="h-5 w-24 sm:h-6 sm:w-28" />
    </div>

    {/* Shop tabs for split orders */}
    <div className="mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-2">
      {[...Array(2)].map((_, i) => (
        <Skeleton
          key={i}
          className="flex flex-shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2"
        >
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </Skeleton>
      ))}
    </div>

    {/* Items container */}
    <div className="space-y-4 rounded-2xl bg-black/5 p-4 dark:bg-white/5 sm:p-6">
      <Skeleton className="h-4 w-48" />
      <div className="space-y-2 sm:space-y-3">
        {[...Array(itemCount)].map((_, i) => (
          <OrderItemSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const OrderItemSkeleton = () => (
  <div className="flex items-center gap-3 rounded-lg border border-black/5 bg-black/5 p-3 dark:border-white/5 dark:bg-white/5 sm:gap-4 sm:p-4">
    <Skeleton className="h-12 w-12 flex-shrink-0 rounded-lg sm:h-14 sm:w-14" />
    <div className="min-w-0 flex-1">
      <Skeleton className="mb-1 h-5 w-3/4 sm:h-6" />
      <Skeleton className="mb-1 h-4 w-1/2 sm:h-5" />
      <Skeleton className="h-4 w-20 sm:h-5" />
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <Skeleton className="h-8 w-8 rounded sm:h-9 sm:w-9" />
    </div>
  </div>
);

// Order summary skeleton
export const OrderSummarySkeleton = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div
      className="overflow-hidden border border-black/5 bg-white/40 dark:border-white/5 dark:bg-white/5 sm:rounded-2xl"
      style={{
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4 dark:from-green-900/20 dark:to-emerald-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="mb-1 h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* Shopping status details */}
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        {/* Price breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex justify-between text-sm">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="my-3 border-t border-black/10 dark:border-white/10" />
          <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Delivery notes skeleton
export const DeliveryNotesSkeleton = () => (
  <div className="mt-3">
    <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
      <Skeleton className="h-5 w-28 sm:h-6 sm:w-32" />
    </div>
    <div className="mx-3 rounded-md border border-amber-500/10 bg-amber-500/5 p-3 dark:border-amber-400/10 dark:bg-amber-400/5 sm:mx-0 sm:p-4">
      <div className="flex gap-2">
        <Skeleton className="mt-0.5 h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Complete batch details page skeleton loader.
 * Shows loading placeholders for the entire batch details page during initial load.
 * Use this when no order data is available yet.
 */
export const BatchDetailsSkeleton = () => (
  <div className="mx-auto w-full px-0 py-2 pb-20 sm:p-6 sm:pb-6">
    <div className="overflow-hidden rounded-none">
      {/* Header section with back button, title, and status */}
      <HeaderSkeleton />

      {/* Main content area */}
      <div className="space-y-3 px-0 pb-3 pt-1 sm:space-y-8 sm:p-8">
        {/* Order Progress Steps - Hidden on Mobile */}
        <ProgressStepsSkeleton />

        {/* Mobile Tabs - Only visible on mobile */}
        <MobileTabsSkeleton />

        {/* Main Info Grid - Shop and Customer info */}
        <div className="grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-2">
          <ShopInfoCardSkeleton />
          <CustomerInfoCardSkeleton />
        </div>

        {/* Order Items section */}
        <OrderItemsSkeleton itemCount={4} />

        {/* Order Summary with pricing */}
        <OrderSummarySkeleton />

        {/* Delivery Notes - shown when present */}
        <DeliveryNotesSkeleton />
      </div>
    </div>
  </div>
);

/**
 * Alternative skeleton for partial loading states.
 * Use when basic order info is loaded but detailed sections are still loading.
 * Shows targeted loading for items and summary while keeping other sections visible.
 */
export const OrderDetailsLoadingSkeleton = () => (
  <div className="space-y-3 px-0 pb-3 pt-1 sm:space-y-8 sm:p-8">
    {/* Progress and navigation remain visible */}
    <ProgressStepsSkeleton />
    <MobileTabsSkeleton />

    {/* Info cards stay loaded */}
    <div className="grid grid-cols-1 gap-3 sm:gap-8 lg:grid-cols-2">
      <ShopInfoCardSkeleton />
      <CustomerInfoCardSkeleton />
    </div>

    {/* Items and summary still loading */}
    <OrderItemsSkeleton itemCount={3} />
    <OrderSummarySkeleton />
  </div>
);
