"use client";

import React from "react";
import Image from "next/image";
import { OrderDetailsType } from "../types";
import { useTheme } from "../../../../context/ThemeContext";

interface CustomerInfoCardProps {
  order: OrderDetailsType;
  uniqueCustomers: any[];
  onDirectionsClick: (address: string) => void;
  onChatClick: () => void;
}

export default function CustomerInfoCard({
  order,
  uniqueCustomers,
  onDirectionsClick,
  onChatClick,
}: CustomerInfoCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerClasses = `rounded-[1.25rem] border transition-all duration-500 overflow-hidden shadow-sm ${
    isDark ? "bg-[#0B0F1A] border-white/5" : "bg-white border-black/5"
  }`;

  const headerClasses = `flex items-center justify-between px-5 py-4 border-b ${
    isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-gray-50/50"
  }`;

  if (!uniqueCustomers || uniqueCustomers.length === 0) {
    return (
      <div className={containerClasses}>
        <div className={headerClasses}>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                isDark ? "bg-sky-500/10 text-sky-400" : "bg-sky-50 text-sky-600"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2
              className={`text-sm font-black uppercase tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Customer
            </h2>
          </div>
        </div>
        <div className="p-10 text-center">
          <p className="text-xs font-medium text-gray-400">
            No customer information found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              isDark ? "bg-sky-500/10 text-sky-400" : "bg-sky-50 text-sky-600"
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2
            className={`text-sm font-black uppercase tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Customer Details
          </h2>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {uniqueCustomers.map((customer, index) => (
          <div key={customer.id || index} className="space-y-5 p-5">
            <div className="flex items-start gap-4">
              {/* Customer Avatar */}
              <div
                className={`relative h-14 w-14 flex-shrink-0 rounded-full border-2 p-0.5 ${
                  isDark
                    ? "border-white/10 bg-white/5"
                    : "border-black/5 bg-gray-50"
                }`}
              >
                <Image
                  src={customer.profile_picture || "/images/userProfile.png"}
                  alt={customer.name || "Customer"}
                  width={60}
                  height={60}
                  className="h-full w-full rounded-full object-cover shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-emerald-500 dark:border-[#0B0F1A]" />
              </div>

              {/* Customer Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`truncate text-base font-black tracking-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {customer.name || "Customer"}
                  </h3>
                  {uniqueCustomers.length > 1 && (
                    <span className="flex-shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:bg-white/5">
                      Batch #{index + 1}
                    </span>
                  )}
                </div>

                {customer.phone && (
                  <p className="mt-0.5 text-xs font-bold text-sky-600 dark:text-sky-400">
                    {customer.phone}
                  </p>
                )}

                <div className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50/50 p-3 dark:bg-white/[0.02]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">
                      Delivery Address
                    </p>
                    <p
                      className={`mt-0.5 text-xs font-bold leading-relaxed ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {customer.address?.street || "No street"},{" "}
                      {customer.address?.city || "No city"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() =>
                  onDirectionsClick(
                    `${customer.address?.street || ""}, ${
                      customer.address?.city || ""
                    }`
                  )
                }
                className="group col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/5 py-3 transition-all hover:bg-emerald-500/10 active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-110">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Route
                </span>
              </button>

              <button
                onClick={() =>
                  customer.phone &&
                  (window.location.href = `tel:${customer.phone}`)
                }
                className="group col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-sky-500/10 bg-sky-500/5 py-3 transition-all hover:bg-sky-500/10 active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                  Call
                </span>
              </button>

              <button
                onClick={onChatClick}
                className="group col-span-1 flex flex-col items-center justify-center gap-2 rounded-xl border border-purple-500/10 bg-purple-500/5 py-3 transition-all hover:bg-purple-500/10 active:scale-95"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-indigo-600 text-white shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-110">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <path
                      d="M8 10.5H16M8 14.5H11M21.0039 12C21.0039 16.9706 16.9745 21 12.0039 21C9.9675 21 3.00463 21 3.00463 21C3.00463 21 4.56382 17.2561 3.93982 16.0008C3.34076 14.7956 3.00391 13.4372 3.00391 12C3.00391 7.02944 7.03334 3 12.0039 3C16.9745 3 21.0039 7.02944 21.0039 12Z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400">
                  Message
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
