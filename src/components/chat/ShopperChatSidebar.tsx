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
        <h2 className="mb-8 text-sm font-black uppercase tracking-[0.2em] opacity-30">
          Order Summary
        </h2>

        {/* Status Card */}
        <div className="mb-8 rounded-[2rem] bg-gray-50 p-6 dark:bg-white/5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Current Status
            </span>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Active
            </span>
          </div>
          <h3 className="mb-1 text-xl font-black">
            #
            {order?.OrderID
              ? formatOrderID(order.OrderID)
              : formatOrderID(orderId)}
          </h3>
          <p className="text-xs font-bold opacity-50">
            {formatCurrency(order?.Total_Amount || 0)} •{" "}
            {order?.Order_Items?.length || 0} items
          </p>
        </div>

        {/* Details Sections */}
        <div className="space-y-8">
          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
              Customer Info
            </h4>
            <div className="flex items-center gap-4">
              <Avatar
                src={customerData?.avatar}
                circle
                size="md"
                className="ring-2 ring-emerald-500/10"
              />
              <div>
                <p className="text-sm font-black">
                  {customerData?.name || "Customer"}
                </p>
                <p className="text-[10px] font-bold opacity-40">
                  {customerData?.phone || "No phone provided"}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
              Delivery To
            </h4>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/5 dark:bg-white/5">
                <svg
                  className="h-4 w-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-60">
                {order?.delivery_address || "No address specified"}
              </p>
            </div>
          </div>

          <Link href={`/Plasa/active-batches/batch/${orderId}`}>
            <button className="w-full rounded-2xl bg-black py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black">
              Manage Order
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};
