"use client";

import React from "react";
import { OrderItem } from "../../types/order";
import OrderItemCard from "../OrderItemCard";

interface OrderItemsSectionProps {
  order: any;
  activeTab: string;
  activeShopId: string;
  onSetActiveShopId: (shopId: string) => void;
  onToggleItemFound: (item: OrderItem, found: boolean) => void;
  onShowProductImage: (item: OrderItem) => void;
  itemsLoading: boolean;
}

export default function OrderItemsSection({
  order,
  activeTab,
  activeShopId,
  onSetActiveShopId,
  onToggleItemFound,
  onShowProductImage,
  itemsLoading,
}: OrderItemsSectionProps) {
  // Group items by shopId (do this early before any conditional returns)
  const itemsByShop = new Map<string, any[]>();

  if (order && order.Order_Items) {
    order.Order_Items.forEach((item: any) => {
      const shopId = (item as any).shopId || order.shop?.id || "unknown";
      if (!itemsByShop.has(shopId)) {
        itemsByShop.set(shopId, []);
      }
      itemsByShop.get(shopId)?.push(item);
    });
  }

  const allGroups = Array.from(itemsByShop.entries());
  const groups = allGroups.filter(([shopId]) => {
    const shopOrders = [order, ...(order.combinedOrders || [])].filter(
      (o) => (o.shop?.id || o.shop_id) === shopId
    );
    // Hide shop tab if all its orders are on_the_way or finished
    return shopOrders.some(
      (o) => o.status === "accepted" || o.status === "shopping"
    );
  });

  // Auto-set activeShopId to the only visible shop if there's only one
  React.useEffect(() => {
    if (groups.length === 1 && activeShopId !== groups[0][0]) {
      onSetActiveShopId(groups[0][0]);
    }
  }, [groups, activeShopId, onSetActiveShopId]);

  if (itemsLoading) {
    return (
      <div>
        <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
          <div className="skeleton h-5 w-24 sm:h-6 sm:w-28" />
        </div>
        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30 sm:p-6">
          <div className="skeleton h-4 w-48" />
          <div className="space-y-2 sm:space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 sm:gap-4 sm:p-4"
              >
                <div className="skeleton h-12 w-12 flex-shrink-0 rounded-lg sm:h-14 sm:w-14" />
                <div className="min-w-0 flex-1">
                  <div className="skeleton mb-1 h-5 w-3/4 sm:h-6" />
                  <div className="skeleton mb-1 h-4 w-1/2 sm:h-5" />
                  <div className="skeleton h-4 w-20 sm:h-5" />
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="skeleton h-8 w-8 rounded sm:h-9 sm:w-9" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (order?.orderType === "reel") {
    return (
      <div className={`${activeTab === "items" ? "block" : "hidden sm:block"}`}>
        <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
            Reel Details
          </h2>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-600 dark:bg-slate-800 sm:p-4">
          <div className="mb-1 font-semibold text-slate-900 dark:text-slate-100">
            {order.reel?.Product}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Quantity: {order.quantity} pcs
          </div>
        </div>
      </div>
    );
  }

  // Combined order shops rendering logic
  const isSplit = groups.length > 1;

  // Use current activeShopId if it's still in the visible groups, otherwise default to first available
  const isCurrentlyActiveVisible = groups.some(([sid]) => sid === activeShopId);
  const effectiveActiveShopId = isCurrentlyActiveVisible
    ? activeShopId
    : groups.length > 0
    ? groups[0][0]
    : null;

  // Helper to get shop name
  const getShopName = (sid: string) => {
    if (sid === order.shop?.id) return order.shop?.name;
    const sub = order.combinedOrders?.find((o: any) => o.shop?.id === sid);
    if (sub) return sub.shop?.name;
    return "Unknown Shop";
  };

  if (isSplit) {
    return (
      <div className={`${activeTab === "items" ? "block" : "hidden sm:block"}`}>
        <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
            Order Items
          </h2>
        </div>

        {/* Shop Tabs Navigation */}
        <div className="scrollbar-hide mb-4 flex flex-nowrap gap-2 overflow-x-auto pb-2">
          {groups.map(([shopId], idx) => (
            <button
              key={shopId}
              onClick={() => onSetActiveShopId(shopId)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                effectiveActiveShopId === shopId
                  ? "border-green-600 bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/30"
                  : "border-slate-200 bg-white text-slate-600 hover:border-green-400 hover:text-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                  effectiveActiveShopId === shopId
                    ? "bg-white/20"
                    : "bg-slate-100 dark:bg-slate-700"
                }`}
              >
                {idx + 1}
              </span>
              {getShopName(shopId)}
            </button>
          ))}
        </div>

        {/* Active Shop Items */}
        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {getShopName(effectiveActiveShopId || "")} •{" "}
            {itemsByShop.get(effectiveActiveShopId || "")?.length || 0} Items
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {itemsByShop.get(effectiveActiveShopId || "")?.map((item) => {
              // In combined orders, show Mark Found button if ANY order in the batch is shopping
              const allOrders = [order, ...(order.combinedOrders || [])];
              const isBatchShopping = allOrders.some(
                (o) => o.status === "shopping"
              );

              return (
                <div key={item.id}>
                  <OrderItemCard
                    item={item}
                    isBatchShopping={isBatchShopping}
                    onToggleFound={onToggleItemFound}
                    onShowProductImage={onShowProductImage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  } else {
    // Even in non-split mode, show only the active shop's items
    const activeShopItems = itemsByShop.get(effectiveActiveShopId || "") || [];
    return (
      <div className={`${activeTab === "items" ? "block" : "hidden sm:block"}`}>
        <div className="mb-3 flex items-center gap-2 px-3 sm:mb-4 sm:gap-3 sm:px-0">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">
            Order Items
          </h2>
        </div>
        <div className="space-y-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30 sm:p-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {getShopName(effectiveActiveShopId || "")} •{" "}
            {activeShopItems.length} Items
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {activeShopItems.map((item) => {
              // In combined orders, show Mark Found button if ANY order in the batch is shopping
              const allOrders = [order, ...(order.combinedOrders || [])];
              const isBatchShopping = allOrders.some(
                (o) => o.status === "shopping"
              );

              return (
                <div key={item.id}>
                  <OrderItemCard
                    item={item}
                    isBatchShopping={isBatchShopping}
                    onToggleFound={onToggleItemFound}
                    onShowProductImage={onShowProductImage}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
