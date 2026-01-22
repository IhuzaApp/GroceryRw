"use client";

import React from "react";
import { Button } from "rsuite";
import { OrderDetailsType } from "../../types/order";

interface BottomActionButtonProps {
  order: OrderDetailsType;
  activeShopId: string;
  uploadedProofs: Record<string, boolean>;
  getActionButton: (actionOrder: any) => React.ReactNode;
  onUpdateStatus: (status: string, orderId: string) => void;
}

export default function BottomActionButton({
  order,
  activeShopId,
  uploadedProofs,
  getActionButton,
  onUpdateStatus,
}: BottomActionButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] border-t border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:hidden">
      {(() => {
        // Check if we're in delivery phase and all orders for current customer are ready
        const allOrders = [order, ...(order?.combinedOrders || [])];
        const ordersByCustomer = new Map<string, any[]>();
        allOrders.forEach((o) => {
          const customerPhone =
            (o as any).orderedBy?.phone || o.customerPhone || "unknown";
          const customerId =
            (o as any).orderedBy?.id || o.customerId || "unknown";
          const customerKey = `${customerId}_${customerPhone}`;

          if (!ordersByCustomer.has(customerKey))
            ordersByCustomer.set(customerKey, []);
          ordersByCustomer.get(customerKey)!.push(o);
        });

        // Check if there are multiple customers - if so, show status info instead of action button
        const hasMultipleCustomers = ordersByCustomer.size > 1;
        if (hasMultipleCustomers) {
          return (
            <div className="flex items-center justify-center py-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Deliver to each customer individually</span>
              </div>
            </div>
          );
        }

        // Check if any customer group has all orders ready for delivery
        const readyCustomerGroup = Array.from(ordersByCustomer.entries()).find(
          ([customerKey, orders]) => {
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

        if (readyCustomerGroup) {
          // Show unified delivery confirmation button for all orders in this customer group
          const [customerKey, orders] = readyCustomerGroup;
          return (
            <Button
              appearance="primary"
              color="green"
              block
              onClick={() => {
                // Confirm delivery for all orders in this customer group
                orders.forEach((o) => {
                  onUpdateStatus("delivered", o.id);
                });
              }}
              className="rounded-lg py-4 text-xl font-bold"
            >
              Confirm Delivery for All Orders ({orders.length})
            </Button>
          );
        }

        // Default behavior - show action button for active order
        const actionOrder =
          activeShopId === order?.shop?.id
            ? order
            : order?.combinedOrders?.find((o) => o.shop?.id === activeShopId);

        return getActionButton(actionOrder);
      })()}
    </div>
  );
}
