"use client";

import React from "react";
import { Button } from "rsuite";
import { OrderDetailsType, OrderItem } from "../types";

interface ActionButtonsProps {
  order: OrderDetailsType;
  targetOrder?: OrderDetailsType;
  loading: boolean;
  uploadedProofs: { [key: string]: boolean };
  theme: string;
  onUpdateStatus: (status: string, orderId: string) => Promise<void>;
  onDeliveryConfirmationClick: () => void;
  onShowInvoiceProofModal: () => void;
  getActiveOrderItems: OrderItem[];
}

export default function ActionButtons({
  order,
  targetOrder,
  loading,
  uploadedProofs,
  theme,
  onUpdateStatus,
  onDeliveryConfirmationClick,
  onShowInvoiceProofModal,
  getActiveOrderItems,
}: ActionButtonsProps) {
  const activeOrder = targetOrder || order;
  if (!activeOrder) return null;

  const isRestaurantOrder = activeOrder.orderType === "restaurant";
  const isBusinessOrder = activeOrder.orderType === "business";
  // Skip shopping if EITHER restaurant_id OR user_id is not null
  const isRestaurantUserReel =
    activeOrder.reel?.restaurant_id || activeOrder.reel?.user_id;

  const handleUpdateStatus = (status: string, orderId: string) => {
    onUpdateStatus(status, orderId);
  };

  switch (activeOrder.status) {
    case "accepted":
    case "Ready for Pickup":
      return (
        <button
          onClick={() => {
            if (activeOrder.orderType === "reel" && isRestaurantUserReel) {
              handleUpdateStatus("on_the_way", activeOrder.id);
            } else if (isRestaurantOrder || isBusinessOrder) {
              handleUpdateStatus("on_the_way", activeOrder.id);
            } else {
              handleUpdateStatus("shopping", activeOrder.id);
            }
          }}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50`}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>
                {activeOrder.orderType === "reel" && isRestaurantUserReel
                  ? "Start Delivery"
                  : isRestaurantOrder || isBusinessOrder
                  ? "Start Delivery"
                  : "Start Shopping"}
              </span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </>
          )}
        </button>
      );
    case "shopping":
      // For restaurant/user reel orders, they shouldn't be in shopping status
      // For regular reel orders, no need to check found items since there's only one item
      if (activeOrder.orderType === "reel") {
        if (isRestaurantUserReel) {
          // This shouldn't happen, but handle gracefully
          return (
            <button
              onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
              disabled={loading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50`}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>
                    {isRestaurantUserReel
                      ? "Complete Delivery"
                      : "Make Payment"}
                  </span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </>
              )}
            </button>
          );
        }
      }

      // For regular orders, check if any items are marked as found
      // If items are in the root Order_Items list, filter them by shopId if it's a sub-order
      const relevantItems =
        activeOrder.Order_Items ||
        order?.Order_Items?.filter(
          (item) =>
            !(item as any).shopId ||
            (item as any).shopId === activeOrder.shop?.id
        ) ||
        [];

      // For combined orders, also check items in combined orders
      const combinedOrderItems =
        order?.combinedOrders?.flatMap(
          (combinedOrder: any) =>
            combinedOrder.Order_Items?.filter(
              (item: any) =>
                !(item as any).shopId ||
                (item as any).shopId === activeOrder.shop?.id
            ) || []
        ) || [];

      const allRelevantItems = [...relevantItems, ...combinedOrderItems];
      const hasFoundItems =
        allRelevantItems?.some((item: any) => item.found) || false;

      // Shopping status calculated

      return (
        <button
          onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
          disabled={loading || !hasFoundItems}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all duration-300 ${
            hasFoundItems
              ? "bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99]"
              : "cursor-not-allowed bg-gray-400 opacity-50"
          }`}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>
                {hasFoundItems ? "Make Payment" : "Mark Items as Found"}
              </span>
              {hasFoundItems && (
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              )}
            </>
          )}
        </button>
      );
    case "on_the_way":
    case "at_customer":
      // Only show Confirm Delivery button if invoice proof has been uploaded for this specific order
      if (!uploadedProofs[activeOrder.id]) {
        return (
          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 p-5 text-center transition-all duration-500 ${
              theme === "dark"
                ? "border-amber-500/20 bg-amber-500/5"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                theme === "dark"
                  ? "bg-amber-500/20 text-amber-500"
                  : "bg-amber-100 text-amber-600"
              }`}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <h4
              className={`text-sm font-black uppercase tracking-tight ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Proof Required
            </h4>
            <p
              className={`mt-1 text-xs font-medium opacity-60 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Please upload the invoice photo
            </p>

            <button
              onClick={onShowInvoiceProofModal}
              className={`mt-4 w-full rounded-xl bg-amber-500 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]`}
            >
              Upload Invoice Photo
            </button>
          </div>
        );
      }
      return (
        <button
          onClick={onDeliveryConfirmationClick}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50`}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <span>Confirm Delivery</span>
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </>
          )}
        </button>
      );
    case "delivered":
      // No button for delivered status
      return null;
    default:
      return null;
  }
}
