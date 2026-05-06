"use client";

import React from "react";
import Link from "next/link";
import { Avatar } from "rsuite";
import { formatCurrency } from "../../lib/formatCurrency";

interface ShopperChatSidebarProps {
  orderId: string;
  order: any;
  customerData: any;
  formatOrderID: (id: any) => string;
}

export const ShopperChatSidebar: React.FC<ShopperChatSidebarProps> = ({
  orderId,
  order,
  customerData,
  formatOrderID,
}) => {
  return (
    <div className="hidden w-80 flex-col border-l border-gray-100 bg-white dark:border-gray-800 dark:bg-black/20 xl:flex">
      <div className="p-6">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-30 mb-8">Order Summary</h2>

        {/* Status Card */}
        <div className="p-6 rounded-[2rem] bg-gray-50 dark:bg-white/5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Current Status</span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
          </div>
          <h3 className="text-xl font-black mb-1">
            #{order?.OrderID ? formatOrderID(order.OrderID) : formatOrderID(orderId)}
          </h3>
          <p className="text-xs opacity-50 font-bold">{formatCurrency(order?.Total_Amount || 0)} • {order?.Order_Items?.length || 0} items</p>
        </div>

        {/* Details Sections */}
        <div className="space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Customer Info</h4>
            <div className="flex items-center gap-4">
              <Avatar src={customerData?.avatar} circle size="md" className="ring-2 ring-emerald-500/10" />
              <div>
                <p className="text-sm font-black">{customerData?.name || "Customer"}</p>
                <p className="text-[10px] font-bold opacity-40">{customerData?.phone || "No phone provided"}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-4">Delivery To</h4>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs leading-relaxed font-medium opacity-60">{order?.delivery_address || "No address specified"}</p>
            </div>
          </div>

          <Link href={`/Plasa/active-batches/batch/${orderId}`}>
            <button className="w-full py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
              Manage Order
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
