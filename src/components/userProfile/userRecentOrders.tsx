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
  pin?: string;
  combined_order_id?: string | null;
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

// Type for grouped orders (either single or combined)
type OrderGroup = {
  id: string; // For single orders, this is order.id; for combined, it's combined_order_id
  is_combined: boolean;
  orders: Order[];
  total: number;
  created_at: string;
  status: string;
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

// Helper to display estimated delivery time with real-time countdown
function EstimatedDelivery({
  deliveryTime,
  status,
}: {
  deliveryTime: string;
  status: string;
}) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Update every second
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!deliveryTime) return null;
  if (status === "delivered") {
    return <span className="font-medium text-green-600">Delivered</span>;
  }

  const est = new Date(deliveryTime);
  const diffMs = est.getTime() - currentTime;
  const isLate = diffMs <= 0;
  
  // Calculate time difference
  const absMs = Math.abs(diffMs);
  const days = Math.floor(absMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((absMs % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((absMs % (1000 * 60)) / 1000);

  // Format countdown
  let countdownText: string;
  if (days > 0) {
    countdownText = `${isLate ? "-" : "+"}${days}d ${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  } else {
    countdownText = `${isLate ? "-" : "+"}${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return (
    <div className="flex items-center gap-1">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={`h-4 w-4 ${isLate ? "text-red-500" : "text-green-500"}`}
      >
        {isLate ? (
          <>
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 8v4M12 16h.01"></path>
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </>
        )}
      </svg>
      <span className={`font-bold tabular-nums ${isLate ? "!text-red-500" : "!text-green-600"}`}>
        {countdownText}
      </span>
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
    // For "Ongoing" (pending filter): show all orders that are not delivered (includes unassigned)
    // For "Completed" (done filter): show only delivered orders
    const matchesFilter =
      filter === "pending"
        ? order.status !== "delivered"
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

  // Group orders by combined_order_id
  const groupOrders = (orders: Order[]): OrderGroup[] => {
    const grouped: { [key: string]: Order[] } = {};
    const singles: Order[] = [];

    orders.forEach((order) => {
      if (order.combined_order_id) {
        if (!grouped[order.combined_order_id]) {
          grouped[order.combined_order_id] = [];
        }
        grouped[order.combined_order_id].push(order);
      } else {
        singles.push(order);
      }
    });

    // Convert grouped orders to OrderGroup format
    const groupedOrders: OrderGroup[] = Object.entries(grouped).map(
      ([combinedId, groupOrders]) => {
        const totalAmount = groupOrders.reduce((sum, o) => sum + o.total, 0);
        const earliestDate = groupOrders.reduce((earliest, o) =>
          new Date(o.created_at) < new Date(earliest.created_at) ? o : earliest
        ).created_at;
        // Combined order status is "delivered" only if ALL orders are delivered
        const allDelivered = groupOrders.every((o) => o.status === "delivered");
        return {
          id: combinedId,
          is_combined: true,
          orders: groupOrders.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          ),
          total: totalAmount,
          created_at: earliestDate,
          status: allDelivered ? "delivered" : "pending",
        };
      }
    );

    // Add single orders
    const singleOrders: OrderGroup[] = singles.map((order) => ({
      id: order.id,
      is_combined: false,
      orders: [order],
      total: order.total,
      created_at: order.created_at,
      status: order.status,
    }));

    // Combine and sort by date (newest first)
    return [...groupedOrders, ...singleOrders].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  const orderGroups = groupOrders(filteredOrders);

  // Calculate pagination
  const totalPages = Math.ceil(orderGroups.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const visibleOrderGroups = orderGroups.slice(startIndex, endIndex);

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
        visibleOrderGroups.map((group: OrderGroup) =>
          group.is_combined ? (
            // Combined Orders Group - Simple Card Design
            <Link
              key={group.id}
              href={`/CurrentPendingOrders/viewOrderDetails/${group.orders[0]?.id}`}
              className="group mb-2 block overflow-hidden border-b border-green-200 bg-gradient-to-r from-green-50/80 to-emerald-50/80 p-4 transition-all duration-300 hover:from-green-50 hover:to-emerald-50 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 md:mb-3 md:rounded-xl md:border-2 md:shadow-md md:hover:shadow-xl"
            >
              <div className="flex items-center gap-3">
                {/* Group Image - Overlapping shop images */}
                <div className="relative flex-shrink-0">
                  {group.orders.slice(0, 3).map((order, idx) => (
                    <div
                      key={order.id}
                      className="absolute"
                      style={{
                        left: `${idx * 14}px`,
                        zIndex: 3 - idx,
                      }}
                    >
                      {order.shop?.image ? (
                        <img
                          src={order.shop.image}
                          alt={order.shop.name}
                          className="h-12 w-12 rounded-lg border-2 border-white object-cover shadow-md dark:border-gray-800 md:h-10 md:w-10"
                          onError={(e) => {
                            e.currentTarget.src = "/images/shop-placeholder.jpg";
                          }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-white bg-gradient-to-br from-green-100 to-emerald-100 shadow-md dark:border-gray-800 dark:from-green-900/50 dark:to-emerald-900/50 md:h-10 md:w-10">
                          <svg
                            className="h-6 w-6 text-green-600 dark:text-green-400 md:h-5 md:w-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* Spacer to account for overlapping images */}
                  <div
                    className="h-12 md:h-10"
                    style={{
                      width: `${Math.min(group.orders.length, 3) * 14 + 34}px`,
                    }}
                  ></div>
                </div>

                {/* Order Details - Left Column */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                    {group.orders.length === 1
                      ? group.orders[0]?.shop?.name || "Unknown Shop"
                      : group.orders.length === 2
                      ? `${group.orders[0]?.shop?.name} & ${group.orders[1]?.shop?.name}`
                      : `${group.orders[0]?.shop?.name} & ${group.orders.length - 1} others`}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {group.orders.reduce((sum, o) => sum + (o.unitsCount || 0), 0)} units • {group.orders.length} {group.orders.length === 1 ? 'store' : 'stores'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    ID {group.orders.map((o, idx) => (
                      <span key={o.id}>
                        #{formatOrderID(o?.OrderID)}
                        {idx < group.orders.length - 1 ? ' & ' : ''}
                      </span>
                    ))}
                  </div>
                </div>

                {/* PIN Display for Combined Orders */}
                {group.orders[0]?.pin && (
                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-green-400 bg-gradient-to-br from-green-50 to-green-100 px-2.5 py-1 dark:border-green-600 dark:from-green-900/30 dark:to-green-800/20">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                      PIN
                    </span>
                    <span className="text-lg font-black leading-none tracking-wider text-green-700 dark:text-green-300">
                      {group.orders[0].pin}
                    </span>
                  </div>
                )}

                {/* Time and Price - Right Column */}
                <div className="flex flex-col items-end gap-0.5 text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {timeAgo(group.created_at)}
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(group.total)}
                  </div>
                </div>
              </div>
              
              {/* Delivery Time */}
              {group.orders[0]?.delivery_time && (
                <div className="mt-3 flex items-center justify-between border-t border-green-100 pt-2 dark:border-green-800/30">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    Expected Delivery:
                  </span>
                  <EstimatedDelivery
                    deliveryTime={group.orders[0].delivery_time}
                    status={group.status}
                  />
                </div>
              )}
            </Link>
          ) : (
            // Single Order (Original Display)
            group.orders.map((order: Order) => (
              <Link
                key={order.id}
                href={`/CurrentPendingOrders/viewOrderDetails/${order.id}`}
                className="group mb-2 block overflow-hidden border-b border-gray-200 bg-white p-4 transition-all duration-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-800/80 md:mb-2 md:rounded-lg md:border md:p-3 md:shadow-sm md:hover:border-green-200 md:hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  {/* Shop Image */}
                  {order.shop && (
                    <div className="flex-shrink-0">
                      {order.shop.image ? (
                        <img
                          src={order.shop.image}
                          alt={order.shop.name}
                          className="h-12 w-12 rounded-lg object-cover md:h-10 md:w-10"
                          onError={(e) => {
                            // Fallback to placeholder if image fails
                            e.currentTarget.src = "/images/shop-placeholder.jpg";
                          }}
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700 md:h-10 md:w-10">
                          <svg
                            className="h-6 w-6 text-gray-400 dark:text-gray-500 md:h-5 md:w-5"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Details - Left Column */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {order.orderType === "reel" && order.reel
                        ? order.reel.title
                        : order?.shop?.name || "Unknown Shop"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {order.unitsCount || 0} {order.unitsCount === 1 ? 'unit' : 'units'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID #{formatOrderID(order?.OrderID)}
                    </div>
                  </div>

                  {/* PIN Display */}
                  {order?.pin && (
                    <div className="flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-green-400 bg-gradient-to-br from-green-50 to-green-100 px-2.5 py-1 dark:border-green-600 dark:from-green-900/30 dark:to-green-800/20">
                      <span className="text-[9px] font-bold uppercase tracking-wide text-green-600 dark:text-green-400">
                        PIN
                      </span>
                      <span className="text-lg font-black leading-none tracking-wider text-green-700 dark:text-green-300">
                        {order.pin}
                      </span>
                    </div>
                  )}

                  {/* Time and Price - Right Column */}
                  <div className="flex flex-col items-end gap-0.5 text-right">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {timeAgo(order?.created_at)}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </div>
                  </div>
                </div>
                
                {/* Delivery Time */}
                {order?.delivery_time && (
                  <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 dark:border-gray-700">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      Expected Delivery:
                    </span>
                    <EstimatedDelivery
                      deliveryTime={order.delivery_time}
                      status={order.status}
                    />
                  </div>
                )}
              </Link>
            ))
          )
        )
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
