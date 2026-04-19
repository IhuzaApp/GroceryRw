"use client";

import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { OrderDetailsType } from "../../types";
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

  return (
    <div 
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isDark 
          ? "bg-white/5 border-white/10" 
          : "bg-black/2 border-black/5"
      }`}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"}`}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          order.orderType === "reel" 
            ? isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"
            : isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600"
        }`}>
          {order.orderType === "reel" ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A2 2 0 0020 6.382V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 016 17.618V19a2 2 0 002 2h8a2 2 0 002-2v-1.382a2 2 0 00-.447-1.342L15 14z" /></svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 7v4a1 1 0 001 1h3m10 0h3a1 1 0 001-1V7m-1-4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" /></svg>
          )}
        </div>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {order.orderType === "reel" ? "Reel Details" : "Shop Information"}
        </h2>
      </div>

      <div className="p-5">
        {order.orderType === "reel" ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"}`}>
                {order.reel?.video_url ? (
                  <video src={order.reel.video_url} className="h-full w-full object-cover" muted preload="metadata" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-400">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" /><path d="M14.828 14.828a4 4 0 01-5.656 0" /></svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{order.reel?.title}</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{order.reel?.description}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight uppercase ${isDark ? "bg-white/10 text-gray-300" : "bg-black/5 text-gray-600"}`}>
                    {order.reel?.type}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight uppercase ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                    QTY: {order.quantity}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight uppercase ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-700"}`}>
                    {formatCurrency(parseFloat(order.reel?.Price || "0"))}
                  </span>
                </div>
              </div>
            </div>

            {(order.reel?.Restaurant || order.reel?.Shops) && (
              <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
                {order.reel?.Restaurant ? (
                  <>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{order.reel.Restaurant.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.reel.Restaurant.location}</p>
                  </>
                ) : order.reel?.Shops ? (
                  <>
                    <p className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{order.reel.Shops.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.reel.Shops.address}</p>
                  </>
                ) : null}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {uniqueShops.map((shop, index) => (
              <div key={shop.id || index} className={`space-y-4 rounded-2xl border p-4 transition-all duration-300 ${isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"}`}>
                <div className="flex gap-4">
                  <div className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"}`}>
                    {shop.image ? (
                      <Image src={shop.image} alt={shop.name} width={80} height={80} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-400">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M16 8h.01M8 16h.01M16 16h.01" /></svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      {shop.name}
                      {uniqueShops.length > 1 && <span className="ml-2 text-[10px] font-bold text-gray-400 opacity-60">(STORE {index + 1})</span>}
                    </h3>
                    {shop.address && <p className="mt-1 text-xs text-gray-500 tracking-tight leading-relaxed">{shop.address}</p>}
                    {shop.category && (
                      <div className="mt-2 flex">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${isDark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-700"}`}>
                          {shop.category.name || "General"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${isDark ? "border-white/5" : "border-black/5"}`}>
                  {shop.phone && String(shop.phone).trim() && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">Phone</span>
                      <a href={`tel:${shop.phone}`} className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{shop.phone}</a>
                    </div>
                  )}
                  {shop.operating_hours && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 opacity-60">Today</span>
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-0.5 truncate">
                        {(() => {
                          const now = new Date();
                          const dayKey = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                          return (shop.operating_hours as any)[dayKey] || "Open";
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                {shop.address && (
                  <button
                    onClick={() => onDirectionsClick(shop.address || "")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    Navigate
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
