"use client";

import React from "react";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { OrderDetailsType } from "../../types/order";

interface OrderSummarySectionProps {
  order: OrderDetailsType;
  isSummaryExpanded: boolean;
  onToggleSummary: () => void;
  getActiveOrder: any;
  getActiveOrderItems: any[];
  calculateFoundItemsTotal: () => number;
  calculateOriginalSubtotal: () => number;
  calculateBatchTotal: () => number;
}

export default function OrderSummarySection({
  order,
  isSummaryExpanded,
  onToggleSummary,
  getActiveOrder,
  getActiveOrderItems,
  calculateFoundItemsTotal,
  calculateOriginalSubtotal,
  calculateBatchTotal,
}: OrderSummarySectionProps) {
  return (
    <div
      className={`overflow-hidden border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 sm:rounded-2xl ${
        order.status === "shopping"
          ? "fixed bottom-[4.5rem] left-0 right-0 z-[9998] rounded-t-3xl border-x-0 border-b-0 shadow-[0_-4px_20px_rgba(0,0,0,0.15)] sm:relative sm:bottom-auto sm:z-auto sm:rounded-2xl sm:border sm:shadow-lg"
          : "rounded-t-2xl border-x-0 border-t-0 shadow-lg sm:rounded-2xl sm:border"
      }`}
    >
      {/* Header with Gradient */}
      <div
        className={`bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-4 dark:from-green-900/20 dark:to-emerald-900/20 ${
          order.status === "shopping" ? "cursor-pointer sm:cursor-default" : ""
        }`}
        onClick={() => {
          if (order.status === "shopping" && window.innerWidth < 640) {
            onToggleSummary();
          }
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg
                className="h-5 w-5 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>
              {order.status === "shopping" && !isSummaryExpanded && (
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 sm:hidden">
                  {(() => {
                    // Check if we have same-shop combined orders
                    const hasCombinedOrders = order?.combinedOrders && order.combinedOrders.length > 0;
                    const mainShopId = order?.shop?.id;
                    const sameShopCombinedOrders = hasCombinedOrders
                      ? order.combinedOrders.filter(co => co.shop?.id === mainShopId)
                      : [];
                    const hasSameShopCombinedOrders = sameShopCombinedOrders.length > 0;

                    return formatCurrency(hasSameShopCombinedOrders ? calculateBatchTotal() : calculateFoundItemsTotal());
                  })()}
                </span>
              )}
            </div>
          </div>
          {order.status === "shopping" && (
            <button
              className="sm:hidden"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSummary();
              }}
            >
              <svg
                className={`h-6 w-6 text-gray-600 transition-transform dark:text-gray-400 ${
                  isSummaryExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        className={`overflow-y-auto px-4 py-4 transition-all duration-300 ${
          order.status === "shopping" && !isSummaryExpanded
            ? "hidden sm:block"
            : ""
        }`}
        style={{
          maxHeight:
            order.status === "shopping" && isSummaryExpanded ? "50vh" : "auto",
        }}
      >
        {order.orderType === "reel" ? (
          (() => {
            const itemsTotal =
              parseFloat(order.reel?.Price || "0") * (order.quantity || 1);
            const discount = order.discount || 0;
            const finalTotal = itemsTotal - discount;
            const vat = finalTotal * (18 / 118);
            const subtotal = finalTotal - vat;

            return (
              <>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>VAT (18%)</span>
                  <span className="font-medium">{formatCurrency(vat)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-medium">
                      -{formatCurrency(discount)}
                    </span>
                  </div>
                )}
                <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
                <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                  <span className="font-bold text-gray-900 dark:text-white">
                    Order Total
                  </span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </>
            );
          })()
        ) : (
          <>
            {getActiveOrder.status === "shopping" && (
              <>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>Items Found</span>
                  <span className="font-medium">
                    {getActiveOrderItems.filter((item) => item.found)
                      .length || 0}{" "}
                    / {getActiveOrderItems.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>Units Found</span>
                  <span className="font-medium">
                    {getActiveOrderItems.reduce((total, item) => {
                      if (item.found) {
                        return total + (item.foundQuantity || item.quantity);
                      }
                      return total;
                    }, 0) || 0}{" "}
                    /{" "}
                    {getActiveOrderItems.reduce(
                      (total, item) => total + item.quantity,
                      0
                    ) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                  <span>Units Not Found</span>
                  <span className="font-medium">
                    {getActiveOrderItems.reduce((total, item) => {
                      if (!item.found) {
                        return total + item.quantity;
                      } else if (
                        item.found &&
                        item.foundQuantity &&
                        item.foundQuantity < item.quantity
                      ) {
                        return total + (item.quantity - item.foundQuantity);
                      }
                      return total;
                    }, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                  <span>Refund Amount</span>
                  <span className="font-medium">
                    -
                    {formatCurrency(
                      getActiveOrderItems.reduce((total, item) => {
                        return total + item.price * item.quantity;
                      }, 0) -
                        getActiveOrderItems.reduce((total, item) => {
                          if (item.found) {
                            return (
                              total +
                              item.price * (item.foundQuantity || item.quantity)
                            );
                          }
                          return total;
                        }, 0)
                    )}
                  </span>
                </div>
              </>
            )}
            {(() => {
              const activeOrder = getActiveOrder;

              // Check if we have same-shop combined orders
              const hasCombinedOrders = order?.combinedOrders && order.combinedOrders.length > 0;
              const mainShopId = order?.shop?.id;
              const sameShopCombinedOrders = hasCombinedOrders
                ? order.combinedOrders.filter(co => co.shop?.id === mainShopId)
                : [];
              const hasSameShopCombinedOrders = sameShopCombinedOrders.length > 0;

              // For same-shop combined orders, use batch total instead of individual order total
              const itemsTotal = hasSameShopCombinedOrders
                ? (activeOrder?.status === "shopping"
                    ? calculateBatchTotal()
                    : calculateBatchTotal()) // For completed orders, also use batch total
                : (activeOrder?.status === "shopping"
                    ? calculateFoundItemsTotal()
                    : calculateOriginalSubtotal());

              const discount = activeOrder?.discount || 0;
              const finalTotal = itemsTotal - discount;
              const vat = finalTotal * (18 / 118);
              const subtotal = finalTotal - vat;

              return (
                <>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                    <span>VAT (18%)</span>
                    <span className="font-medium">{formatCurrency(vat)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                      <span>Discount</span>
                      <span className="font-medium">
                        -{formatCurrency(discount)}
                      </span>
                    </div>
                  )}
                  <div className="my-3 border-t border-gray-200 dark:border-gray-700"></div>
                  <div className="flex justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3 dark:from-green-900/20 dark:to-emerald-900/20">
                    <span className="font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </>
              );
            })()}

            {order.status === "shopping" && (
              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                <div className="flex gap-2">
                  <svg
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400"
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
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    <strong>Note:</strong> The total reflects only the value of
                    found items. Service fee (
                    {formatCurrency(parseFloat(order.serviceFee || "0"))}) and
                    delivery fee (
                    {formatCurrency(parseFloat(order.deliveryFee || "0"))}) were
                    already added to your wallet as earnings when you started
                    shopping.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
