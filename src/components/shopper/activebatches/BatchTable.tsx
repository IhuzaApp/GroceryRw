import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../context/ThemeContext";

interface Order {
  id: string;
  OrderID: string;
  status: string;
  createdAt: string;
  deliveryTime?: string;
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
  orderType?: "regular" | "reel" | "restaurant";
}

interface BatchTableProps {
  orders: Order[];
}

export function BatchTable({ orders }: BatchTableProps) {
  const { theme } = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Pagination
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  // Order Type Badge
  const OrderTypeBadge = ({ type }: { type?: string }) => {
    const configs = {
      reel: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", label: "Reel" },
      restaurant: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", label: "Restaurant" },
      regular: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", label: "Regular" },
    };
    const config = configs[type as keyof typeof configs] || configs.regular;
    
    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${config.bg} px-2.5 py-1 text-xs font-medium ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    const configs: Record<string, { bg: string; text: string }> = {
      accepted: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300" },
      shopping: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
      on_the_way: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300" },
      at_customer: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-300" },
    };
    const config = configs[status] || { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-300" };
    
    return (
      <span className={`inline-flex rounded-full ${config.bg} px-2.5 py-1 text-xs font-medium ${config.text}`}>
        {status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  // Calculate Distance
  const calculateDistance = (order: Order) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(order.customerLat - order.shopLat);
    const dLon = toRad(order.customerLng - order.shopLng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(order.shopLat)) * Math.cos(toRad(order.customerLat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className={`rounded-lg border ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className={`${theme === "dark" ? "bg-gray-800" : "bg-gray-50"}`}>
              <tr className={`border-b ${theme === "dark" ? "border-gray-700" : "border-gray-200"}`}>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Distance</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Shop</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className={theme === "dark" ? "bg-gray-900" : "bg-white"}>
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b ${theme === "dark" ? "border-gray-800 hover:bg-gray-800" : "border-gray-100 hover:bg-gray-50"} transition-colors`}
                >
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <Link href={`/Plasa/active-batches/batch/${order.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                      #{order.OrderID}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <OrderTypeBadge type={order.orderType} />
                  </td>
                  <td className="px-6 py-4 text-sm">{order.customerName}</td>
                  <td className="px-6 py-4 text-sm font-medium">{calculateDistance(order)}</td>
                  <td className="px-6 py-4 text-sm">{order.shopName}</td>
                  <td className="px-6 py-4 text-sm max-w-[200px] truncate">{order.customerAddress}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
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
        <div className={`flex items-center justify-between rounded-lg border ${theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"} px-4 py-3`}>
          <div className="text-sm">
            Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
            <span className="font-medium">{Math.min(endIndex, orders.length)}</span> of{" "}
            <span className="font-medium">{orders.length}</span> orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`rounded px-3 py-1 text-sm ${currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`rounded px-3 py-1 text-sm ${currentPage === totalPages ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
