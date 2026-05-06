"use client";

import React from "react";
import { Button } from "rsuite";
import { OrderDetailsType } from "../types";
import { useTheme } from "../../../../context/ThemeContext";

interface HeaderSectionProps {
  order: OrderDetailsType;
  getStatusTag: (status: string) => React.ReactNode;
  onBack: () => void;
  onChatClick?: () => void;
}

export default function HeaderSection({
  order,
  getStatusTag,
  onBack,
  onChatClick,
}: HeaderSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`sticky top-0 z-[100] transition-all duration-300 sm:static ${
        isDark
          ? "border-white/10 bg-[#0A0A0A]/80"
          : "border-black/5 bg-white/80 shadow-sm"
      } border-b px-0 py-3 text-[var(--text-primary)] backdrop-blur-2xl sm:px-6 sm:py-4`}
    >
      <div className="mx-auto flex max-w-7xl flex-row items-center justify-between gap-3 px-4 sm:px-0">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
              isDark
                ? "border border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                : "border border-black/5 bg-black/5 text-gray-600 hover:bg-black/10 hover:text-gray-900"
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

          <div
            className={`h-6 w-px flex-shrink-0 ${
              isDark ? "bg-white/10" : "bg-black/10"
            }`}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`hidden text-[10px] font-bold uppercase tracking-wider sm:block ${
                  isDark ? "text-emerald-500/80" : "text-emerald-600/80"
                }`}
              >
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
              #
              {(order as any).orderIDs && (order as any).orderIDs.length > 1
                ? (order as any).orderIDs.join(" & ")
                : order.OrderID || order.id?.slice(0, 8) || "..."}
            </h1>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          {order.status === "shopping" && (
            <button
              onClick={onChatClick}
              className={`flex h-9 items-center gap-2 rounded-full px-4 transition-all active:scale-95 sm:h-10 ${
                isDark
                  ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:h-5 sm:w-5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-[10px] font-black uppercase tracking-widest sm:text-xs">
                Message
              </span>
            </button>
          )}
          <div className="scale-90 sm:scale-100">
            {getStatusTag(order.status)}
          </div>
        </div>
      </div>
    </div>
  );
}
