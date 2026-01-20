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
  // Skip shopping if EITHER restaurant_id OR user_id is not null
  const isRestaurantUserReel =
    activeOrder.reel?.restaurant_id || activeOrder.reel?.user_id;

  const handleUpdateStatus = (status: string, orderId: string) => {
    onUpdateStatus(status, orderId);
  };

  switch (activeOrder.status) {
    case "accepted":
      return (
        <Button
          appearance="primary"
          color="green"
          size="lg"
          block
          onClick={() => {
            if (activeOrder.orderType === "reel" && isRestaurantUserReel) {
              // Skip shopping and go straight to delivery for restaurant/user reels
              handleUpdateStatus("on_the_way", activeOrder.id);
            } else {
              handleUpdateStatus(
                isRestaurantOrder ? "on_the_way" : "shopping",
                activeOrder.id
              );
            }
          }}
          loading={loading}
          className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
        >
          {activeOrder.orderType === "reel" && isRestaurantUserReel
            ? "Start Delivery"
            : isRestaurantOrder
            ? "Start Delivery"
            : "Start Shopping"}
        </Button>
      );
    case "shopping":
      // For restaurant/user reel orders, they shouldn't be in shopping status
      // For regular reel orders, no need to check found items since there's only one item
      if (activeOrder.orderType === "reel") {
        if (isRestaurantUserReel) {
          // This shouldn't happen, but handle gracefully
          return (
            <Button
              appearance="primary"
              color="green"
              size="lg"
              block
              onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
              loading={loading}
              className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
            >
              Complete Delivery
            </Button>
          );
        } else {
          return (
            <Button
              appearance="primary"
              color="green"
              size="lg"
              block
              onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
              loading={loading}
              className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
            >
              Make Payment
            </Button>
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
        <Button
          appearance="primary"
          color="green"
          size="lg"
          block
          onClick={() => handleUpdateStatus("on_the_way", activeOrder.id)}
          loading={loading}
          disabled={!hasFoundItems}
          className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
        >
          {hasFoundItems ? "Make Payment" : "Mark Items as Found to Continue"}
        </Button>
      );
    case "on_the_way":
    case "at_customer":
      // Only show Confirm Delivery button if invoice proof has been uploaded for this specific order
      if (!uploadedProofs[activeOrder.id]) {
        return (
          <div
            className={`flex flex-col items-center justify-center rounded-xl border-2 p-6 text-center ${
              theme === "dark"
                ? "border-yellow-600 bg-yellow-900/20"
                : "border-yellow-400 bg-yellow-50"
            }`}
          >
            <svg
              className={`mx-auto mb-3 h-12 w-12 ${
                theme === "dark" ? "text-yellow-400" : "text-yellow-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p
              className={`mb-4 font-semibold ${
                theme === "dark" ? "text-yellow-300" : "text-yellow-800"
              }`}
            >
              Invoice proof required before delivery
            </p>
            <Button
              appearance="primary"
              color="yellow"
              onClick={onShowInvoiceProofModal}
              className="rounded-lg px-6 py-2 font-bold shadow-md hover:scale-105"
            >
              Upload Invoice Photo
            </Button>
          </div>
        );
      }
      return (
        <Button
          appearance="primary"
          color="green"
          size="lg"
          block
          onClick={onDeliveryConfirmationClick}
          className="rounded-lg py-4 text-xl font-bold sm:rounded-xl sm:py-6 sm:text-3xl"
        >
          Confirm Delivery
        </Button>
      );
    case "delivered":
      // No button for delivered status
      return null;
    default:
      return null;
  }
}