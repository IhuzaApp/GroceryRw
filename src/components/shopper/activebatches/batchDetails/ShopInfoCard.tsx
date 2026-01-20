"use client";

import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { OrderDetailsType } from "../../types/order";

interface ShopInfoCardProps {
  order: OrderDetailsType;
  uniqueShops: any[];
  onDirectionsClick: (address: string) => void;
}

export default function ShopInfoCard({ order, uniqueShops, onDirectionsClick }: ShopInfoCardProps) {
  return (
    <div className="rounded-none border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800 sm:rounded-xl sm:p-6">
      <div className="mb-3 flex items-center gap-2 sm:mb-4 sm:gap-3">
        <span
          className={`inline-block rounded-full p-1.5 sm:p-2 ${
            order.orderType === "reel"
              ? "bg-indigo-100"
              : "bg-emerald-100"
          }`}
        >
          {order.orderType === "reel" ? (
            <svg
              className="h-4 w-4 text-indigo-600 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 016 17.618V19a2 2 0 002 2h8a2 2 0 002-2v-1.382a2 2 0 00-.447-1.342L15 14z"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4 text-emerald-600 sm:h-5 sm:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"
              />
            </svg>
          )}
        </span>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
          {order.orderType === "reel"
            ? "Reel Details"
            : "Shop Details"}
        </h2>
      </div>

      {order.orderType === "reel" ? (
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="relative mx-auto h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:mx-0 sm:h-20 sm:w-20">
              {order.reel?.video_url ? (
                <video
                  src={order.reel.video_url}
                  className="h-full w-full object-cover"
                  muted
                  preload="metadata"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-300">
                  <svg
                    className="h-6 w-6 text-slate-400 sm:h-8 sm:w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M14.828 14.828a4 4 0 01-5.656 0" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="mb-1 text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                {order.reel?.title}
              </h3>
              <p className="mb-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                {order.reel?.description}
              </p>
              <div className="flex flex-wrap justify-center gap-2 text-sm sm:justify-start sm:gap-4 sm:text-base">
                <span className="text-slate-500">
                  Type: {order.reel?.type}
                </span>
                <span className="text-slate-500">
                  Qty: {order.quantity}
                </span>
                <span className="font-semibold text-indigo-600">
                  {formatCurrency(
                    parseFloat(order.reel?.Price || "0")
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Show Restaurant or Shop information based on what's available */}
          {(order.reel?.Restaurant || order.reel?.Shops) && (
            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-700">
              {order.reel?.Restaurant ? (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
                    {order.reel.Restaurant.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {order.reel.Restaurant.location}
                  </p>
                  {order.reel.Restaurant.phone && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      📞 {order.reel.Restaurant.phone}
                    </p>
                  )}
                </>
              ) : order.reel?.Shops ? (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 sm:text-base">
                    {order.reel.Shops.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {order.reel.Shops.address}
                  </p>
                  {order.reel.Shops.phone && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      📞 {order.reel.Shops.phone}
                    </p>
                  )}
                </>
              ) : null}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Shop Image, Name, Address, and Contact Information */}
          {uniqueShops.map((shop, index) => (
            <div
              key={shop.id || index}
              className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-600 sm:p-4"
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Shop Image */}
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200 sm:h-20 sm:w-20">
                  {shop.image ? (
                    <Image
                      src={shop.image}
                      alt={shop.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-300 text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-6 w-6 sm:h-8 sm:w-8"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                        />
                        <path d="M16 8h.01M8 16h.01M16 16h.01" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Shop Name and Address */}
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-lg">
                    {shop.name}
                    {uniqueShops.length > 1 && (
                      <span className="ml-2 text-xs font-normal text-slate-500">
                        (Store {index + 1})
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                    {shop.address}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 border-t border-slate-200 pt-3 text-sm dark:border-slate-600 sm:text-base">
                {/* Phone Number */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center text-slate-600 dark:text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Phone
                  </span>
                  {shop.phone ? (
                    <a
                      href={`tel:${shop.phone}`}
                      className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                    >
                      {shop.phone}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-500 dark:text-slate-400">
                      N/A
                    </span>
                  )}
                </div>

                {/* Operating Hours */}
                {shop.operating_hours && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-slate-600 dark:text-slate-400">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mr-2 h-4 w-4"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                      </svg>
                      Hours
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {(() => {
                        const hoursObj = shop.operating_hours;
                        if (
                          hoursObj &&
                          typeof hoursObj === "object"
                        ) {
                          const now = new Date();
                          const dayKey = now
                            .toLocaleDateString("en-US", {
                              weekday: "long",
                            })
                            .toLowerCase();
                          const todaysHours = (hoursObj as any)[
                            dayKey
                          ];
                          if (todaysHours) {
                            return todaysHours;
                          }
                        }
                        return "Check store for hours";
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Shop Directions Button */}
              {shop.address && (
                <div className="border-t border-slate-200 pt-3 dark:border-slate-600">
                  <button
                    onClick={() =>
                      onDirectionsClick(shop.address || "")
                    }
                    className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="mr-2 h-4 w-4"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Directions to Shop
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}