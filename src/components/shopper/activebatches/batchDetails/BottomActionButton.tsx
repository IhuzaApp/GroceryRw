"use client";

import React from "react";
import { Button } from "rsuite";
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
}

export default function BottomActionButton({
  order,
  activeShopId,
  uploadedProofs,
  getActionButton,
  onUpdateStatus,
  onCombinedDeliveryConfirmation,
}: BottomActionButtonProps) {
  // Check if we're in delivery phase and all orders for current customer are ready
  const allOrders = [order, ...(order?.combinedOrders || [])];
  const ordersByCustomer = new Map<string, any[]>();
  allOrders.forEach((o) => {
    if (!o) return;
    const customerPhone =
      (o as any).orderedBy?.phone || o.customerPhone || "unknown";
    const customerId =
      (o as any).orderedBy?.id || o.customerId || "unknown";
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
  const actionOrder =
    activeShopId === order?.shop?.id
      ? order
      : order?.combinedOrders?.find((o) => o.shop?.id === activeShopId);

  const defaultButton = getActionButton(actionOrder);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-gray-200 bg-white p-3 pb-safe shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:hidden">
        {readyCustomerGroup ? (
        // Show unified delivery confirmation button for all orders in this customer group
        <Button
          appearance="primary"
          color="green"
          block
          onClick={() => {
            // Use combined delivery confirmation if available, otherwise fallback to direct status update
            if (onCombinedDeliveryConfirmation) {
              onCombinedDeliveryConfirmation(readyCustomerGroup[1]);
            } else {
              // Fallback to direct status update
              readyCustomerGroup[1].forEach((o: any) => {
                onUpdateStatus("delivered", o.id);
              });
            }
          }}
          className="rounded-lg py-4 text-xl font-bold"
        >
          Confirm Delivery for {readyCustomerGroup[1].length} Orders
        </Button>
      ) : (
        defaultButton
      )}
    </div>
  );
}
