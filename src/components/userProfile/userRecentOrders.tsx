import React, { useState } from "react";
import { Tag, Button } from "rsuite";
import Link from "next/link";
import { formatCurrency } from "../../lib/formatCurrency";
import { useRouter } from "next/router";

// Define the shape of an order including assignment status and external OrderID
type Order = {
  id: string;
  OrderID: string;
  status: string;
  created_at: string;
  delivery_time: string;
  total: number;
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture: string;
  };
  shop: {
    id: string;
    name: string;
    address: string;
    image: string;
  } | null;
  itemsCount: number;
  unitsCount: number;
  shopper_id: string | null;
  service_fee?: number;
  delivery_fee?: number;
  orderType?: "regular" | "reel" | "restaurant";
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
  delivery_note?: string;
  discount?: number;
  voucher_code?: string;
  found?: boolean;
};

// Props for the UserRecentOrders component
interface UserRecentOrdersProps {
  filter: string;
  orders: Order[];
  loading: boolean;
  onRefresh?: () => void;
}

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

// Helper to display estimated delivery time
function EstimatedDelivery({
  deliveryTime,
  status,
}: {
  deliveryTime: string;
  status: string;
}) {
  if (!deliveryTime) return null;
  if (status === "delivered") {
    return <span className="font-medium text-green-600">Delivered</span>;
  }

  const now = new Date();
  const est = new Date(deliveryTime);
  const diffMs = est.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <span className="font-medium text-red-500">Delivery time exceeded</span>
    );
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text: string;
  if (days > 0) {
    text = `Delivery in ${days} day${days > 1 ? "s" : ""}${
      hours > 0 ? ` ${hours}h` : ""
    }`;
  } else if (hours > 0) {
    text = `Delivery in ${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  } else {
    text = `Delivery in ${mins} minutes`;
  }

  return (
    <div className="flex items-center gap-1">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4 text-green-500"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span className="font-medium text-green-600">{text}</span>
    </div>
  );
}

// Helper to pad order IDs to at least 4 digits, with fallback
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  // pad to at least 4 characters
  return s.length >= 4 ? s : s.padStart(4, "0");
}

export default function UserRecentOrders({
  filter,
  orders = [],
  loading,
  onRefresh,
}: UserRecentOrdersProps) {
  const { pathname } = useRouter();
  const isPendingOrdersPage = pathname === "/CurrentPendingOrders";
  // Pagination state: show initial 10 orders, then load more in increments of 10
  const [visibleCount, setVisibleCount] = useState(10);
  // Apply filter once, then slice for pagination
  const filteredOrders = orders.filter((order: Order) =>
    filter === "pending"
      ? order.status !== "delivered"
      : order.status === "delivered"
  );
  const visibleOrders = filteredOrders.slice(0, visibleCount);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Orders
        </h3>
        {onRefresh && (
          <Button
            appearance="link"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
          >
            Refresh
          </Button>
        )}
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-4 animate-pulse rounded-xl border border-gray-200 bg-transparent p-4 shadow-md transition-colors duration-200 dark:border-gray-700 dark:bg-transparent"
            >
              <div className="mb-2 h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-4 h-3 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-1/6 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">No orders found.</p>
      ) : (
        visibleOrders.map((order: Order) => (
          <div
            key={order.id}
            className="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-green-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-700"
          >
            {/* Shop Profile for Regular Orders */}
            {order.shop && order.orderType === "regular" ? (
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    viewBox="0 0 0.6 0.6"
                    data-name="Layer 1"
                    id="Layer_1"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                  >
                    <title />
                    <path d="M0.138 0.125 0.125 0.075H0.031a0.025 0.025 0 0 0 0 0.05h0.056L0.168 0.45H0.5v-0.05H0.207l-0.008 -0.034L0.525 0.304V0.125ZM0.475 0.263 0.186 0.318 0.15 0.175h0.325ZM0.175 0.475a0.038 0.038 0 1 0 0.038 0.038A0.038 0.038 0 0 0 0.175 0.475m0.3 0a0.038 0.038 0 1 0 0.038 0.038A0.038 0.038 0 0 0 0.475 0.475" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {order?.shop?.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order?.shop?.address}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Restaurant Profile for Restaurant Orders */}
            {order.shop && order.orderType === "restaurant" ? (
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
                  <svg
                    className="h-6 w-6 text-orange-600 dark:text-orange-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 2h7l4 9H8l-2 4.5c-.3.8-1.5.8-1.8 0L3 11H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" />
                    <path d="M12 2h7l-4 9h4l-2 4.5c-.3.8-1.5.8-1.8 0L12 11h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {order?.shop?.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order?.shop?.address}
                  </div>
                  {order.delivery_note && (
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Note: {order.delivery_note}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Reel Profile for Reel Orders */}
            {order.orderType === "reel" && order.reel ? (
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <svg
                    className="h-6 w-6 text-purple-600 dark:text-purple-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {order.reel.title}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {order.reel.description}
                  </div>
                  {order.delivery_note && (
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Note: {order.delivery_note}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Order Info */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Order #{formatOrderID(order?.OrderID)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {timeAgo(order?.created_at)}
                </span>
              </div>
              {/* Status Badge: Pending when no shopper, Ongoing when assigned, Completed when done */}
              {(() => {
                const isDone = order.status === "delivered";
                const isAssigned = !!order?.shopper_id;
                if (isDone) {
                  return (
                    <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                        Completed
                      </span>
                    </div>
                  );
                } else if (!isAssigned) {
                  return (
                    <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 dark:bg-yellow-900/30">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                        Pending
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 dark:bg-blue-900/30">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                        Ongoing
                      </span>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {order.orderType === "reel"
                        ? `${order.quantity || 1} quantity`
                        : order.orderType === "restaurant"
                        ? `${order.itemsCount} dishes (${order.unitsCount} items)`
                        : `${order.itemsCount} items (${order.unitsCount} units)`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.orderType === "reel" ? "Reel Order" : order.orderType === "restaurant" ? "Restaurant Order" : "Grocery Order"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            {order.delivery_time && (
              <div className="mb-3">
                <EstimatedDelivery
                  deliveryTime={order.delivery_time}
                  status={order.status}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href={`/CurrentPendingOrders/viewOrderDetails/${order.id}`}
                className={`group flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold !text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  order.orderType === "reel"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus:ring-purple-500 shadow-lg hover:shadow-purple-200 dark:shadow-purple-900/50"
                    : order.orderType === "restaurant"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500 shadow-lg hover:shadow-orange-200 dark:shadow-orange-900/50"
                    : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg hover:shadow-green-200 dark:shadow-green-900/50"
                }`}
              >
                <svg className="h-4 w-4 !text-white transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </Link>

              {!isPendingOrdersPage && (
                <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-500">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))
      )}
      {/* Load more button for pagination */}
      {filteredOrders.length > visibleCount && (
        <div className="mt-4 text-center">
          <Button
            appearance="ghost"
            onClick={() => setVisibleCount((prev) => prev + 10)}
            className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-500"
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
}
