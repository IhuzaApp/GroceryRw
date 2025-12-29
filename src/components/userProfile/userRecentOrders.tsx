import React, { useState, useEffect } from "react";
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
  assignedTo?: {
    id: string;
    name: string;
    phone?: string;
    profile_photo?: string;
    rating?: number;
    orders_aggregate?: {
      aggregate?: {
        count?: number;
      };
    };
  } | null;
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
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 4;
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filter and search
  const filteredOrders = orders.filter((order: Order) => {
    // Apply status filter
    // For "Ongoing" (pending filter): show only assigned orders that are not delivered
    // For "Completed" (done filter): show only delivered orders
    const isAssigned = !!order?.shopper_id || !!order?.assignedTo;
    const matchesFilter =
      filter === "pending"
        ? order.status !== "delivered" && isAssigned
        : order.status === "delivered";

    // Apply search filter
    if (!searchQuery.trim()) return matchesFilter;

    const query = searchQuery.toLowerCase();
    const orderId = formatOrderID(order?.OrderID).toLowerCase();
    const shopName = order?.shop?.name?.toLowerCase() || "";
    const reelTitle = order?.reel?.title?.toLowerCase() || "";
    const total = formatCurrency(order.total).toLowerCase();

    return (
      matchesFilter &&
      (orderId.includes(query) ||
        shopName.includes(query) ||
        reelTitle.includes(query) ||
        total.includes(query))
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const visibleOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter]);

  return (
    <>
      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Orders
          </h3>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <svg
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders by ID, shop name, or amount..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-all duration-200 placeholder:text-gray-400 focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-green-400 dark:focus:ring-green-400/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
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
            className="group mb-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-700"
          >
            {/* Shop Profile for Regular Orders */}
            {order.shop && order.orderType === "regular" ? (
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-4 w-4 text-green-600 dark:text-green-400"
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
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {order?.shop?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {order?.shop?.address}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Restaurant Profile for Restaurant Orders */}
            {order.shop && order.orderType === "restaurant" ? (
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <svg
                    className="h-4 w-4 text-orange-600 dark:text-orange-400"
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
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {order?.shop?.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {order?.shop?.address}
                  </div>
                  {order.delivery_note && (
                    <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      Note: {order.delivery_note}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Reel Profile for Reel Orders */}
            {order.orderType === "reel" && order.reel ? (
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <svg
                    className="h-4 w-4 text-purple-600 dark:text-purple-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {order.reel.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {order.reel.description}
                  </div>
                  {order.delivery_note && (
                    <div className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                      Note: {order.delivery_note}
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            {/* Order Info */}
            <div className="mb-2 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Order #{formatOrderID(order?.OrderID)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {timeAgo(order?.created_at)}
                </span>
              </div>
              {/* Shopper Details or Status Badge */}
              {(() => {
                const isDone = order.status === "delivered";
                const isAssigned = !!order?.shopper_id || !!order?.assignedTo;

                if (isDone) {
                  return (
                    <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 dark:bg-green-900/30">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      <span className="text-xs font-semibold text-green-700 dark:text-green-300">
                        Completed
                      </span>
                    </div>
                  );
                } else if (isAssigned && order.assignedTo) {
                  // Show shopper details when assigned
                  return (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
                        {order.assignedTo.profile_photo ? (
                          <img
                            src={order.assignedTo.profile_photo}
                            alt={order.assignedTo.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <svg
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {order.assignedTo.name}
                        </span>
                        {order.assignedTo.rating && (
                          <div className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {order.assignedTo.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else if (!isAssigned) {
                  return (
                    <div className="flex items-center gap-1.5 rounded-full bg-yellow-100 px-2 py-1 dark:bg-yellow-900/30">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                      <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
                        Pending
                      </span>
                    </div>
                  );
                } else {
                  // Assigned but no assignedTo details available
                  return (
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-100 px-2 py-1 dark:bg-blue-900/30">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                        Assigned
                      </span>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="mb-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <svg
                      className="h-3 w-3 text-green-600 dark:text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                      {order.orderType === "reel"
                        ? `${order.quantity || 1} quantity`
                        : order.orderType === "restaurant"
                        ? `${order.itemsCount} dishes (${order.unitsCount} items)`
                        : `${order.itemsCount} items (${order.unitsCount} units)`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.orderType === "reel"
                        ? "Reel Order"
                        : order.orderType === "restaurant"
                        ? "Restaurant Order"
                        : "Grocery Order"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(order.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Total
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Time */}
            {order.delivery_time && (
              <div className="mb-1.5">
                <EstimatedDelivery
                  deliveryTime={order.delivery_time}
                  status={order.status}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Link
                href={`/CurrentPendingOrders/viewOrderDetails/${order.id}`}
                className={`group flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold !text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  order.orderType === "reel"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600 shadow-md hover:from-purple-600 hover:to-purple-700 hover:shadow-purple-200 focus:ring-purple-500 dark:shadow-purple-900/50"
                    : order.orderType === "restaurant"
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 shadow-md hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-200 focus:ring-orange-500 dark:shadow-orange-900/50"
                    : "bg-gradient-to-r from-green-500 to-green-600 shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-green-200 focus:ring-green-500 dark:shadow-green-900/50"
                }`}
              >
                <svg
                  className="h-3 w-3 !text-white transition-transform group-hover:scale-110"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View Details
              </Link>

              {!isPendingOrdersPage && (
                <button className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-700">
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))
      )}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // Show first page, last page, current page, and pages around current
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg border text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return (
                <span
                  key={page}
                  className="flex h-9 w-9 items-center justify-center text-gray-500"
                >
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
