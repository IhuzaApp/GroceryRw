"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button, Panel, Badge, Loader, toaster, Message } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useAuth } from "../../context/AuthContext";

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
  const fetchedRef = useRef(false);

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
        const response = await fetch(
          "http://localhost:3003/api/shopper/activeBatches",
          {
            signal,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch active batches");
        }

        const data = await response.json();
        setActiveOrders(data);
      } catch (err) {
        // Don't set error if it was canceled
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Error fetching active batches:", err);
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        toaster.push(
          <Message showIcon type="error" header="Error">
            Failed to load active batches.
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

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
            {error}
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
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">No Active Batches</h3>
            <p className="mb-4 text-gray-500">
              You don&#39;t have any active batches at the moment.
            </p>
            <Link href="/Plasa">
              <button className="rounded-md bg-[#125C13] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0A400B]">
                Find Orders
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function ActiveOrderCard({ order }: { order: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge
            content="Accepted"
            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
          />
        );
      case "picked":
        return (
          <Badge
            content="Picked Up"
            className="rounded bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800"
          />
        );
      case "at_customer":
        return (
          <Badge
            content="At Customer"
            className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-800"
          />
        );
      default:
        return null;
    }
  };

  const getNextActionButton = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="rounded-md bg-[#125C13] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0A400B]">
              Start Shopping
            </button>
          </Link>
        );
      case "picked":
      case "shopping":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="rounded-md bg-[#125C13] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0A400B]">
              View Details
            </button>
          </Link>
        );
      case "at_customer":
      case "on_the_way":
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="rounded-md bg-[#125C13] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0A400B]">
              Confirm Delivery
            </button>
          </Link>
        );
      default:
        return (
          <Link href={`/Plasa/active-batches/batch/${order.id}`}>
            <button className="rounded-md bg-[#125C13] px-4 py-2 font-medium text-white transition-colors hover:bg-[#0A400B]">
              View Details
            </button>
          </Link>
        );
    }
  };

  return (
    <Panel shaded bordered bodyFill className="overflow-hidden">
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-bold">{order.id}</h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="mt-1 text-sm text-gray-500">{order.createdAt}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600">
              {order.estimatedEarnings}
            </p>
            <p className="text-xs text-gray-500">{order.items} items</p>
          </div>
        </div>

        <div className="mb-3 flex items-center">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-green-600"
            >
              <path d="M3 3h18v18H3zM16 8h.01M8 16h.01M16 16h.01" />
            </svg>
          </div>
          <div>
            <p className="font-medium">{order.shopName}</p>
            <p className="text-xs text-gray-500">{order.shopAddress}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center">
          <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 text-blue-600"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-xs text-gray-500">{order.customerAddress}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <a
            href={`https://maps.google.com/?q=${order.customerLat},${order.customerLng}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button appearance="ghost" className="flex items-center">
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
            </Button>
          </a>
          {getNextActionButton(order.status)}
        </div>
      </div>
    </Panel>
  );
}
