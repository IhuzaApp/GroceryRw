import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface BatchCardSkeletonProps {
  count?: number;
}

export function BatchCardSkeleton({ count = 6 }: BatchCardSkeletonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  /* Glass surface style to match real mobile card */
  const cardStyle = {
    background: isDark ? "rgba(23,23,23,0.88)" : "rgba(255,255,255,0.92)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
    boxShadow: isDark
      ? "0 8px 32px rgba(0,0,0,0.4)"
      : "0 4px 24px rgba(0,0,0,0.07)",
  };

  const skeletonColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const divider = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl"
          style={cardStyle}
        >
          {/* Top accent strip skeleton */}
          <div className="h-1 w-full animate-pulse" style={{ background: skeletonColor }} />

          <div className="p-4">
            {/* Header row skeleton */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Avatar skeleton */}
                <div className="h-11 w-11 animate-pulse rounded-xl" style={{ background: skeletonColor }} />
                <div>
                  <div className="h-4 w-24 animate-pulse rounded" style={{ background: skeletonColor }} />
                  <div className="mt-2 h-3 w-16 animate-pulse rounded" style={{ background: skeletonColor }} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <div className="h-5 w-12 animate-pulse rounded-lg" style={{ background: skeletonColor }} />
                <div className="h-4 w-20 animate-pulse rounded-full" style={{ background: skeletonColor }} />
              </div>
            </div>

            {/* Divider */}
            <div className="mb-3" style={{ height: 1, background: divider }} />

            {/* Info grid skeleton */}
            <div className="mb-3 grid grid-cols-2 gap-3">
              <div className="h-16 animate-pulse rounded-xl" style={{ background: skeletonColor }} />
              <div className="h-16 animate-pulse rounded-xl" style={{ background: skeletonColor }} />
            </div>

            {/* Address row skeleton */}
            <div className="mb-3 h-12 animate-pulse rounded-xl" style={{ background: skeletonColor }} />

            {/* Divider */}
            <div className="mb-3" style={{ height: 1, background: divider }} />

            {/* Footer skeleton */}
            <div className="flex items-center justify-between gap-3">
              <div className="h-7 w-24 animate-pulse rounded-full" style={{ background: skeletonColor }} />
              <div className="h-9 w-32 animate-pulse rounded-xl" style={{ background: skeletonColor }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
