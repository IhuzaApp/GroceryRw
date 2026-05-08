"use client";

import React from "react";
import Image from "next/image";
import { OrderDetailsType } from "../types";
import { isMobileDevice } from "../../../lib/formatters";

interface CustomerInfoProps {
  order: OrderDetailsType;
  currentLocation: { lat: number; lng: number } | null;
  theme: string;
  onDirectionsClick: (address: string) => void;
}

export default function CustomerInfo({
  order,
  currentLocation,
  theme,
  onDirectionsClick,
}: CustomerInfoProps) {
  const getDirectionsUrl = (
    destinationAddress: string,
    isMobile: boolean = false
  ) => {
    if (currentLocation) {
      if (isMobile) {
        // For mobile, try to open native map apps
        const encodedDestination = encodeURIComponent(destinationAddress);
        const origin = `${currentLocation.lat},${currentLocation.lng}`;

        // Try Apple Maps first (iOS), then Google Maps, then fallback to web
        if (
          navigator.userAgent.includes("iPhone") ||
          navigator.userAgent.includes("iPad")
        ) {
          return `http://maps.apple.com/?saddr=${origin}&daddr=${encodedDestination}`;
        } else {
          // For Android and other mobile devices, try Google Maps app
          return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${encodedDestination}`;
        }
      } else {
        // For desktop, use web version
        return `https://www.google.com/maps/dir/?api=1&origin=${
          currentLocation.lat
        },${currentLocation.lng}&destination=${encodeURIComponent(
          destinationAddress
        )}`;
      }
    }
    // Fallback to just the destination if no current location
    if (isMobile) {
      const encodedDestination = encodeURIComponent(destinationAddress);
      if (
        navigator.userAgent.includes("iPhone") ||
        navigator.userAgent.includes("iPad")
      ) {
        return `http://maps.apple.com/?q=${encodedDestination}`;
      } else {
        return `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`;
      }
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      destinationAddress
    )}`;
  };

  const handleDirectionsClick = (address: string) => {
    const isMobile = isMobileDevice();
    const directionsUrl = getDirectionsUrl(address, isMobile);

    if (isMobile) {
      // For mobile, try to open in app, fallback to web
      window.location.href = directionsUrl;
    } else {
      // For desktop, open in new tab
      window.open(directionsUrl, "_blank");
    }
  };

  const containerClasses = `rounded-[1.25rem] border transition-all duration-500 overflow-hidden shadow-sm ${
    theme === "dark" ? "bg-[#0B0F1A] border-white/5" : "bg-white border-black/5"
  }`;

  const headerClasses = `flex items-center justify-between px-5 py-4 border-b ${
    theme === "dark"
      ? "border-white/5 bg-white/[0.02]"
      : "border-black/5 bg-gray-50/50"
  }`;

  const uniqueCustomers: any[] = [];
  const seenCustomerIds = new Set();

  const getCustomer = (o: any) => {
    if (o.orderedBy) return { ...o.orderedBy, address: o.address };
    if (o.user) return { ...o.user, address: o.address };
    return null;
  };

  const addCustomer = (o: any) => {
    const c = getCustomer(o);
    if (c && c.id && !seenCustomerIds.has(c.id)) {
      uniqueCustomers.push(c);
      seenCustomerIds.add(c.id);
    }
  };

  addCustomer(order);
  order.combinedOrders?.forEach((o) => addCustomer(o));

  if (uniqueCustomers.length === 0) {
    const c = getCustomer(order);
    if (c) uniqueCustomers.push(c);
  }

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              theme === "dark"
                ? "bg-sky-500/10 text-sky-400"
                : "bg-sky-50 text-sky-600"
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
              theme === "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Customer
          </h2>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {uniqueCustomers.map((customer, index) => (
          <div key={customer.id || index} className="space-y-5 p-5">
            <div className="flex items-start gap-4">
              <div
                className={`relative h-14 w-14 flex-shrink-0 rounded-full border-2 p-0.5 ${
                  theme === "dark"
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

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3
                    className={`truncate text-base font-black tracking-tight ${
                      theme === "dark" ? "text-white" : "text-gray-900"
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
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {customer.address?.street || "No street"},{" "}
                      {customer.address?.city || "No city"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  handleDirectionsClick(
                    `${customer.address?.street || ""}, ${
                      customer.address?.city || ""
                    }`
                  )
                }
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
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
                Navigate
              </button>

              {customer.phone && (
                <button
                  onClick={() =>
                    (window.location.href = `tel:${customer.phone}`)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-110 active:scale-95"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-5 w-5"
                  >
                    <path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
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
