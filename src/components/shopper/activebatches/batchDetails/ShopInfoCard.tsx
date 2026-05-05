"use client";

import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { OrderDetailsType } from "../types";
import { useTheme } from "../../../../context/ThemeContext";

interface ShopInfoCardProps {
  order: OrderDetailsType;
  uniqueShops: any[];
  onDirectionsClick: (address: string) => void;
}

export default function ShopInfoCard({
  order,
  uniqueShops,
  onDirectionsClick,
}: ShopInfoCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const containerClasses = `rounded-[1.25rem] border transition-all duration-500 overflow-hidden shadow-sm ${
    isDark ? "bg-[#0B0F1A] border-white/5" : "bg-white border-black/5"
  }`;

  const headerClasses = `flex items-center justify-between px-5 py-4 border-b ${
    isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-gray-50/50"
  }`;

  return (
    <div className={containerClasses}>
      <div className={headerClasses}>
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            order.orderType === "reel"
              ? isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600"
              : isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"
          }`}>
            {order.orderType === "reel" ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 016 17.618V19a2 2 0 002 2h8a2 2 0 002-2v-1.382a2 2 0 00-.447-1.342L15 14z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" />
              </svg>
            )}
          </div>
          <h2 className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {order.orderType === "reel" ? "Reel Details" : "Shop Information"}
          </h2>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {order.orderType === "reel" ? (
          <div className="p-5 space-y-5">
            <div className="flex items-start gap-4">
              <div className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 ${
                isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-gray-50"
              }`}>
                {order.reel?.video_url ? (
                  <video src={order.reel.video_url} className="h-full w-full object-cover" muted preload="metadata" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M14.828 14.828a4 4 0 01-5.656 0" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`truncate text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {order.reel?.title}
                </h3>
                <p className="mt-1 text-xs font-medium leading-relaxed opacity-60 text-gray-500 dark:text-gray-400">
                  {order.reel?.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                    isDark ? "bg-white/5 text-gray-400" : "bg-gray-100 text-gray-600"
                  }`}>
                    {order.reel?.type}
                  </span>
                  <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                    isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    QTY: {order.quantity}
                  </span>
                  <span className={`rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                    isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-700"
                  }`}>
                    {formatCurrency(parseFloat(order.reel?.Price || "0"))}
                  </span>
                </div>
              </div>
            </div>

            {(order.reel?.Restaurant || order.reel?.Shops) && (
              <div className={`rounded-xl border p-4 ${
                isDark ? "border-white/5 bg-white/[0.02]" : "border-black/5 bg-gray-50/50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {order.reel?.Restaurant?.name || order.reel?.Shops?.name}
                    </p>
                    <p className="text-[10px] font-medium text-gray-500 truncate">
                      {order.reel?.Restaurant?.location || order.reel?.Shops?.address}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {uniqueShops.map((shop, index) => (
              <div key={shop.id || index} className="p-5 space-y-5">
                <div className="flex items-start gap-4">
                  <div className={`relative h-14 w-14 flex-shrink-0 rounded-xl border-2 p-0.5 ${
                    isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-gray-50"
                  }`}>
                    {shop.image ? (
                      <Image src={shop.image} alt={shop.name} width={60} height={60} className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`truncate text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shop.name}
                      </h3>
                      {uniqueShops.length > 1 && (
                        <span className="flex-shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-gray-500 dark:bg-white/5">
                          Store #{index + 1}
                        </span>
                      )}
                    </div>
                    {shop.address && (
                      <p className="mt-1 text-xs font-medium text-gray-500 truncate">{shop.address}</p>
                    )}
                    {shop.category && (
                      <div className="mt-2 flex">
                        <span className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${
                          isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                        }`}>
                          {shop.category.name || "General"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {shop.phone && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">Phone</span>
                      <a href={`tel:${shop.phone}`} className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{shop.phone}</a>
                    </div>
                  )}
                  {shop.operating_hours && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">Status</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {(() => {
                          const dayKey = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                          return (shop.operating_hours as any)[dayKey] || "Open Now";
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {shop.address && (
                  <button
                    onClick={() => onDirectionsClick(shop.address || "")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Navigate to Store
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
