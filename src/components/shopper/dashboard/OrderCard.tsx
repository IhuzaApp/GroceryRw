"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Panel, Badge, Loader } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { toast } from "react-hot-toast";

interface Order {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  distance: string;
  items: number;
  total: string;
  estimatedEarnings: string;
  createdAt: string;
  rawCreatedAt?: number;
  minutesAgo?: number;
  priorityLevel?: number;
  travelTimeMinutes?: number;
  // Add order type and reel-specific fields
  orderType?: "regular" | "reel";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
  };
  quantity?: number;
  deliveryNote?: string;
  customerName?: string;
  customerPhone?: string;
}

interface OrderCardProps {
  order: Order;
  onOrderAccepted?: () => void; // Callback for when order is accepted
}

function getBadgeColor(order: Order): string {
  const minutesAgo = order.minutesAgo || 0;

  if (minutesAgo < 10) {
    return "bg-blue-100 text-blue-800";
  } else if (minutesAgo < 60) {
    return "bg-green-100 text-green-800";
  } else if (minutesAgo < 24 * 60) {
    return "bg-orange-100 text-orange-800";
  } else {
    return "bg-purple-100 text-purple-800";
  }
}

function getPriorityLabel(
  priorityLevel: number
): { text: string; class: string } | null {
  if (!priorityLevel || priorityLevel <= 1) return null;

  switch (priorityLevel) {
    case 5:
      return {
        text: "CRITICAL",
        class: "bg-red-600 text-white",
      };
    case 4:
      return {
        text: "HIGH PRIORITY",
        class: "bg-orange-500 text-white",
      };
    case 3:
      return {
        text: "PRIORITY",
        class: "bg-yellow-500 text-white",
      };
    case 2:
      return {
        text: "LOW PRIORITY",
        class: "bg-blue-500 text-white",
      };
    default:
      return null;
  }
}

export default function OrderCard({ order, onOrderAccepted }: OrderCardProps) {
  const badgeColorClass = getBadgeColor(order);
  const priorityInfo = getPriorityLabel(order.priorityLevel || 0);
  const [isAccepting, setIsAccepting] = useState(false);
  const isReelOrder = order.orderType === "reel";

  const handleAcceptOrder = async () => {
    setIsAccepting(true);
    try {
      // Call the assignOrder API endpoint
      const response = await fetch("/api/shopper/assignOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          orderType: order.orderType || "regular", // Pass order type to API
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Order assigned successfully!");

        // Call the callback instead of reloading page
        if (onOrderAccepted) {
          onOrderAccepted();
        }
      } else if (data.error === "no_wallet") {
        // Handle wallet creation
        toast.error("You need a wallet to accept batches");

        try {
          // Create wallet automatically
          const walletResponse = await fetch("/api/queries/createWallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          const walletData = await walletResponse.json();

          if (walletData.success) {
            toast.success(
              "Wallet created successfully. Trying to accept the batch again..."
            );

            // Try accepting the order again after wallet is created
            setTimeout(async () => {
              const retryResponse = await fetch("/api/shopper/assignOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: order.id,
                  orderType: order.orderType || "regular",
                }),
              });

              const retryData = await retryResponse.json();

              if (retryData.success) {
                toast.success("Order assigned successfully!");

                // Call the callback instead of reloading page
                if (onOrderAccepted) {
                  onOrderAccepted();
                }
              } else {
                toast.error(
                  retryData.error ||
                    "Failed to assign order after wallet creation"
                );
              }

              setIsAccepting(false);
            }, 1000); // Give a little time for wallet to be fully created

            return; // Return early to prevent setIsAccepting(false) below
          } else {
            toast.error("Failed to create wallet. Please try again later.");
          }
        } catch (walletError) {
          console.error("Error creating wallet:", walletError);
          toast.error("Failed to create wallet. Please try again later.");
        }
      } else {
        toast.error(data.error || "Failed to assign order");
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error("An error occurred while accepting the order");
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl ${
        order.priorityLevel && order.priorityLevel >= 4
          ? "border-red-500 bg-gradient-to-br from-red-50 to-white shadow-lg shadow-red-500/20"
          : isReelOrder
          ? "border-purple-500 bg-gradient-to-br from-purple-50 to-white shadow-lg shadow-purple-500/20"
          : "border-gray-200 bg-white shadow-md hover:shadow-xl"
      }`}
    >
      {priorityInfo && (
        <div
          className={`relative py-2 text-center text-xs font-bold ${priorityInfo.class}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <span className="relative z-10">{priorityInfo.text}</span>
        </div>
      )}

      {/* Reel order indicator */}
      {isReelOrder && (
        <div className="relative bg-gradient-to-r from-purple-500 to-purple-600 py-2 text-center text-xs font-bold text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          <span className="relative z-10">🎬 REEL ORDER</span>
        </div>
      )}

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1 pr-3">
            <h3 className="mb-1 text-xl font-bold text-gray-900">
              {isReelOrder ? order.reel?.title || "Reel Order" : order.shopName}
            </h3>
            <p className="text-sm text-gray-600">
              {isReelOrder
                ? `From: ${order.customerName || "Reel Creator"}`
                : order.shopAddress}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColorClass}`}
          >
            {order.createdAt}
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mr-1 h-4 w-4 text-blue-600"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="font-semibold">{order.distance}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mr-1 h-4 w-4 text-purple-600"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <span className="font-semibold">
                {isReelOrder ? order.quantity || 1 : order.items}{" "}
                {isReelOrder ? "item" : "items"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className={`mr-2 h-5 w-5 ${
                isReelOrder ? "text-purple-600" : "text-green-600"
              }`}
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <div>
              <p className="text-sm text-gray-500">Earnings</p>
              <p
                className={`text-2xl font-bold ${
                  isReelOrder ? "text-purple-600" : "text-green-600"
                }`}
              >
                {order.estimatedEarnings}
              </p>
            </div>
          </div>
          <button
            className={`relative overflow-hidden rounded-xl px-8 py-3 text-sm font-bold text-white transition-all duration-200 hover:shadow-lg active:scale-95 ${
              isReelOrder
                ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }`}
            onClick={handleAcceptOrder}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <div className="flex items-center">
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Accepting...
              </div>
            ) : (
              <span className="flex items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="mr-2 h-4 w-4"
                >
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02" />
                </svg>
                Accept Batch
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
