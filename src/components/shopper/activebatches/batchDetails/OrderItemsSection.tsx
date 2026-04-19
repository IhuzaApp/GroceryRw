"use client";

import React from "react";
import Image from "next/image";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { resolveImageUrl } from "../../../../lib/imageUrl";
import { OrderItem } from "../../types";
import OrderItemCard from "../OrderItemCard";
import { useTheme } from "../../../../context/ThemeContext";

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
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Check if we have same-shop combined orders (multiple orders from same shop)
  const hasCombinedOrders =
    order?.combinedOrders && order.combinedOrders.length > 0;
  const mainShopId = order?.shop?.id;
  const sameShopCombinedOrders = hasCombinedOrders
    ? order.combinedOrders.filter((co: any) => co.shop?.id === mainShopId)
    : [];
  const hasSameShopCombinedOrders = sameShopCombinedOrders.length > 0;

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

  // Helper to get customer ID from an order
  const getCustomerId = (o: any) => {
    return (
      o.orderedBy?.id || o.user_id || o.customer?.id || o.customerId || null
    );
  };

  const mainCustomerId = getCustomerId(order);
  const sameCustomerSameShopOrders = hasSameShopCombinedOrders
    ? [
        order,
        ...sameShopCombinedOrders.filter((co: any) => {
          const coCustomerId = getCustomerId(co);
          return coCustomerId && coCustomerId === mainCustomerId;
        }),
      ]
    : [order];
  const hasSameCustomerSameShopCombinedOrders =
    sameCustomerSameShopOrders.length > 1;

  // Active groups for same-shop combined orders
  const orderGroups = hasSameShopCombinedOrders
    ? [
        {
          orderId: order.OrderID || order.id,
          order: order,
          items: order.Order_Items || [],
          customerName: order.orderedBy?.name || order.user?.name || "Customer",
          customerId: mainCustomerId,
          isVisible: order.status === "accepted" || order.status === "shopping",
        },
        ...sameShopCombinedOrders.map((co: any) => ({
          orderId: co.OrderID || co.id,
          order: co,
          items: co.Order_Items || [],
          customerName: co.orderedBy?.name || co.user?.name || "Customer",
          customerId: getCustomerId(co),
          isVisible: co.status === "accepted" || co.status === "shopping",
        })),
      ].filter((group) => group.isVisible)
    : [];

  const allGroups = Array.from(itemsByShop.entries());
  const groups = allGroups.filter(([shopId]) => {
    const shopOrders = [order, ...(order.combinedOrders || [])].filter(
      (o) => (o.shop?.id || o.shop_id) === shopId
    );
    return shopOrders.some((o) => o.status === "accepted" || o.status === "shopping");
  });

  const isSplit = groups.length > 1;
  const isSameShopCustomerSplit = hasSameShopCombinedOrders && orderGroups.length > 1;

  const effectiveActiveOrderId = orderGroups.some(g => g.orderId == activeShopId) 
    ? activeShopId 
    : (orderGroups.length > 0 ? orderGroups[0].orderId : null);

  const effectiveActiveShopId = groups.some(([sid]) => sid === activeShopId)
    ? activeShopId
    : (groups.length > 0 ? groups[0][0] : null);

  React.useEffect(() => {
    if (isSameShopCustomerSplit) {
      if (orderGroups.length > 0 && !orderGroups.some(g => g.orderId == activeShopId)) {
        onSetActiveShopId(orderGroups[0].orderId);
      }
    } else if (groups.length === 1 && activeShopId !== groups[0][0]) {
      onSetActiveShopId(groups[0][0]);
    }
  }, [groups, orderGroups, activeShopId, onSetActiveShopId, isSameShopCustomerSplit]);

  if (itemsLoading) {
    return (
      <div className="space-y-4">
        <div className={`h-6 w-32 rounded-lg ${isDark ? "bg-white/10" : "bg-black/5"} animate-pulse`} />
        <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? "bg-white/5 border-white/5" : "bg-black/2 border-black/5"}`}>
           {[...Array(3)].map((_, i) => (
             <div key={i} className={`h-20 w-full rounded-2xl ${isDark ? "bg-white/5" : "bg-black/5 animate-pulse"}`} />
           ))}
        </div>
      </div>
    );
  }

  // Common Header helper
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="mb-4 flex items-center gap-3 px-1">
      <div className={`h-8 w-1.5 rounded-full ${isDark ? "bg-emerald-500" : "bg-emerald-600"}`} />
      <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white sm:text-lg">
        {title}
      </h2>
    </div>
  );

  const ContentContainer = ({ children, subtitle }: { children: React.ReactNode, subtitle: string }) => (
    <div 
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isDark ? "bg-white/5 border-white/10" : "bg-black/2 border-black/5"
      }`}
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className={`px-6 py-3.5 border-b ${isDark ? "border-white/5 bg-white/5" : "border-black/5 bg-black/5"}`}>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        {children}
      </div>
    </div>
  );

  if (order?.orderType === "reel") {
    return (
      <div className={activeTab === "items" ? "block" : "hidden sm:block"}>
        <SectionHeader title="Reel Details" />
        <ContentContainer subtitle={`${order.quantity} ITEMS`}>
           <div className={`p-4 rounded-xl border ${isDark ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5 shadow-sm"}`}>
              <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{order.reel?.Product}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Quantity: {order.quantity} PCS</p>
           </div>
        </ContentContainer>
      </div>
    );
  }

  if (order?.orderType === "business") {
    const storeName = order.shop?.name ?? "Business Store";
    const items = order.Order_Items ?? [];
    return (
      <div className={activeTab === "items" ? "block" : "hidden sm:block"}>
        <SectionHeader title="Order Items" />
        <ContentContainer subtitle={`${storeName} • ${items.length} ${items.length === 1 ? "ITEM" : "ITEMS"}`}>
           {items.map((item: any) => {
              const name = item.name ?? item.product?.ProductName?.name ?? "Item";
              return (
                <OrderItemCard 
                  key={item.id}
                  item={item}
                  isBatchShopping={false}
                  onToggleFound={onToggleItemFound}
                  onShowProductImage={onShowProductImage}
                  isBusinessOrder={true}
                />
              );
           })}
        </ContentContainer>
      </div>
    );
  }

  if (order?.orderType === "restaurant") {
    const restaurantName = order.shop?.name ?? order.Restaurant?.name ?? "Restaurant";
    const items = order.restaurant_order_items ?? [];
    return (
      <div className={activeTab === "items" ? "block" : "hidden sm:block"}>
        <SectionHeader title="Order Items" />
        <ContentContainer subtitle={`${restaurantName} • ${items.length} ${items.length === 1 ? "ITEM" : "ITEMS"}`}>
           {items.map((row: any) => {
             const dish = row.restaurant_dishes;
             const name = dish?.ProductNames?.name ?? dish?.dishes?.name ?? "Dish";
             return (
               <div key={row.id} className={`flex items-center gap-4 p-4 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-black/5 border-black/5"}`}>
                  <div className="flex-1">
                    <p className="font-black text-xs uppercase tracking-tight text-gray-900 dark:text-white">{name}</p>
                    <p className="mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                       {row.quantity} × {formatCurrency(Number(row.price || 0))}
                    </p>
                  </div>
                  <div className="text-sm font-black text-gray-900 dark:text-white">
                    {formatCurrency(Number(row.price || 0) * row.quantity)}
                  </div>
               </div>
             );
           })}
        </ContentContainer>
      </div>
    );
  }

  // Shop navigation tabs for split orders
  const ShopTabs = () => (
    <div className="scrollbar-hide mb-6 flex flex-nowrap gap-3 overflow-x-auto pb-2 px-1">
      {groups.map(([shopId], idx) => {
        const isActive = effectiveActiveShopId === shopId;
        const shopName = shopId === order.shop?.id ? order.shop?.name : (order.combinedOrders?.find((o: any) => o.shop?.id === shopId)?.shop?.name || "Other Shop");
        
        return (
          <button
            key={shopId}
            onClick={() => onSetActiveShopId(shopId)}
            className={`flex flex-shrink-0 items-center gap-3 rounded-2xl border-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              isActive
                ? "border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-105"
                : isDark 
                  ? "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300" 
                  : "border-black/5 bg-black/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] ${isActive ? "bg-white/20" : "bg-black/5 dark:bg-white/5"}`}>
              {idx + 1}
            </span>
            {shopName}
          </button>
        );
      })}
    </div>
  );

  const CustomerTabs = () => (
    <div className="scrollbar-hide mb-6 flex flex-nowrap gap-3 overflow-x-auto pb-2 px-1">
      {orderGroups.map((group, idx) => {
        const isActive = effectiveActiveOrderId == group.orderId;
        return (
          <button
            key={group.orderId}
            onClick={() => onSetActiveShopId(group.orderId)}
            className={`flex flex-shrink-0 items-center gap-3 rounded-2xl border-2 px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              isActive
                ? "border-emerald-500 bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 scale-105"
                : isDark 
                  ? "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300" 
                  : "border-black/5 bg-black/5 text-gray-400 hover:border-emerald-500 hover:text-emerald-600"
            }`}
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-lg text-[10px] ${isActive ? "bg-white/20" : "bg-black/5 dark:bg-white/5"}`}>
              {idx + 1}
            </span>
            <div className="flex flex-col items-start leading-none">
              <span>{group.customerName}</span>
              <span className={`text-[9px] mt-0.5 opacity-60 font-bold ${isActive ? "text-white" : "text-gray-500"}`}>#{group.orderId}</span>
            </div>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className={activeTab === "items" ? "block" : "hidden sm:block"}>
      <SectionHeader title="Order Items" />
      
      {isSplit && <ShopTabs />}
      {isSameShopCustomerSplit && <CustomerTabs />}

      {isSameShopCustomerSplit ? (
        (() => {
          const activeGroup = orderGroups.find(g => g.orderId == effectiveActiveOrderId);
          if (!activeGroup) return null;
          return (
            <ContentContainer subtitle={`${activeGroup.customerName} • ORDER #${activeGroup.orderId} • ${activeGroup.items.length} ITEMS`}>
              {activeGroup.items.map((item: any) => (
                <OrderItemCard 
                  key={item.id}
                  item={item}
                  isBatchShopping={activeGroup.order.status === "shopping"}
                  onToggleFound={onToggleItemFound}
                  onShowProductImage={onShowProductImage}
                />
              ))}
            </ContentContainer>
          );
        })()
      ) : (
        <ContentContainer subtitle={`${effectiveActiveShopId === order.shop?.id ? order.shop?.name : "SHOP"} • ${itemsByShop.get(effectiveActiveShopId || "")?.length || 0} ITEMS`}>
           {itemsByShop.get(effectiveActiveShopId || "")?.map((item) => {
              const shopOrders = [order, ...(order.combinedOrders || [])].filter(o => (o.shop?.id || o.shop_id) === effectiveActiveShopId);
              const isBatchShopping = shopOrders.some(o => o.status === "shopping");
              return (
                <OrderItemCard 
                  key={item.id}
                  item={item}
                  isBatchShopping={isBatchShopping}
                  onToggleFound={onToggleItemFound}
                  onShowProductImage={onShowProductImage}
                />
              );
           })}
        </ContentContainer>
      )}
    </div>
  );
}
