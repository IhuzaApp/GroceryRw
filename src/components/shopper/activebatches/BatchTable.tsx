import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";

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
  customerAddress: string;
  customerLat: number;
  customerLng: number;
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?: "regular" | "reel" | "restaurant" | "combined";
  invoiceUrl?: string;
}

const formatOrderIdsForDisplay = (order: Order): string => {
  if (order.orderType === "combined" && order.orderIDs?.length) {
    const ids = order.orderIDs.map((x) => String(x));
    if (ids.length === 2) return `#${ids[0]} & #${ids[1]}`;
    return ids.map((x) => `#${x}`).join(", ");
  }
  return `#${String(order.OrderID)}`;
};

const renderShopNames = (order: Order) => {
  const names = order.shopNames?.length ? order.shopNames : [order.shopName];
  const unique = Array.from(new Set(names.map((n) => n?.trim()).filter(Boolean))) as string[];
  if (unique.length <= 1) {
    return <span className="hover:underline">{unique[0] || order.shopName}</span>;
  }
  return (
    <div className="flex flex-col gap-0.5">
      {unique.map((name) => (
        <span key={name} className="leading-tight hover:underline">
          {name}
        </span>
      ))}
    </div>
  );
};

interface BatchTableProps {
  orders: Order[];
}

export function BatchTable({ orders }: BatchTableProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>(
    {}
  );
  const itemsPerPage = 25;

  // Update current time every second for real-time countdown
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Order Type Badge
  const OrderTypeBadge = ({ type }: { type?: string }) => {
    const configs = {
      reel: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-300",
        label: "Reel",
      },
      restaurant: {
        bg: "bg-orange-100 dark:bg-orange-900/30",
        text: "text-orange-700 dark:text-orange-300",
        label: "Restaurant",
      },
      regular: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
        label: "Regular",
      },
    };
    const config = configs[type as keyof typeof configs] || configs.regular;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full ${config.bg} px-2.5 py-1 text-xs font-medium ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  // Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string }> = {
      accepted: {
        bg: "bg-emerald-100 dark:bg-emerald-900/30",
        text: "text-emerald-700 dark:text-emerald-300",
      },
      shopping: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-700 dark:text-yellow-300",
      },
      on_the_way: {
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-300",
      },
      at_customer: {
        bg: "bg-indigo-100 dark:bg-indigo-900/30",
        text: "text-indigo-700 dark:text-indigo-300",
      },
    };
    const config = configs[status] || {
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-700 dark:text-gray-300",
    };

    return (
      <span
        className={`inline-flex rounded-full ${config.bg} px-2.5 py-1 text-xs font-medium ${config.text}`}
      >
        {status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  // Format currency
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Time Display Component
  const TimeDisplay = ({ deliveryTime }: { deliveryTime?: string }) => {
    if (!deliveryTime) {
      return <span className="text-sm text-gray-500">N/A</span>;
    }

    const deliveryDate = new Date(deliveryTime);
    const now = currentTime.getTime();
    const deliveryTimestamp = deliveryDate.getTime();
    const timeDiff = deliveryTimestamp - now;
    const isOverdue = timeDiff < 0;

    // Format time range (expected delivery ± 1 hour)
    const startTime = new Date(deliveryTimestamp - 60 * 60 * 1000);
    const endTime = new Date(deliveryTimestamp + 60 * 60 * 1000);
    const timeRange = `${startTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })} - ${endTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })}`;

    if (isOverdue) {
      const overdueMs = Math.abs(timeDiff);
      const days = Math.floor(overdueMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (overdueMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((overdueMs % (1000 * 60 * 60)) / (1000 * 60));

      let overdueText = "";
      if (days > 0) {
        overdueText = `${days}d ${hours}h overdue`;
      } else if (hours > 0) {
        overdueText = `${hours}h ${minutes}m overdue`;
      } else {
        overdueText = `${minutes}m overdue`;
      }

      return (
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">{timeRange}</span>
          <div className="mt-1 flex items-center gap-1.5">
            <svg
              className="h-4 w-4 flex-shrink-0 animate-pulse text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">
              {overdueText}
            </span>
          </div>
        </div>
      );
    }

    // Not overdue - show time range normally
    return (
      <div className="flex items-center gap-2 text-sm">
        <svg
          className="h-4 w-4 flex-shrink-0 text-gray-400"
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
        <span className="text-green-600 dark:text-green-400">{timeRange}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div
        className={`rounded-lg border ${
          theme === "dark" ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead
              className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}
            >
              <tr
                className={`border-b ${
                  theme === "dark" ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Shop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className={theme === "dark" ? "bg-gray-900" : "bg-white"}>
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b ${
                    theme === "dark"
                      ? "border-gray-800 hover:bg-gray-800"
                      : "border-gray-100 hover:bg-gray-50"
                  } transition-colors`}
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/Plasa/active-batches/batch/${order.id}`}
                      className="text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {formatOrderIdsForDisplay(order)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <OrderTypeBadge type={order.orderType} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-gray-400"
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
                      <span>{order.customerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span>{order.items}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{formatCurrency(order.estimatedEarnings)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.shopLat},${order.shopLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      {renderShopNames(order)}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <TimeDisplay deliveryTime={order.deliveryTime} />
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex max-w-[200px] cursor-pointer items-center gap-2 text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                      title="Get directions from your current location"
                    >
                      <svg
                        className="h-4 w-4 flex-shrink-0 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                      <span className="truncate hover:underline">
                        {order.customerAddress}
                      </span>
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        ref={(el) => (buttonRefs.current[order.id] = el)}
                        onClick={() => {
                          if (openDropdownId === order.id) {
                            setOpenDropdownId(null);
                          } else {
                            const button = buttonRefs.current[order.id];
                            if (button) {
                              const rect = button.getBoundingClientRect();
                              setDropdownPosition({
                                top: rect.bottom + 8,
                                right: window.innerWidth - rect.right,
                              });
                            }
                            setOpenDropdownId(order.id);
                          }
                        }}
                        className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === order.id && (
                        <div
                          ref={dropdownRef}
                          style={{
                            position: "fixed",
                            top: `${dropdownPosition.top}px`,
                            right: `${dropdownPosition.right}px`,
                          }}
                          className={`z-[9999] w-56 rounded-lg shadow-lg ${
                            theme === "dark"
                              ? "border border-gray-700 bg-gray-800"
                              : "border border-gray-200 bg-white"
                          }`}
                        >
                          <div className="py-1">
                            {/* View Batch */}
                            <Link
                              href={`/Plasa/active-batches/batch/${order.id}`}
                              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                theme === "dark"
                                  ? "text-gray-200 hover:bg-gray-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => setOpenDropdownId(null)}
                            >
                              <svg
                                className="h-5 w-5 text-blue-500"
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
                              <span>View Batch Details</span>
                            </Link>

                            {/* Contact Support */}
                            <button
                              className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                                theme === "dark"
                                  ? "text-gray-200 hover:bg-gray-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                // TODO: Open support modal or contact form
                                alert(
                                  `Contact support about order ${formatOrderIdsForDisplay(
                                    order
                                  )}`
                                );
                                setOpenDropdownId(null);
                              }}
                            >
                              <svg
                                className="h-5 w-5 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                              <span>Contact Support</span>
                            </button>

                            {/* Divider */}
                            <div
                              className={`my-1 border-t ${
                                theme === "dark"
                                  ? "border-gray-700"
                                  : "border-gray-200"
                              }`}
                            ></div>

                            {/* Update Status Label */}
                            <div
                              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                                theme === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-500"
                              }`}
                            >
                              Update Status
                            </div>

                            {/* Start Shopping */}
                            {order.status === "accepted" && (
                              <button
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                                  theme === "dark"
                                    ? "text-gray-200 hover:bg-gray-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                                onClick={() => {
                                  // TODO: Update status to shopping
                                  alert(
                                    `Start shopping for order ${formatOrderIdsForDisplay(
                                      order
                                    )}`
                                  );
                                  setOpenDropdownId(null);
                                }}
                              >
                                <svg
                                  className="h-5 w-5 text-green-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                                <span>Start Shopping</span>
                              </button>
                            )}

                            {/* Confirm Delivery */}
                            {(order.status === "shopping" ||
                              order.status === "on_the_way" ||
                              order.status === "at_customer") && (
                              <>
                                {order.invoiceUrl ? (
                                  <button
                                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                                      theme === "dark"
                                        ? "text-gray-200 hover:bg-gray-700"
                                        : "text-gray-700 hover:bg-gray-50"
                                    }`}
                                    onClick={() => {
                                      // TODO: API call to confirm delivery
                                      alert(
                                        `Confirm delivery for order ${formatOrderIdsForDisplay(
                                          order
                                        )}`
                                      );
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <svg
                                      className="h-5 w-5 text-purple-500"
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
                                    <span>Confirm Delivery</span>
                                  </button>
                                ) : (
                                  <div
                                    className={`flex cursor-not-allowed items-start gap-3 px-4 py-3 text-sm opacity-60 ${
                                      theme === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-500"
                                    }`}
                                    title="Please upload invoice first"
                                  >
                                    <svg
                                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                      />
                                    </svg>
                                    <div className="flex flex-col">
                                      <span>Confirm Delivery</span>
                                      <span className="mt-0.5 text-xs text-red-500 dark:text-red-400">
                                        Invoice required
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`flex items-center justify-between rounded-lg border ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          } px-4 py-3`}
        >
          <div className="text-sm">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(endIndex, orders.length)}
            </span>{" "}
            of <span className="font-medium">{orders.length}</span> orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`rounded px-3 py-1 text-sm ${
                currentPage === 1
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`rounded px-3 py-1 text-sm ${
                currentPage === totalPages
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
