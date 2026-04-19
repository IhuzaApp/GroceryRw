"use client";

import React from "react";
import { formatCurrency } from "../../../../lib/formatCurrency";
import { OrderDetailsType } from "../../types";
import { useTaxRate } from "../../../../hooks/useTaxRate";
import { useTheme } from "../../../../context/ThemeContext";

interface OrderSummarySectionProps {
  order: OrderDetailsType;
  isSummaryExpanded: boolean;
  onToggleSummary: () => void;
  getActiveOrder: any;
  getActiveOrderItems: any[];
  calculateFoundItemsTotal: () => number;
  calculateOriginalSubtotal: () => number;
  calculateBatchTotal: () => number;
  calculateOriginalBatchSubtotal?: () => number;
  hasCombinedOrders?: boolean;
  /** True when all combined orders are from the same shop (batch payment & summary) */
  hasSameShopCombinedOrders?: boolean;
}

export default function OrderSummarySection({
  order,
  isSummaryExpanded = false,
  onToggleSummary,
  getActiveOrder,
  getActiveOrderItems,
  calculateFoundItemsTotal,
  calculateOriginalSubtotal,
  calculateBatchTotal,
  calculateOriginalBatchSubtotal = () => 0,
  hasCombinedOrders = false,
  hasSameShopCombinedOrders = false,
}: OrderSummarySectionProps) {
  const { taxRate } = useTaxRate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const hasAnyOrderInShopping = hasCombinedOrders
    ? [order, ...(order.combinedOrders || [])].some(
        (o) => o.status === "shopping"
      )
    : order.status === "shopping";

  const shouldShowAtBottom = hasCombinedOrders
    ? [order, ...(order.combinedOrders || [])].some((o) =>
        ["shopping", "accepted", "paid"].includes(o.status)
      )
    : hasAnyOrderInShopping;

  const containerClasses = `overflow-hidden transition-all duration-300 border ${
    shouldShowAtBottom
      ? "fixed bottom-[5.5rem] left-0 right-0 z-[9998] rounded-t-[2.5rem] border-x-0 border-b-0 shadow-[0_-8px_30px_rgba(0,0,0,0.2)] sm:relative sm:bottom-auto sm:z-auto sm:rounded-2xl sm:border sm:shadow-lg"
      : "rounded-t-2xl border-x-0 border-t-0 shadow-lg sm:rounded-2xl sm:border"
  } ${
    isDark ? "bg-[#0A0A0A]/80 border-white/10" : "bg-black/5 border-black/5"
  }`;

  return (
    <div
      className={containerClasses}
      style={{
        backdropFilter: "blur(25px)",
        WebkitBackdropFilter: "blur(25px)",
      }}
    >
      {/* Header with Glass Effect */}
      <div
        className={`border-b px-6 py-4 ${
          isDark ? "border-white/5" : "border-black/5"
        } ${shouldShowAtBottom ? "cursor-pointer sm:cursor-default" : ""}`}
        onClick={() => {
          if (shouldShowAtBottom && window.innerWidth < 640) onToggleSummary();
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isDark
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
              Order Summary
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {order.status === "accepted" && (
              <div
                className={`rounded-xl px-4 py-1.5 text-lg font-black tracking-tight ${
                  isDark
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {formatCurrency(
                  hasSameShopCombinedOrders
                    ? calculateOriginalBatchSubtotal()
                    : calculateOriginalSubtotal()
                )}
              </div>
            )}
            {order.status === "shopping" && (
              <button
                className="p-2 sm:hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSummary();
                }}
              >
                <svg
                  className={`h-6 w-6 text-gray-400 transition-transform duration-300 ${
                    isSummaryExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {(() => {
        const isHidden = shouldShowAtBottom && !isSummaryExpanded;
        const maxHeight =
          shouldShowAtBottom && isSummaryExpanded ? "50vh" : "auto";

        return (
          <div
            className={`space-y-4 overflow-y-auto px-6 py-5 transition-all duration-300 ${
              isHidden ? "hidden sm:block" : ""
            }`}
            style={{ maxHeight }}
          >
            {order.orderType === "reel" ? (
              (() => {
                const itemsTotal =
                  parseFloat(order.reel?.Price || "0") * (order.quantity || 1);
                const discount = order.discount || 0;
                const finalTotal = itemsTotal - discount;
                const vat = finalTotal * (taxRate / (1 + taxRate));
                const subtotal = finalTotal - vat;

                return (
                  <div className="space-y-2">
                    <SummaryRow
                      label="Subtotal"
                      value={formatCurrency(subtotal)}
                    />
                    <SummaryRow
                      label={`VAT (${(taxRate * 100).toFixed(0)}%)`}
                      value={formatCurrency(vat)}
                    />
                    {discount > 0 && (
                      <SummaryRow
                        label="Discount"
                        value={`-${formatCurrency(discount)}`}
                        variant="emerald"
                      />
                    )}
                    <div
                      className={`my-4 border-t ${
                        isDark ? "border-white/5" : "border-black/5"
                      }`}
                    />
                    <SummaryTotal
                      label="Order Total"
                      value={formatCurrency(finalTotal)}
                    />
                  </div>
                );
              })()
            ) : (
              <>
                {order.status === "shopping" && (
                  <div className="space-y-2 pb-2">
                    {(() => {
                      const summaryItems =
                        hasSameShopCombinedOrders &&
                        order?.combinedOrders?.length > 0
                          ? [
                              ...(order?.Order_Items || []),
                              ...order.combinedOrders.flatMap(
                                (co: any) => co.Order_Items || []
                              ),
                            ]
                          : getActiveOrderItems;

                      const itemsFound = summaryItems.filter(
                        (item) => item.found
                      ).length;
                      const unitsFound = summaryItems.reduce(
                        (total, item) =>
                          item.found
                            ? total + (item.foundQuantity || item.quantity)
                            : total,
                        0
                      );
                      const totalUnits = summaryItems.reduce(
                        (total, item) => total + item.quantity,
                        0
                      );
                      const refundAmount =
                        summaryItems.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        ) -
                        summaryItems.reduce(
                          (total, item) =>
                            item.found
                              ? total +
                                item.price *
                                  (item.foundQuantity || item.quantity)
                              : total,
                          0
                        );

                      return (
                        <>
                          <SummaryRow
                            label="Items Found"
                            value={`${itemsFound} / ${summaryItems.length}`}
                          />
                          <SummaryRow
                            label="Units Found"
                            value={`${unitsFound} / ${totalUnits}`}
                          />
                          {refundAmount > 0 && (
                            <SummaryRow
                              label="Potential Refund"
                              value={`-${formatCurrency(refundAmount)}`}
                              variant="red"
                            />
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}

                {(() => {
                  const activeOrder = getActiveOrder;
                  const anyOrderShopping =
                    hasCombinedOrders &&
                    [order, ...(order.combinedOrders || [])].some(
                      (o) => o?.status === "shopping"
                    );
                  const itemsTotal = hasSameShopCombinedOrders
                    ? anyOrderShopping
                      ? calculateBatchTotal()
                      : calculateOriginalBatchSubtotal()
                    : activeOrder?.status === "shopping"
                    ? calculateFoundItemsTotal()
                    : calculateOriginalSubtotal();
                  const discount = activeOrder?.discount || 0;
                  const finalTotal = itemsTotal - discount;
                  const vat = finalTotal * (taxRate / (1 + taxRate));
                  const subtotal = finalTotal - vat;

                  return (
                    <div className="space-y-2">
                      <SummaryRow
                        label="Subtotal"
                        value={formatCurrency(subtotal)}
                      />
                      <SummaryRow
                        label={`VAT (${(taxRate * 100).toFixed(0)}%)`}
                        value={formatCurrency(vat)}
                      />
                      {discount > 0 && (
                        <SummaryRow
                          label="Discount"
                          value={`-${formatCurrency(discount)}`}
                          variant="emerald"
                        />
                      )}
                      <div
                        className={`my-4 border-t ${
                          isDark ? "border-white/5" : "border-black/5"
                        }`}
                      />
                      <SummaryTotal
                        label="Grand Total"
                        value={formatCurrency(finalTotal)}
                      />
                    </div>
                  );
                })()}

                {order.status === "shopping" && (
                  <div
                    className={`mt-4 flex gap-3 rounded-2xl border p-4 ${
                      isDark
                        ? "border-blue-500/20 bg-blue-500/10 text-blue-200"
                        : "border-blue-100 bg-blue-50 text-blue-800"
                    }`}
                  >
                    <svg
                      className="mt-0.5 h-5 w-5 flex-shrink-0 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight sm:text-xs">
                      Note: Total reflects found items only. Commission and
                      delivery fees were already settled.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })()}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "emerald" | "red";
}) {
  const colorClass =
    variant === "emerald"
      ? "text-emerald-500"
      : variant === "red"
      ? "text-red-500"
      : "text-gray-500 dark:text-gray-400";
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 opacity-60">
        {label}
      </span>
      <span
        className={`text-xs font-black uppercase tracking-tight ${colorClass}`}
      >
        {value}
      </span>
    </div>
  );
}

function SummaryTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
      <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
        {label}
      </span>
      <span className="text-xl font-black text-emerald-600 drop-shadow-sm dark:text-emerald-400">
        {value}
      </span>
    </div>
  );
}
