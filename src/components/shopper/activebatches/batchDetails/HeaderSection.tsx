"use client";

import React from "react";
import { Button } from "rsuite";
import { OrderDetailsType } from "../../types";
import { useTheme } from "../../../../context/ThemeContext";

interface HeaderSectionProps {
  order: OrderDetailsType;
  getStatusTag: (status: string) => React.ReactNode;
  onBack: () => void;
}

export default function HeaderSection({
  order,
  getStatusTag,
  onBack,
}: HeaderSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`sticky top-0 sm:static z-[100] transition-all duration-300 ${
        isDark 
          ? "bg-[#0A0A0A]/80 border-white/10" 
          : "bg-white/80 border-black/5 shadow-sm"
      } border-b backdrop-blur-2xl px-0 py-3 text-[var(--text-primary)] sm:px-6 sm:py-4`}
    >
      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between gap-3 px-4 sm:px-0">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
              isDark 
                ? "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5" 
                : "bg-black/5 hover:bg-black/10 text-gray-600 hover:text-gray-900 border border-black/5"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="h-5 w-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className={`h-6 w-px flex-shrink-0 ${isDark ? "bg-white/10" : "bg-black/10"}`} />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`hidden text-[10px] font-bold uppercase tracking-wider sm:block ${isDark ? "text-emerald-500/80" : "text-emerald-600/80"}`}>
                {order.orderType === "reel"
                  ? "Reel Batch"
                  : order.orderType === "restaurant"
                  ? "Restaurant Batch"
                  : order.orderType === "business"
                  ? "Business Batch"
                  : "Regular Batch"}
              </span>
            </div>
            <h1 className="mt-0.5 truncate text-lg font-black tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              #{ (order as any).orderIDs && (order as any).orderIDs.length > 1
                ? (order as any).orderIDs.join(" & ")
                : order.OrderID || order.id.slice(0, 8) }
            </h1>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center">
          <div className="scale-90 sm:scale-100">
            {getStatusTag(order.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
