import React from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import { StatusBadge } from "./StatusBadge";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface Order {
  id: string;
  OrderID: string;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopAddress: string;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?: "regular" | "reel" | "restaurant";
  reel?: {
    id: string;
    title: string;
    restaurant_id?: string | null;
    user_id?: string | null;
  };
  quantity?: number;
  deliveryNote?: string | null;
}

interface BatchCardMobileProps {
  order: Order;
  currentTime: Date;
}

export function BatchCardMobile({ order, currentTime }: BatchCardMobileProps) {
  const { theme } = useTheme();
  const isReelOrder = order.orderType === "reel";
  const isRestaurantOrder = order.orderType === "restaurant";

  const getDeliveryCountdown = (deliveryTime: string) => {
    const deliveryDate = new Date(deliveryTime);
    const timeDiff = deliveryDate.getTime() - currentTime.getTime();

    if (timeDiff <= 0) {
      return { isOverdue: true, minutes: 0, totalMinutes: 0, hours: 0 };
    }

    const totalMinutes = Math.ceil(timeDiff / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { isOverdue: false, minutes, hours, totalMinutes };
  };

  const getNextActionButton = (status: string) => {
    const buttonClass = isReelOrder
      ? "rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-indigo-500/25 flex items-center gap-1"
      : isRestaurantOrder
      ? "rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:from-orange-700 hover:to-red-700 shadow-md hover:shadow-orange-500/25 flex items-center gap-1"
      : "rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:from-emerald-700 hover:to-green-700 shadow-md hover:shadow-emerald-500/25 flex items-center gap-1";

    const isRestaurantUserReel =
      order.reel?.restaurant_id || order.reel?.user_id;

    switch (status) {
      case "accepted":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isRestaurantUserReel ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                )}
              </svg>
              {isRestaurantUserReel ? "Start Delivery" : "Start Shopping"}
            </button>
          </Link>
        );
      case "at_customer":
      case "on_the_way":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Confirm Delivery
            </button>
          </Link>
        );
      default:
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </button>
          </Link>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-300 hover:shadow-lg ${
        theme === "dark"
          ? isReelOrder
            ? "border-purple-600 bg-gradient-to-br from-gray-800 to-purple-900/20 text-gray-100 hover:border-purple-500 hover:shadow-purple-500/25"
            : isRestaurantOrder
            ? "border-orange-600 bg-gradient-to-br from-gray-800 to-orange-900/20 text-gray-100 hover:border-orange-500 hover:shadow-orange-500/25"
            : "border-emerald-600 bg-gradient-to-br from-gray-800 to-emerald-900/20 text-gray-100 hover:border-emerald-500 hover:shadow-emerald-500/25"
          : isReelOrder
          ? "border-purple-200 bg-gradient-to-br from-white to-purple-50 text-gray-900 hover:border-purple-300 hover:shadow-purple-500/25"
          : isRestaurantOrder
          ? "border-orange-200 bg-gradient-to-br from-white to-orange-50 text-gray-900 hover:border-orange-300 hover:shadow-orange-500/25"
          : "border-emerald-200 bg-gradient-to-br from-white to-emerald-50 text-gray-900 hover:border-emerald-300 hover:shadow-emerald-500/25"
      }`}
    >
      {/* Batch Type Indicators */}
      <div className="mb-3 flex items-center justify-center gap-2 flex-wrap">
        {isReelOrder && (
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-1 text-center text-xs font-bold text-white shadow-md">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Quick Batch
          </div>
        )}

        {isRestaurantOrder && (
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-600 to-red-600 px-3 py-1 text-center text-xs font-bold text-white shadow-md">
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
              />
            </svg>
            Restaurant Order
          </div>
        )}

        {order.deliveryTime && !isReelOrder && !isRestaurantOrder && (() => {
          const countdown = getDeliveryCountdown(order.deliveryTime);
          return (
            <div
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-center text-xs font-bold shadow-md ${
                countdown.isOverdue
                  ? "bg-gradient-to-r from-red-600 to-rose-600 text-white"
                  : countdown.totalMinutes <= 30
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  : "bg-gradient-to-r from-sky-600 to-blue-600 text-white"
              }`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {countdown.isOverdue
                ? "OVERDUE"
                : countdown.totalMinutes <= 30
                ? `${countdown.totalMinutes}m`
                : countdown.hours > 0
                ? `${countdown.hours}h ${countdown.minutes}m`
                : `${countdown.minutes}m`}
            </div>
          );
        })()}
      </div>

      {/* Header Section */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-xl p-3 shadow-md ${
              isReelOrder
                ? theme === "dark"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-gradient-to-br from-indigo-400 to-purple-500"
                : isRestaurantOrder
                ? theme === "dark"
                  ? "bg-gradient-to-br from-orange-500 to-red-600"
                  : "bg-gradient-to-br from-orange-400 to-red-500"
                : theme === "dark"
                ? "bg-gradient-to-br from-emerald-500 to-green-600"
                : "bg-gradient-to-br from-emerald-400 to-green-500"
            }`}
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <h3
              className={`text-lg font-bold ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}
            >
              #{order.OrderID}
            </h3>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              {order.items} items
            </p>
          </div>
        </div>

        <div
          className={`rounded-lg p-3 ${
            theme === "dark" ? "bg-gray-700" : "bg-gray-50"
          }`}
        >
          <div className="text-center">
            <p
              className={`text-xl font-bold ${
                isReelOrder
                  ? theme === "dark"
                    ? "text-indigo-400"
                    : "text-indigo-600"
                  : isRestaurantOrder
                  ? theme === "dark"
                    ? "text-orange-400"
                    : "text-orange-600"
                  : theme === "dark"
                  ? "text-emerald-400"
                  : "text-emerald-600"
              }`}
            >
              {formatCurrencySync(order.estimatedEarnings || 0)}
            </p>
            <p
              className={`text-xs font-medium ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Earnings
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-4">
        <StatusBadge status={order.status} />
      </div>

      {/* Location Information */}
      <div className="mb-4 space-y-3">
        <div
          className={`rounded-lg border p-3 ${
            theme === "dark"
              ? "border-blue-600 bg-blue-900/20"
              : "border-blue-200 bg-blue-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 ${
                theme === "dark" ? "text-blue-400" : "text-blue-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <div className="flex-1">
              <p
                className={`text-xs font-bold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-800"
                }`}
              >
                {order.shopName}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`rounded-lg border p-3 ${
            theme === "dark"
              ? "border-green-600 bg-green-900/20"
              : "border-green-200 bg-green-50"
          }`}
        >
          <div className="flex items-center gap-2">
            <svg
              className={`h-4 w-4 ${
                theme === "dark" ? "text-green-400" : "text-green-600"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <div className="flex-1">
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {order.customerName}, {order.customerAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2">
        <a
          href={`https://maps.google.com/?q=${order.customerLat},${order.customerLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ${
            theme === "dark"
              ? "text-blue-400 hover:bg-blue-900/20 hover:text-blue-300"
              : "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Directions
        </a>
        {getNextActionButton(order.status)}
      </div>
    </div>
  );
}
