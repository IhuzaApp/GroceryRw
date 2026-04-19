"use client";

import React from "react";
import Image from "next/image";
import { OrderDetailsType } from "../../types";
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

  const containerClasses = `rounded-2xl border transition-all duration-300 overflow-hidden ${
    isDark ? "bg-white/5 border-white/10" : "bg-black/2 border-black/5"
  }`;

  const headerClasses = `flex items-center gap-3 px-5 py-3.5 border-b ${
    isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"
  }`;

  if (!uniqueCustomers || uniqueCustomers.length === 0) {
    return (
      <div
        className={containerClasses}
        style={{
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className={headerClasses}>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-xl ${
              isDark ? "bg-sky-500/20 text-sky-400" : "bg-sky-100 text-sky-600"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Customer
          </h2>
        </div>
        <div className="p-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400 opacity-50">
          No customer information available
        </div>
      </div>
    );
  }

  return (
    <div
      className={containerClasses}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className={headerClasses}>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${
            isDark ? "bg-sky-500/20 text-sky-400" : "bg-sky-100 text-sky-600"
          }`}
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          Customer Details
        </h2>
      </div>

      <div className="space-y-4 p-5">
        {uniqueCustomers.map((customer, index) => (
          <div
            key={customer.id || index}
            className={`space-y-4 rounded-2xl border p-4 transition-all duration-300 ${
              isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"
            }`}
          >
            <div className="flex gap-4">
              {/* Customer Avatar */}
              <div
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 ${
                  isDark
                    ? "border-white/10 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                    : "border-black/5 bg-black/5"
                }`}
              >
                <Image
                  src={customer.profile_picture || "/images/userProfile.png"}
                  alt={customer.name || "Customer"}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Customer Name and Contact */}
              <div className="flex-1">
                <h3 className="text-base font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  {customer.name || "Unknown Customer"}
                  {uniqueCustomers.length > 1 && (
                    <span className="ml-2 text-[10px] font-bold text-gray-400 opacity-60">
                      (CUSTOMER {index + 1})
                    </span>
                  )}
                </h3>
                {customer.phone && (
                  <p className="mt-1 flex items-center text-xs font-bold text-sky-600 dark:text-sky-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="mr-1.5 h-3.5 w-3.5"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {customer.phone}
                  </p>
                )}

                <div
                  className={`mt-3 flex items-start gap-2 border-t pt-3 ${
                    isDark ? "border-white/5" : "border-black/5"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">
                      Delivery Address
                    </p>
                    <p className="mt-0.5 text-xs font-bold leading-relaxed tracking-tight text-gray-700 dark:text-gray-300">
                      {customer.address?.street || "No street"},{" "}
                      {customer.address?.city || "No city"}
                      {customer.address?.postal_code
                        ? `, ${customer.address.postal_code}`
                        : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div
              className={`flex items-center gap-3 border-t pt-3 ${
                isDark ? "border-white/5" : "border-black/5"
              }`}
            >
              {/* Navigate Button */}
              <button
                onClick={() =>
                  onDirectionsClick(
                    `${customer.address?.street || ""}, ${
                      customer.address?.city || ""
                    }`
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:bg-emerald-700 active:scale-[0.98]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Navigate
              </button>

              {/* Call Button */}
              {customer.phone && (
                <button
                  onClick={() =>
                    (window.location.href = `tel:${customer.phone}`)
                  }
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
                    isDark
                      ? "border border-white/10 bg-white/5 text-sky-400 hover:bg-white/10"
                      : "border border-sky-100 bg-sky-50 text-sky-600 hover:bg-sky-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </button>
              )}

              {/* Chat Button */}
              {order.status !== "delivered" && (
                <button
                  onClick={onChatClick}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95 ${
                    isDark
                      ? "border border-white/10 bg-white/5 text-purple-400 hover:bg-white/10"
                      : "border border-purple-100 bg-purple-50 text-purple-600 hover:bg-purple-100"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
