"use client";

import React from "react";
import { Button } from "rsuite";
import { useTheme } from "../../../../context/ThemeContext";

// OrderDetailsType is used for type safety
interface OrderDetailsType {
  id: string;
  shop?: { id: string };
  combinedOrders?: any[];
  customerPhone?: string;
  customerId?: string;
  orderedBy?: { phone?: string; id?: string };
  status?: string;
  Invoice?: any[];
  invoice?: any;
}

interface BottomActionButtonProps {
  order: OrderDetailsType;
  activeShopId: string;
  uploadedProofs: Record<string, boolean>;
  getActionButton: (actionOrder: any) => React.ReactNode;
  onUpdateStatus: (status: string, orderId: string) => void;
  onCombinedDeliveryConfirmation?: (orders: any[]) => void;
  /** When provided (e.g. same-shop order tabs), use this for the active order instead of resolving by activeShopId */
  getActiveOrder?: () => any;
}

export default function BottomActionButton({
  order,
  activeShopId,
  uploadedProofs,
  getActionButton,
  onUpdateStatus,
  onCombinedDeliveryConfirmation,
  getActiveOrder,
}: BottomActionButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Check if we're in delivery phase and all orders for current customer are ready
  const allOrders = [order, ...(order?.combinedOrders || [])];
  const ordersByCustomer = new Map<string, any[]>();
  allOrders.forEach((o) => {
    if (!o) return;
    const customerPhone =
      (o as any).orderedBy?.phone || o.customerPhone || "unknown";
    const customerId = (o as any).orderedBy?.id || o.customerId || "unknown";
    const customerKey = `${customerId}_${customerPhone}`;

    if (!ordersByCustomer.has(customerKey))
      ordersByCustomer.set(customerKey, []);
    ordersByCustomer.get(customerKey)!.push(o);
  });

  // Find customer groups with multiple orders that are all ready for delivery
  const readyCustomerGroups = Array.from(ordersByCustomer.entries()).filter(
    ([customerKey, orders]) => {
      // Only consider groups with more than 1 order for unified delivery
      if (orders.length <= 1) return false;

      return orders.every((o) => {
        const hasInvoice =
          (o as any).Invoice?.length > 0 ||
          (o as any).invoice ||
          uploadedProofs[o.id];
        const isInDeliveryStatus =
          o.status === "on_the_way" || o.status === "at_customer";
        return hasInvoice && isInDeliveryStatus;
      });
    }
  );

  // Get the first ready customer group (if any)
  const readyCustomerGroup = readyCustomerGroups[0];

  // Default behavior - get action button for active order
  const actionOrder = getActiveOrder
    ? getActiveOrder()
    : activeShopId === order?.shop?.id
    ? order
    : order?.combinedOrders?.find((o) => o.shop?.id === activeShopId);

  const defaultButton = getActionButton(actionOrder);

  // If no action is needed, don't show the bar
  if (!defaultButton && !readyCustomerGroup) return null;

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-[9999] border-t px-5 pt-4 pb-8 transition-all duration-300 sm:hidden ${
        isDark ? "bg-[#0A0A0A]/80 border-white/10" : "bg-white/80 border-black/5"
      }`}
      style={{
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div className="mx-auto max-w-lg">
        {readyCustomerGroup ? (
          <button
            onClick={() => {
              if (onCombinedDeliveryConfirmation) {
                onCombinedDeliveryConfirmation(readyCustomerGroup[1]);
              } else {
                readyCustomerGroup[1].forEach((o: any) => {
                  onUpdateStatus("delivered", o.id);
                });
              }
            }}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_25px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-700 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Deliver {readyCustomerGroup[1].length} Orders
          </button>
        ) : (
          <div className="[&>button]:!w-full [&>button]:!rounded-2xl [&>button]:!py-4 [&>button]:!text-[11px] [&>button]:!font-black [&>button]:!uppercase [&>button]:!tracking-[0.2em] [&>button]:!bg-emerald-600 [&>button]:!shadow-[0_10px_25px_rgba(16,185,129,0.3)] [&>button]:!border-none [&>button]:!transition-all [&>button]:active:scale-95">
            {defaultButton}
          </div>
        )}
      </div>
    </div>
  );
}
