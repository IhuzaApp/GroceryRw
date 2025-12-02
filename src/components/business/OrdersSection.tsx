"use client";

import { CheckCircle, AlertCircle, Truck } from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";

const recentOrders = [
  {
    id: "ORD-001",
    supplier: "Fresh Farm Distributors",
    items: "Organic Vegetables Mix",
    value: formatCurrencySync(1250),
    status: "Delivered",
    deliveryDate: "2024-01-12",
    tracking: "TRK-12345",
  },
  {
    id: "ORD-002",
    supplier: "Premium Meat Co.",
    items: "Prime Beef Selection",
    value: formatCurrencySync(3200),
    status: "In Transit",
    deliveryDate: "2024-01-15",
    tracking: "TRK-12346",
  },
  {
    id: "ORD-003",
    supplier: "Ocean Fresh Seafood",
    items: "Daily Fresh Fish",
    value: formatCurrencySync(890),
    status: "Processing",
    deliveryDate: "2024-01-16",
    tracking: "TRK-12347",
  },
];

interface OrdersSectionProps {
  className?: string;
}

export function OrdersSection({ className = "" }: OrdersSectionProps) {
  const handleExport = () => {
    console.log("Exporting orders");
    // Handle export logic
  };

  const handleFilter = () => {
    console.log("Filtering orders");
    // Handle filter logic
  };

  const handleTrackOrder = (orderId: string) => {
    console.log("Tracking order:", orderId);
    // Handle track order logic
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-8 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order History
            </h2>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Track and manage your orders
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Export
            </button>
            <button
              onClick={handleFilter}
              className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Filter
            </button>
          </div>
        </div>
        <div className="p-8">
          <div className="space-y-6">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="group rounded-2xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-6 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {order.id}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          order.status === "Delivered"
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200"
                            : order.status === "In Transit"
                            ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200"
                            : "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900 dark:to-orange-900 dark:text-yellow-200"
                        }`}
                      >
                        {order.status === "Delivered" && (
                          <CheckCircle className="mr-1 h-3 w-3" />
                        )}
                        {order.status === "In Transit" && (
                          <Truck className="mr-1 h-3 w-3" />
                        )}
                        {order.status === "Processing" && (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {order.items}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      From:{" "}
                      <span className="font-semibold">{order.supplier}</span> •
                      Tracking:{" "}
                      <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-700">
                        {order.tracking}
                      </span>
                    </p>
                  </div>
                  <div className="ml-6 space-y-4 text-right">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {order.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Order Value
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Delivery:{" "}
                        <span className="font-semibold">
                          {order.deliveryDate}
                        </span>
                      </p>
                      <button
                        onClick={() => handleTrackOrder(order.id)}
                        className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
