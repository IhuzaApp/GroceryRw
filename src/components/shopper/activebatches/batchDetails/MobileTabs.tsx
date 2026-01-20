"use client";

import React from "react";
import { OrderDetailsType } from "../types";

interface MobileTabsProps {
  order: OrderDetailsType;
  activeTab: "items" | "details";
  onTabChange: (tab: "items" | "details") => void;
}

export default function MobileTabs({ order, activeTab, onTabChange }: MobileTabsProps) {
  const shouldShowOrderDetails = () => {
    if (!order) return false;

    // In a combined batch, we should show details if ANY order is still being shopped or accepted
    const allOrders = [order, ...(order.combinedOrders || [])];
    const showStatuses = ["accepted", "shopping", "paid"];

    return allOrders.some((o) => showStatuses.includes(o.status));
  };

  if (!shouldShowOrderDetails()) {
    return null;
  }

  return (
    <div className="border-b border-slate-200 dark:border-slate-700 sm:hidden">
      <div className="flex">
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "items"
              ? "border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500"
              : "text-slate-500 dark:text-slate-400"
          }`}
          onClick={() => onTabChange("items")}
        >
          Items
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "details"
              ? "border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500"
              : "text-slate-500 dark:text-slate-400"
          }`}
          onClick={() => onTabChange("details")}
        >
          Other Details
        </button>
      </div>
    </div>
  );
}