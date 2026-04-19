import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import { BatchAvatar } from "./BatchAvatar";
import { StatusBadge } from "./StatusBadge";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface Order {
  id: string;
  OrderID: string | number;
  orderIDs?: Array<string | number>;
  status: string;
  createdAt: string;
  deliveryTime?: string;
  shopName: string;
  shopNames?: string[];
  shopAddress: string;
  shopLat: number;
  shopLng: number;
  customerName: string;
  customerNames?: string[];
  customerAddress: string;
  customerAddresses?: string[];
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?: "regular" | "reel" | "restaurant" | "combined" | "business";
}

const formatOrderIdsForDisplay = (order: Order): string => {
  if (order.orderType === "combined" && order.orderIDs?.length) {
    const ids = order.orderIDs.map((x) => String(x));
    if (ids.length === 2) return `#${ids[0]} & #${ids[1]}`;
    return ids.map((x) => `#${x}`).join(", ");
  }
  return `#${String(order.OrderID)}`;
};

const renderCustomerNames = (order: Order) => {
  const names = order.customerNames?.length
    ? order.customerNames
    : [order.customerName];
  const unique = Array.from(
    new Set(names.map((n) => n?.trim()).filter(Boolean))
  ) as string[];
  if (unique.length <= 1) return unique[0] || order.customerName;
  return (
    <div className="flex flex-col gap-0.5">
      {unique.map((name) => (
        <div key={name} className="leading-tight">
          {name}
        </div>
      ))}
    </div>
  );
};

const renderCustomerAddresses = (order: Order) => {
  const addresses = order.customerAddresses?.length
    ? order.customerAddresses
    : [order.customerAddress];
  const unique = Array.from(
    new Set(addresses.map((a) => a?.trim()).filter(Boolean))
  ) as string[];
  if (unique.length <= 1) return unique[0] || order.customerAddress;
  return (
    <div className="flex flex-col gap-0.5">
      {unique.map((addr) => (
        <div key={addr} className="leading-tight">
          {addr}
        </div>
      ))}
    </div>
  );
};

interface BatchTableDesktopProps {
  orders: Order[];
}

const ORDER_TYPE_CONFIG = {
  reel: {
    label: "Reel",
    gradient: "from-violet-500 to-purple-600",
    dot: "bg-violet-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    ),
  },
  restaurant: {
    label: "Restaurant",
    gradient: "from-orange-500 to-red-500",
    dot: "bg-orange-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
      />
    ),
  },
  business: {
    label: "Business",
    gradient: "from-blue-500 to-indigo-600",
    dot: "bg-blue-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    ),
  },
  combined: {
    label: "Combined",
    gradient: "from-amber-500 to-yellow-500",
    dot: "bg-amber-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16"
      />
    ),
  },
  regular: {
    label: "Regular",
    gradient: "from-emerald-500 to-green-600",
    dot: "bg-emerald-400",
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    ),
  },
};

function OrderTypePill({ order }: { order: Order }) {
  const displayType =
    order.orderType === "combined" &&
    (!order.orderIDs || order.orderIDs.length <= 1)
      ? "regular"
      : order.orderType ?? "regular";

  const config =
    ORDER_TYPE_CONFIG[displayType as keyof typeof ORDER_TYPE_CONFIG] ??
    ORDER_TYPE_CONFIG.regular;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${config.gradient} px-2.5 py-1 text-xs font-semibold text-white shadow-sm`}
    >
      <svg
        className="h-3 w-3 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {config.icon}
      </svg>
      {config.label}
    </span>
  );
}

export function BatchTableDesktop({ orders }: BatchTableDesktopProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const formatTime = (dateString?: string, order?: Order) => {
    if (!dateString) {
      if (order?.orderType === "business") return "Within 2h";
      return "—";
    }
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateDistance = (order: Order) => {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const lat1 = order.shopLat || 0;
    const lon1 = order.shopLng || 0;
    const lat2 = order.customerLat || 0;
    const lon2 = order.customerLng || 0;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1
      ? `${Math.round(distance * 1000)} m`
      : `${distance.toFixed(1)} km`;
  };

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-4">
      {/* ── Table Card ── */}
      <div
        className="overflow-hidden rounded-2xl transition-all duration-300"
        style={{
          background: isDark
            ? "rgba(23,23,23,0.85)"
            : "rgba(245,245,245,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
          boxShadow: isDark
            ? "0 8px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset"
            : "0 8px 32px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.8) inset",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* ── Header ── */}
            <thead>
              <tr
                style={{
                  background: isDark
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(0,0,0,0.02)",
                  borderBottom: isDark
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {[
                  "Order",
                  "Type",
                  "Customer",
                  "Shop",
                  "Distance",
                  "Delivery Time",
                  "Address",
                  "Status",
                  "",
                ].map((col, i) => (
                  <th
                    key={i}
                    className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {currentOrders.map((order, idx) => (
                <tr
                  key={order.id}
                  className="group transition-colors duration-150"
                  style={{
                    borderBottom: isDark
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "1px solid rgba(0,0,0,0.04)",
                    backgroundColor:
                      idx % 2 === 0
                        ? "transparent"
                        : isDark
                        ? "rgba(255,255,255,0.015)"
                        : "rgba(0,0,0,0.012)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      isDark
                        ? "rgba(16,185,129,0.06)"
                        : "rgba(16,185,129,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      idx % 2 === 0
                        ? "transparent"
                        : isDark
                        ? "rgba(255,255,255,0.015)"
                        : "rgba(0,0,0,0.012)";
                  }}
                >
                  {/* Order ID */}
                  <td className="px-5 py-4">
                    <Link
                      href={`/Plasa/active-batches/batch/${order.id}`}
                      className="group/link flex items-center gap-2"
                    >
                      <span
                        className="rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide transition-all duration-200 group-hover/link:shadow-md"
                        style={{
                          background: isDark
                            ? "rgba(16,185,129,0.15)"
                            : "rgba(16,185,129,0.12)",
                          color: isDark ? "#34d399" : "#059669",
                          border: isDark
                            ? "1px solid rgba(52,211,153,0.2)"
                            : "1px solid rgba(5,150,105,0.15)",
                        }}
                      >
                        {formatOrderIdsForDisplay(order)}
                      </span>
                    </Link>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">
                    <OrderTypePill order={order} />
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <BatchAvatar name={order.customerName} size="sm" />
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {renderCustomerNames(order)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Shop */}
                  <td className="px-5 py-4">
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {order.shopName || "—"}
                    </span>
                  </td>

                  {/* Distance */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span
                        className="text-sm font-semibold tabular-nums"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {calculateDistance(order)}
                      </span>
                    </div>
                  </td>

                  {/* Delivery Time */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="h-3.5 w-3.5 flex-shrink-0"
                        style={{ color: "var(--text-secondary)" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6l4 2"
                        />
                      </svg>
                      <span
                        className="text-sm font-medium tabular-nums"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatTime(order.deliveryTime, order)}
                      </span>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="max-w-[200px] px-5 py-4">
                    <span
                      className="block truncate text-sm"
                      style={{ color: "var(--text-secondary)" }}
                      title={order.customerAddress}
                    >
                      {renderCustomerAddresses(order)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    <Link href={`/Plasa/active-batches/batch/${order.id}`}>
                      <button
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all duration-200 active:scale-95 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5"
                        style={{
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                        }}
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Empty Table State ── */}
        {currentOrders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "var(--bg-secondary)" }}
            >
              <svg
                className="h-8 w-8"
                style={{ color: "var(--text-secondary)" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p
              className="text-base font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              No orders to display
            </p>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Active batches will appear here
            </p>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-between rounded-2xl px-5 py-3.5 transition-all duration-300"
          style={{
            background: isDark ? "rgba(23,23,23,0.8)" : "rgba(255,255,255,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.06)"
              : "1px solid rgba(0,0,0,0.06)",
            boxShadow: isDark
              ? "0 4px 16px rgba(0,0,0,0.3)"
              : "0 4px 16px rgba(0,0,0,0.05)",
          }}
        >
          {/* Count */}
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Showing{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {startIndex + 1}–{Math.min(endIndex, orders.length)}
            </span>{" "}
            of{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {orders.length}
            </span>{" "}
            batches
          </p>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
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
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, idx) =>
              page === "..." ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="flex h-9 w-9 items-center justify-center text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  …
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page as number)}
                  className="flex h-9 min-w-[36px] items-center justify-center rounded-xl px-1 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
                  style={
                    currentPage === page
                      ? {
                          background:
                            "linear-gradient(135deg, #10b981, #059669)",
                          color: "#fff",
                          boxShadow: "0 4px 12px rgba(16,185,129,0.35)",
                        }
                      : {
                          background: "var(--bg-secondary)",
                          color: "var(--text-secondary)",
                        }
                  }
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: "var(--bg-secondary)",
                color: "var(--text-secondary)",
              }}
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
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
