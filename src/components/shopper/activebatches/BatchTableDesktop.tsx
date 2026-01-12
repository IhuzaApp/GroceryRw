import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";
import { BatchAvatar } from "./BatchAvatar";
import { ClientTag } from "./ClientTag";
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
  items: number;
  total: number;
  estimatedEarnings: string;
  orderType?: "regular" | "reel" | "restaurant";
}

interface BatchTableDesktopProps {
  orders: Order[];
}

export function BatchTableDesktop({ orders }: BatchTableDesktopProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 7;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const start = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    // Add estimated 1 hour for end time
    const endDate = new Date(date.getTime() + 60 * 60 * 1000);
    const end = endDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${start} - ${end}`;
  };

  const getRouteText = (order: Order) => {
    if (order.orderType === "reel") {
      return "Quick Batch";
    }
    if (order.orderType === "restaurant") {
      return "Restaurant Order";
    }
    // Extract city from addresses
    const fromCity = order.shopAddress?.split(",").pop()?.trim() || "Pickup";
    const toCity = order.customerAddress?.split(",").pop()?.trim() || "Delivery";
    return `${fromCity} to ${toCity}`;
  };

  return (
    <div>
      <div
        className={`overflow-hidden rounded-lg border ${
          theme === "dark"
            ? "border-gray-700 bg-gray-800"
            : "border-gray-200 bg-white"
        }`}
      >
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <table className="w-full min-w-[1200px]">
            <thead
              className={`border-b text-left text-xs font-medium uppercase ${
                theme === "dark"
                  ? "border-gray-700 bg-gray-900/50 text-gray-400"
                  : "border-gray-200 bg-gray-50 text-gray-600"
              }`}
            >
              <tr>
                <th className="sticky left-0 z-10 w-12 px-4 py-3 lg:px-6 bg-inherit">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="sticky left-12 z-10 px-4 py-3 lg:px-6 bg-inherit whitespace-nowrap">Order No</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Date</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Name</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Routes</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Client</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Time</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Address</th>
                <th className="px-4 py-3 lg:px-6 whitespace-nowrap">Status</th>
                <th className="w-12 px-4 py-3 lg:px-6"></th>
              </tr>
            </thead>
            <tbody
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-900"
              }`}
            >
              {currentOrders.map((order) => (
              <tr
                key={order.id}
                className={`border-b transition-colors ${
                  theme === "dark"
                    ? "border-gray-700 hover:bg-gray-700/50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                {/* Checkbox - Sticky */}
                <td className="sticky left-0 z-10 px-4 py-4 lg:px-6 bg-inherit">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>

                {/* Order Number - Sticky */}
                <td className="sticky left-12 z-10 px-4 py-4 lg:px-6 font-medium bg-inherit">
                  <Link
                    href={`/Plasa/active-batches/batch/${order.id}`}
                    className={`hover:underline whitespace-nowrap ${
                      theme === "dark" ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {order.OrderID}
                  </Link>
                </td>

                {/* Date */}
                <td className="px-4 py-4 lg:px-6 whitespace-nowrap">{formatDate(order.createdAt)}</td>

                {/* Name with Avatar */}
                <td className="px-4 py-4 lg:px-6">
                  <div className="flex items-center gap-3 whitespace-nowrap">
                    <BatchAvatar name={order.customerName} size="sm" />
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                </td>

                {/* Routes */}
                <td className="px-4 py-4 lg:px-6 whitespace-nowrap">{getRouteText(order)}</td>

                {/* Client */}
                <td className="px-4 py-4 lg:px-6">
                  <ClientTag name={order.shopName} />
                </td>

                {/* Time */}
                <td className="px-4 py-4 lg:px-6 whitespace-nowrap">
                  {formatTime(order.deliveryTime)}
                </td>

                {/* Address */}
                <td className="px-4 py-4 lg:px-6">
                  <div className="max-w-[200px] truncate" title={order.customerAddress}>
                    {order.customerAddress}
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-4 lg:px-6 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>

                {/* Actions Menu */}
                <td className="px-4 py-4 lg:px-6">
                  <button
                    className={`rounded p-1 transition-colors ${
                      theme === "dark"
                        ? "hover:bg-gray-600"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>
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
          className={`mt-4 flex items-center justify-between rounded-lg border px-4 py-3 ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          {/* Showing info */}
          <div className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, orders.length)}</span> of{" "}
            <span className="font-medium">{orders.length}</span> orders
          </div>

          {/* Pagination controls */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === 1
                  ? theme === "dark"
                    ? "cursor-not-allowed bg-gray-700 text-gray-500"
                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                  : theme === "dark"
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg
                className="h-5 w-5"
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

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className={`px-3 py-2 text-sm ${
                        theme === "dark" ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    className={`min-w-[40px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === page
                        ? theme === "dark"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : theme === "dark"
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === totalPages
                  ? theme === "dark"
                    ? "cursor-not-allowed bg-gray-700 text-gray-500"
                    : "cursor-not-allowed bg-gray-100 text-gray-400"
                  : theme === "dark"
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <svg
                className="h-5 w-5"
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
        </div>
      )}
    </div>
  );
}
