"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Panel, Badge, Loader, toaster, Message } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

// Define interfaces for order data
interface Order {
  id: string;
  status: string;
  createdAt: string;
  shopName: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
}

interface ActiveBatchesProps {
  initialOrders?: Order[];
  initialError?: string | null;
}

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
          console.error("API Error Response:", response.status, errorData);
          throw new Error(
            `Failed to fetch active batches (${response.status}): ${
              errorData.error || response.statusText
            }`
          );
        }

        const data = await response.json();

        // Handle the new response format
        if (data.noOrdersFound) {
          // This is not an error, just no batches found
          setActiveOrders([]);
          console.log("No active batches found:", data.message);
        } else {
          // Normal array of orders
          setActiveOrders(Array.isArray(data) ? data : []);
        }

        setFetchAttempted(true);
      } catch (err) {
        // Don't set error if it was canceled
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Error fetching active batches:", err);
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

  return (
    <div className={`min-h-screen bg-gray-50 ${isMobile ? "pb-16" : ""}`}>
      {/* Main Content */}
      <main className="max-w-1xl mx-auto p-4">
        {/* Page Title - Desktop Only */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Active Batches</h1>
          <button className="rounded-full p-2 transition-colors hover:bg-gray-200">
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
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
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
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-800">
              Shopper Access Required
            </h3>
            <p className="mt-1 text-yellow-700">
              This page is only accessible to users with shopper privileges.
              Your current role is: <strong>{role}</strong>
            </p>
            <p className="mt-2 text-yellow-700">
              If you believe you should have shopper access, please try:
            </p>
            <ul className="mt-1 list-inside list-disc text-yellow-700">
              <li>Logging out and logging back in</li>
              <li>
                Checking with an administrator to verify your account type
              </li>
            </ul>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <h3 className="font-semibold text-red-800">
              There was a problem loading your batches
            </h3>
            <p className="mt-1 text-red-600">{error}</p>
            <div className="mt-3 text-sm text-red-700">
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
              className="mt-3 rounded bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader content="Loading orders..." />
          </div>
        ) : activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeOrders.map((order) => (
              <ActiveOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-8 w-8 text-gray-400"
              >
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Active Orders</h3>
            <p className="mb-4 text-gray-600">
              {fetchAttempted || initialOrders !== undefined
                ? "You don&apos;t have any active orders assigned to you at the moment. This includes orders in any state except &apos;PENDING&apos;, &apos;null&apos;, or &apos;delivered&apos;."
                : "Unable to fetch your active orders. Please try again."}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/Plasa">
                <button className="rounded-md bg-[#125C13] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0A400B]">
                  Return to Dashboard
                </button>
              </Link>
              {!fetchAttempted && !initialOrders.length && (
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100"
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

function ActiveOrderCard({ order }: { order: any }) {
  const { theme } = useTheme();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge
            content="Accepted"
            className={`rounded bg-blue-100 px-2 py-1 text-xs font-medium ${
              theme === 'dark' ? 'text-blue-800' : 'text-blue-800'
            }`}
          />
        );
      case "picked":
        return (
          <Badge
            content="Picked Up"
            className={`rounded bg-orange-100 px-2 py-1 text-xs font-medium ${
              theme === 'dark' ? 'text-orange-800' : 'text-orange-800'
            }`}
          />
        );
      case "at_customer":
        return (
          <Badge
            content="At Customer"
            className={`rounded bg-purple-100 px-2 py-1 text-xs font-medium ${
              theme === 'dark' ? 'text-purple-800' : 'text-purple-800'
            }`}
          />
        );
      default:
        return null;
    }
  };

  const getNextActionButton = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <Button
              appearance="primary"
              className={`rounded-md px-4 py-2 font-medium ${
                theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Start Shopping
            </Button>
          </Link>
        );
      case "picked":
      case "shopping":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <Button
              appearance="primary"
              className={`rounded-md px-4 py-2 font-medium ${
                theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              View Details
            </Button>
          </Link>
        );
      case "at_customer":
      case "on_the_way":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <Button
              appearance="primary"
              className={`rounded-md px-4 py-2 font-medium ${
                theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Confirm Delivery
            </Button>
          </Link>
        );
      default:
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <Button
              appearance="primary"
              className={`rounded-md px-4 py-2 font-medium ${
                theme === 'dark'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              View Details
            </Button>
          </Link>
        );
    }
  };

  return (
    <div className={`mb-4 rounded-lg border p-4 shadow-sm transition-colors duration-200 ${
      theme === 'dark' 
        ? 'border-gray-700 bg-gray-800 text-gray-100' 
        : 'border-gray-200 bg-white text-gray-900'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`rounded-full p-2 ${
            theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50'
          }`}>
            <svg
              className={`h-6 w-6 ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
              }`}
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
            <h3 className={`font-medium ${
              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
            }`}>
              Batch #{order.id}
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {order.items} items • {order.estimatedEarnings}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          }`}>
            ${order.estimatedEarnings}
          </p>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Estimated earnings
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className={`flex items-center justify-between rounded-lg p-3 ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`rounded-full p-2 ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-white'
            }`}>
              <svg
                className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Pickup Location
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {order.shopName}, {order.shopAddress}
              </p>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between rounded-lg p-3 ${
          theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`rounded-full p-2 ${
              theme === 'dark' ? 'bg-gray-600' : 'bg-white'
            }`}>
              <svg
                className={`h-5 w-5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
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
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Delivery Location
              </p>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {order.customerName}, {order.customerAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-3">
        {getNextActionButton(order.status)}
      </div>
    </div>
  );
}
