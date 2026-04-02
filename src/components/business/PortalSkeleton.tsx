"use client";

import React from "react";

const Skeleton = ({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
    {...props}
  />
);

export const PortalSkeleton = () => {
  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton - Hidden on mobile, matching page behavior */}
      <div className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl sm:p-2">
        <div className="flex space-x-2 overflow-x-auto pb-1 sm:pb-0">
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-24 flex-shrink-0 rounded-lg sm:h-12 sm:w-32 sm:rounded-xl"
            />
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="col-span-2 space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="mb-6 h-6 w-48" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
              <Skeleton className="mb-4 h-6 w-32" />
              <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
