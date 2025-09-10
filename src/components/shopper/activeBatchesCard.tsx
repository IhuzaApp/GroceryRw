"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Panel, Badge, Loader, toaster, Message } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { logger } from "../../utils/logger";
import { formatCurrencySync } from "../../utils/formatCurrency";

// Define interfaces for order data
interface Order {
  id: string;
  OrderID: string;
  status: string;
  createdAt?: string;
  created_at?: string;
  deliveryTime?: string;
  shopName?: string;
  shopAddress?: string;
  shopLat?: number;
  shopLng?: number;
  customerName?: string;
  customerAddress?: string;
  customerLat?: number;
  customerLng?: number;
  items?: number;
  total: number;
  estimatedEarnings?: string;
  shop?: {
    id: string;
    name: string;
    address: string;
    image: string;
  } | null;
  itemsCount?: number;
  unitsCount?: number;
  service_fee?: string;
  delivery_fee?: string;
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
  deliveryNote?: string | null;
  customerPhone?: string;
}

interface ActiveBatchesProps {
  initialOrders?: Order[];
  initialError?: string | null;
}

// Calculate countdown for delivery time
const getDeliveryCountdown = (deliveryTime: string, currentTime: Date) => {
  const deliveryDate = new Date(deliveryTime);
  const timeDiff = deliveryDate.getTime() - currentTime.getTime();

  if (timeDiff <= 0) {
    return { isOverdue: true, minutes: 0, hours: 0, totalMinutes: 0 };
  }

  const totalMinutes = Math.ceil(timeDiff / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { isOverdue: false, minutes, hours, totalMinutes };
};

export default function ActiveBatches({
  initialOrders = [],
  initialError = null,
}: ActiveBatchesProps) {
  const { role } = useAuth();
  const [isLoading, setIsLoading] = useState(!initialOrders.length);
  const [isMobile, setIsMobile] = useState(false);
  const [activeOrders, setActiveOrders] = useState<Order[]>(initialOrders);
  const [error, setError] = useState<string | null>(initialError);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const fetchedRef = useRef(false);
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Only fetch orders client-side if we don't have them from server-side
  useEffect(() => {
    // Skip fetching if we already have data or already attempted a fetch
    if (initialOrders.length > 0 || fetchedRef.current) {
      return;
    }

    // Skip if not a shopper
    if (role !== "shopper") {
      setIsLoading(false);
      return;
    }

    // Set flag to prevent multiple fetches
    fetchedRef.current = true;

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchActiveBatches() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/shopper/activeBatches", {
          signal,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          logger.error("API Error Response", "ActiveBatchesCard", {
            status: response.status,
            error: errorData,
          });
          throw new Error(errorData.error || "Failed to fetch active batches");
        }

        const data = await response.json();

        if (!data.batches || data.batches.length === 0) {
          logger.info("No active batches found", "ActiveBatchesCard", {
            message: data.message,
          });
          setActiveOrders([]);
          return;
        }

        setActiveOrders(data.batches);
        setFetchAttempted(true);
      } catch (err) {
        // Don't set error if it was canceled
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        logger.error("Error fetching active batches", "ActiveBatchesCard", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        setFetchAttempted(true);
        toaster.push(
          <Message showIcon type="error" header="Error">
            {errorMessage}
          </Message>,
          { placement: "topEnd" }
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchActiveBatches();

    return () => {
      controller.abort();
    };
  }, [role, initialOrders.length]);

  // Calculate countdown for delivery time
  const getDeliveryCountdown = (deliveryTime: string) => {
    const deliveryDate = new Date(deliveryTime);
    const timeDiff = deliveryDate.getTime() - currentTime.getTime();

    if (timeDiff <= 0) {
      return { isOverdue: true, minutes: 0 };
    }

    const minutes = Math.ceil(timeDiff / (1000 * 60));
    return { isOverdue: false, minutes };
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      } ${isMobile ? "pb-16" : ""}`}
    >
      {/* Main Content */}
      <main className="max-w-9xl mx-auto p-3 sm:p-6">
        {/* Page Title - Desktop Only */}
        <div className="mb-4 flex items-center justify-between">
          <p
            className={`text-xl font-bold sm:text-2xl ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Active Batches
          </p>
          <button
            className={`rounded-full p-2 transition-colors ${
              theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-200"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Description about what orders are shown */}
        <div
          className={`text-md mb-4 rounded-lg p-3 ${
            theme === "dark"
              ? "border border-green-800 bg-green-900/20 text-green-300"
              : "border border-green-200 bg-green-50 text-green-700"
          }`}
        >
          <p>
            <span className="font-semibold">Note:</span> This page shows all
            your assigned orders except those with status &quot;PENDING&quot;,
            &quot;null&quot;, or &quot;delivered&quot;. You can track orders in
            various states including accepted, shopping, on the way, and at
            customer location.
          </p>
        </div>

        {/* Display a warning when user doesn't have the shopper role */}
        {!isLoading && role !== "shopper" && (
          <div
            className={`mb-4 rounded-lg border p-4 ${
              theme === "dark"
                ? "border-amber-500/20 bg-amber-900/20"
                : "border-amber-200 bg-amber-50"
            }`}
          >
            <p
              className={`text-base font-bold ${
                theme === "dark" ? "text-amber-300" : "text-amber-800"
              }`}
            >
              Shopper Access Required
            </p>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-amber-200" : "text-amber-700"
              }`}
            >
              This page is only accessible to users with shopper privileges.
              Your current role is: <strong>{role}</strong>
            </p>
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-amber-200" : "text-amber-700"
              }`}
            >
              If you believe you should have shopper access, please try:
            </p>
            <ul
              className={`mt-1 list-inside list-disc text-sm ${
                theme === "dark" ? "text-amber-200" : "text-amber-700"
              }`}
            >
              <li>Logging out and logging back in</li>
              <li>
                Checking with an administrator to verify your account type
              </li>
            </ul>
          </div>
        )}

        {error && (
          <div
            className={`mb-6 rounded-lg border p-4 ${
              theme === "dark"
                ? "border-red-500/20 bg-red-900/20"
                : "border-red-200 bg-red-50"
            }`}
          >
            <p
              className={`text-base font-bold ${
                theme === "dark" ? "text-red-300" : "text-red-800"
              }`}
            >
              There was a problem loading your batches
            </p>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-red-200" : "text-red-600"
              }`}
            >
              {error}
            </p>
            <div
              className={`mt-3 text-sm ${
                theme === "dark" ? "text-red-200" : "text-red-700"
              }`}
            >
              <p>This might be because:</p>
              <ul className="mt-1 list-inside list-disc">
                <li>You are not logged in as a shopper</li>
                <li>Your session may have expired (try refreshing)</li>
                <li>There may be a network issue (check your connection)</li>
                <li>The server might be temporarily unavailable</li>
              </ul>
            </div>
            <button
              onClick={() => window.location.reload()}
              className={`mt-3 rounded px-4 py-2 text-sm font-medium ${
                theme === "dark"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div
            className={`flex justify-center py-12 ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <Loader content="Loading orders..." />
          </div>
        ) : activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {activeOrders.map((order) => (
              <ActiveOrderCard
                key={order.id}
                order={order}
                currentTime={currentTime}
              />
            ))}
          </div>
        ) : (
          <div
            className={`rounded-xl border p-8 text-center ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div
              className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`h-8 w-8 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p
              className={`mb-2 text-lg font-bold sm:text-xl ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}
            >
              No Active Orders
            </p>
            <p
              className={`mb-4 text-sm sm:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {fetchAttempted || initialOrders !== undefined
                ? "You don&apos;t have any active orders assigned to you at the moment. This includes orders in any state except &apos;PENDING&apos;, &apos;null&apos;, or &apos;delivered&apos;."
                : "Unable to fetch your active orders. Please try again."}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/Plasa">
                <button className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700">
                  Return to Dashboard
                </button>
              </Link>
              {!fetchAttempted && !initialOrders.length && (
                <button
                  onClick={() => window.location.reload()}
                  className={`rounded-lg border px-4 py-2 font-medium transition-colors ${
                    theme === "dark"
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Retry Loading
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ActiveOrderCard({
  order,
  currentTime,
}: {
  order: Order;
  currentTime: Date;
}) {
  const { theme } = useTheme();
  const isReelOrder = order.orderType === "reel";

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge
            content="Accepted"
            className={`rounded bg-emerald-900/20 px-2 py-1 text-xs font-medium ${
              theme === "dark"
                ? "bg-emerald-900/40 text-emerald-200"
                : "text-emerald-800"
            }`}
          />
        );
      case "picked":
        return (
          <Badge
            content="Picked Up"
            className={`rounded bg-orange-100 px-2 py-1 text-xs font-medium ${
              theme === "dark"
                ? "bg-orange-900/20 text-orange-300"
                : "text-orange-800"
            }`}
          />
        );
      case "shopping":
        return (
          <Badge
            content="Shopping"
            className={`rounded bg-yellow-100 px-2 py-1 text-xs font-medium ${
              theme === "dark"
                ? "bg-yellow-900/20 text-yellow-300"
                : "text-yellow-800"
            }`}
          />
        );
      case "on_the_way":
        return (
          <Badge
            content="On The Way"
            className={`rounded bg-purple-100 px-2 py-1 text-xs font-medium ${
              theme === "dark"
                ? "bg-purple-900/20 text-purple-300"
                : "text-purple-800"
            }`}
          />
        );
      case "at_customer":
        return (
          <Badge
            content="At Customer"
            className={`rounded bg-indigo-100 px-2 py-1 text-xs font-medium ${
              theme === "dark"
                ? "bg-indigo-900/20 text-indigo-300"
                : "text-indigo-800"
            }`}
          />
        );
      default:
        return null;
    }
  };

  const getNextActionButton = (status: string) => {
    const buttonClass = isReelOrder
      ? "rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
      : "rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:from-emerald-700 hover:to-green-700 shadow-lg";

    switch (status) {
      case "ACCEPTED":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>Start Shopping</button>
          </Link>
        );
      case "picked":
      case "shopping":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>View Details</button>
          </Link>
        );
      case "at_customer":
      case "on_the_way":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>Confirm Delivery</button>
          </Link>
        );
      default:
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className={buttonClass}>View Details</button>
          </Link>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-all duration-300 sm:p-6 ${
        theme === "dark"
          ? "border-gray-600 bg-gray-800 text-gray-100 shadow-md hover:border-gray-500 hover:shadow-lg"
          : "border-gray-200 bg-white text-gray-900 shadow-md hover:border-gray-300 hover:shadow-lg"
      }`}
    >
      {/* Quick Batch indicator */}
      {isReelOrder && (
        <div className="mb-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-center text-xs font-bold text-white shadow-md">
          Quick Batch
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`rounded-full p-3 shadow-md ${
              isReelOrder
                ? theme === "dark"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-gradient-to-br from-indigo-400 to-purple-500"
                : "bg-gradient-to-br from-emerald-600 to-green-700"
            }`}
          >
            <svg
              className={`h-6 w-6 text-white`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isReelOrder ? (
                // Video icon for Quick Batchs
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              ) : (
                // Clipboard icon for regular orders
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              )}
            </svg>
          </div>
          <div>
            <p
              className={`text-base font-bold sm:text-lg ${
                theme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {isReelOrder ? "Quick Batch" : "Batch"} #
              {order.id.slice(0, 6).toUpperCase()}
            </p>
            <p
              className={`text-sm ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {isReelOrder
                ? `${order.quantity || 1} quantity • ${
                    order.reel?.title || "Quick Batch"
                  }`
                : `${order.items} items`}{" "}
              • {formatCurrencySync(order.estimatedEarnings || 0)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p
            className={`text-lg font-semibold ${
              isReelOrder
                ? theme === "dark"
                  ? "text-indigo-400"
                  : "text-indigo-600"
                : theme === "dark"
                ? "text-emerald-400"
                : "text-emerald-600"
            }`}
          >
            {formatCurrencySync(order.estimatedEarnings || 0)}
          </p>
          <p
            className={`text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Estimated earnings
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div
          className={`flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 ${
                theme === "dark" ? "bg-slate-600" : "bg-white"
              }`}
            >
              <svg
                className={`h-4 w-4 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-500"
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
            </div>
            <div>
              <p
                className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {isReelOrder ? "Pickup Location" : "Pickup Location"}
              </p>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {isReelOrder
                  ? `From: ${order.customerName || "Reel Creator"}`
                  : `${order.shopName}, ${order.shopAddress}`}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-700`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 ${
                theme === "dark" ? "bg-slate-600" : "bg-white"
              }`}
            >
              <svg
                className={`h-4 w-4 ${
                  theme === "dark" ? "text-slate-300" : "text-slate-500"
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
            </div>
            <div>
              <p className={`text-sm font-medium`}>Delivery Location</p>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {order.customerName}, {order.customerAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Show delivery note for Quick Batchs */}
        {isReelOrder && order.deliveryNote && (
          <div
            className={`flex items-center justify-between rounded-lg p-3 ${
              theme === "dark" ? "bg-amber-900/20" : "bg-amber-50"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`rounded-full p-2 ${
                  theme === "dark" ? "bg-amber-600" : "bg-amber-100"
                }`}
              >
                <svg
                  className={`h-4 w-4 ${
                    theme === "dark" ? "text-amber-300" : "text-amber-600"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <p
                  className={`text-sm font-medium ${
                    theme === "dark" ? "text-amber-300" : "text-amber-800"
                  }`}
                >
                  Delivery Note
                </p>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-amber-200" : "text-amber-700"
                  }`}
                >
                  {order.deliveryNote}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delivery Countdown */}
      {order.deliveryTime && (
        <div className="mt-3 flex items-center justify-center">
          {(() => {
            const countdown = getDeliveryCountdown(
              order.deliveryTime,
              currentTime
            );
            return (
              <div
                className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                  countdown.isOverdue
                    ? "border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                    : countdown.minutes <= 30
                    ? "border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                    : "border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                <svg
                  className={`h-4 w-4 ${
                    countdown.isOverdue
                      ? "text-red-600 dark:text-red-400"
                      : countdown.minutes <= 30
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                <span
                  className={`text-sm font-medium ${
                    countdown.isOverdue
                      ? "text-red-800 dark:text-red-300"
                      : countdown.totalMinutes <= 30
                      ? "text-amber-800 dark:text-amber-300"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {countdown.isOverdue
                    ? "OVERDUE"
                    : countdown.totalMinutes <= 30
                    ? `${countdown.totalMinutes}m left`
                    : countdown.hours > 0
                    ? `${countdown.hours}h ${countdown.minutes}m left`
                    : `${countdown.minutes}m left`}
                </span>
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <a
          href={`https://maps.google.com/?q=${order.customerLat},${order.customerLng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-3 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="mr-1 h-4 w-4"
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
