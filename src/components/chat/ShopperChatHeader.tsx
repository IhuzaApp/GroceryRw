"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar } from "rsuite";

interface ShopperChatHeaderProps {
  orderId: string;
  displayOrderId?: string;
  customerData: {
    name: string;
    avatar: string;
  } | null;
  isMobile: boolean;
}

export const ShopperChatHeader: React.FC<ShopperChatHeaderProps> = ({
  orderId,
  displayOrderId,
  customerData,
  isMobile,
}) => {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between border-b border-gray-100 bg-white/50 p-4 backdrop-blur-md dark:border-white/5 dark:bg-black/50">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/Plasa/chat")}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 transition-all active:scale-90 dark:bg-white/5"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          <Avatar
            src={customerData?.avatar}
            circle
            size={isMobile ? "sm" : "md"}
            className="ring-2 ring-emerald-500/20"
          />
          <div>
            <h2 className="text-sm font-black tracking-tight md:text-base">
              {displayOrderId ? `#${displayOrderId}` : `Order #${orderId.slice(0, 4)}`}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                {customerData?.name || "Customer"}
              </p>
              <span className="h-1 w-1 rounded-full bg-emerald-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                Active
              </p>
            </div>
          </div>
        </div>
      </div>

      <Link href={`/Plasa/active-batches/batch/${orderId}`}>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/5 transition-transform active:scale-90 dark:bg-white/5"
          title="Order Details"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </Link>
    </div>
  );
};
