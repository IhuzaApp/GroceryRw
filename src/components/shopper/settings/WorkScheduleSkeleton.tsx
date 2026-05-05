"use client";

import React from "react";
import { useTheme } from "../../../context/ThemeContext";

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
      className={`animate-pulse rounded-xl ${className}`}
      style={{
        background: boneBackground,
        ...style,
      }}
      {...props}
    />
  );
};

export default function WorkScheduleSkeleton() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="p-0">
      <div className={`p-6 md:p-8 border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.01]'}`}>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="divide-y divide-transparent">
        {[...Array(7)].map((_, index) => (
          <div
            key={index}
            className={`px-6 md:px-8 py-5 md:py-6 ${
              index < 6
                ? `border-b ${
                    isDark ? "border-white/5" : "border-black/5"
                  }`
                : ""
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-xl" />
                <div>
                  <Skeleton className="h-5 w-24 md:h-6 mb-1" />
                  <Skeleton className="h-3 w-32 md:h-4" />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between sm:justify-end gap-4 md:gap-8">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex flex-col min-w-[80px] md:min-w-[128px]">
                    <Skeleton className="h-3 w-8 mb-1 ml-1" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col min-w-[80px] md:min-w-[128px]">
                    <Skeleton className="h-3 w-8 mb-1 ml-1" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                </div>
                <Skeleton className="h-8 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`p-6 md:p-8 mt-4 flex flex-col sm:flex-row gap-4 justify-between items-center ${isDark ? 'bg-white/[0.02]' : 'bg-black/[0.01]'}`}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-12 w-full sm:w-40 rounded-2xl" />
      </div>
    </div>
  );
}
