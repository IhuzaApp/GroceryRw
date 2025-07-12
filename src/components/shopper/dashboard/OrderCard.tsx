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
          orderType: order.orderType || "regular" // Pass order type to API
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
                  orderType: order.orderType || "regular"
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
    <Panel
      shaded
      bordered
      bodyFill
      className={`overflow-hidden ${
        order.priorityLevel && order.priorityLevel >= 4
          ? "border-2 border-red-500"
          : isReelOrder
          ? "border-2 border-purple-500"
          : ""
      }`}
    >
      {priorityInfo && (
        <div
          className={`py-1 text-center text-xs font-bold ${priorityInfo.class}`}
        >
          {priorityInfo.text}
        </div>
      )}
      
      {/* Reel order indicator */}
      {isReelOrder && (
        <div className="py-1 text-center text-xs font-bold bg-purple-100 text-purple-800">
          🎬 REEL ORDER
        </div>
      )}
      
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">
              {isReelOrder ? order.reel?.title || "Reel Order" : order.shopName}
            </h3>
            <p className="text-sm text-gray-500">
              {isReelOrder 
                ? `From: ${order.customerName || "Reel Creator"}` 
                : order.shopAddress
              }
            </p>
            {isReelOrder && order.reel?.description && (
              <p className="text-xs text-gray-400 mt-1">
                {order.reel.description}
              </p>
            )}
          </div>
          <Badge
            content={order.createdAt}
            className={`rounded px-2 py-1 text-xs font-medium ${badgeColorClass}`}
          />
        </div>

        <div className="mb-3 flex items-center text-sm text-gray-600">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mr-1 h-4 w-4"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="mr-3">Distance: {order.distance}</span>

          {order.travelTimeMinutes !== undefined && (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mr-1 h-4 w-4"
              >
                <path d="M12 2v2M12 8v4l3 3M2 12h2M20 12h2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="mr-3">
                Travel time: {order.travelTimeMinutes} min
              </span>
            </>
          )}

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mr-1 h-4 w-4"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span>
            {isReelOrder 
              ? `Quantity: ${order.quantity || 1}` 
              : `Items: ${order.items}`
            }
          </span>
        </div>

        <div className="mb-4 flex items-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mr-1 h-4 w-4 text-gray-500"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span className="text-sm text-gray-500">
            Deliver to: {order.customerAddress}
          </span>
        </div>

        {/* Show delivery note for reel orders */}
        {isReelOrder && order.deliveryNote && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> {order.deliveryNote}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Estimated Earnings</p>
            <p className={`text-lg font-bold ${isReelOrder ? 'text-purple-600' : 'text-green-600'}`}>
              {order.estimatedEarnings}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/Plasa/orders/${order.id}`}>
              <button className={`rounded px-3 py-1.5 text-sm hover:bg-green-50 ${
                isReelOrder ? 'text-purple-600' : 'text-green-600'
              }`}>
                View Details
              </button>
            </Link>
            <button
              className={`rounded px-3 py-1.5 text-sm text-white hover:bg-green-600 ${
                isReelOrder ? 'bg-purple-500 hover:bg-purple-600' : 'bg-green-500'
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
                "Accept Batch"
              )}
            </button>
          </div>
        </div>
      </div>
    </Panel>
  );
}
