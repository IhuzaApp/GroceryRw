"use client";

import React from "react";
import Image from "next/image";
import { OrderDetailsType } from "../../types/order";

interface CustomerInfoCardProps {
  order: OrderDetailsType;
  uniqueCustomers: any[];
  onDirectionsClick: (address: string) => void;
  onChatClick: () => void;
  theme: string;
}

export default function CustomerInfoCard({
  order,
  uniqueCustomers,
  onDirectionsClick,
  onChatClick,
  theme,
}: CustomerInfoCardProps) {
  if (!uniqueCustomers || uniqueCustomers.length === 0) {
    return (
      <div className="rounded-none border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
        <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
          <span className="inline-block rounded-full bg-sky-100 p-1.5 sm:p-2">
            <svg
              className="h-4 w-4 text-sky-600 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </span>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
            Customer
          </h2>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-400">
          No customer information available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-none border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <span className="inline-block rounded-full bg-sky-100 p-1.5 sm:p-2">
          <svg
            className="h-4 w-4 text-sky-600 sm:h-5 sm:w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
          Customer
        </h2>
      </div>

      {uniqueCustomers.map((customer, index) => (
        <div
          key={customer.id || index}
          className="mb-4 space-y-3 rounded-lg border border-slate-200 p-3 last:mb-0 dark:border-slate-600 sm:p-4"
        >
          <div className="flex gap-3 sm:gap-4">
            {/* Customer Avatar */}
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-slate-200 sm:h-20 sm:w-20">
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
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {customer.name || "Unknown Customer"}
                {uniqueCustomers.length > 1 && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    (Customer {index + 1})
                  </span>
                )}
              </h3>
              {customer.phone && (
                <p className="mt-1 flex items-center text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mr-1.5 h-3.5 w-3.5"
                  >
                    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {customer.phone}
                </p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-600 sm:text-base">
            <div className="flex items-start gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-600 dark:text-slate-400"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Delivery Address
                </p>
                <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {customer.address?.street || "No street"},{" "}
                  {customer.address?.city || "No city"}
                  {customer.address?.postal_code
                    ? `, ${customer.address.postal_code}`
                    : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 border-t border-slate-200 pt-3 dark:border-slate-600 sm:justify-start">
            {/* Directions Button */}
            <button
              onClick={() =>
                onDirectionsClick(
                  `${customer.address?.street || "No street"}, ${
                    customer.address?.city || "No city"
                  }${
                    customer.address?.postal_code
                      ? `, ${customer.address.postal_code}`
                      : ""
                  }`
                )
              }
              title="Directions to Customer"
              className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                theme === "dark"
                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </button>

            {/* Call Button */}
            {customer.phone && (
              <button
                onClick={() => (window.location.href = `tel:${customer.phone}`)}
                title="Call Customer"
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </button>
            )}

            {/* Message Button */}
            {order.status !== "delivered" && (
              <button
                onClick={onChatClick}
                title="Message Customer"
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  theme === "dark"
                    ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
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
  );
}
