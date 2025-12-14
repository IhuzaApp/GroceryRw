"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Truck, Loader2 } from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";

interface Order {
  id: string;
  orderId: string;
  store: string;
  items: string;
  itemsCount: number;
  value: number;
  status: string;
  deliveryDate: string;
  deliveryTime: string;
  tracking: string;
  transportation_fee: number;
  service_fee: number;
  units: number;
  deliveryAddress: string;
  comment: string | null;
  created_at: string;
  store_image: string | null;
}

interface OrdersSectionProps {
  className?: string;
}

export function OrdersSection({ className = "" }: OrdersSectionProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/queries/business-product-orders");
      const data = await response.json();
      console.log("📦 Orders API response:", {
        status: response.status,
        ok: response.ok,
        data,
      });
      
      if (response.ok) {
        setOrders(data.orders || []);
        if (!data.orders || data.orders.length === 0) {
          console.log("⚠️ No orders found in response");
        }
      } else {
        console.error("❌ API error:", data);
        setError(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      console.error("❌ Error fetching orders:", err);
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusBadgeStyles = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    if (normalizedStatus.includes("delivered") || normalizedStatus === "completed") {
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200";
    } else if (
      normalizedStatus.includes("transit") ||
      normalizedStatus.includes("on the way") ||
      normalizedStatus === "in_progress"
    ) {
      return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200";
    } else if (normalizedStatus === "pending" || normalizedStatus === "processing") {
      return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 dark:from-yellow-900 dark:to-orange-900 dark:text-yellow-200";
    } else if (normalizedStatus === "cancelled" || normalizedStatus === "rejected") {
      return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900 dark:to-pink-900 dark:text-red-200";
    }
    return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-900 dark:to-slate-900 dark:text-gray-200";
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    if (normalizedStatus.includes("delivered") || normalizedStatus === "completed") {
      return <CheckCircle className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />;
    } else if (
      normalizedStatus.includes("transit") ||
      normalizedStatus.includes("on the way") ||
      normalizedStatus === "in_progress"
    ) {
      return <Truck className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />;
    }
    return <AlertCircle className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />;
  };

  if (loading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-12 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 md:space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 sm:flex-row sm:items-center sm:justify-between sm:p-6 md:p-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white md:text-2xl">
              Order History
            </h2>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
              Track and manage your orders
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 md:rounded-xl md:px-4 md:py-2 md:text-sm"
            >
              Export
            </button>
            <button
              onClick={handleFilter}
              className="rounded-lg border-2 border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 md:rounded-xl md:px-4 md:py-2 md:text-sm"
            >
              Filter
            </button>
          </div>
        </div>
        <div className="p-4 md:p-8">
          {orders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">
                No orders found
              </p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="group rounded-xl border-2 border-gray-100 bg-gradient-to-r from-white to-gray-50 p-3 transition-all duration-300 hover:border-green-200 hover:shadow-lg dark:border-gray-700 dark:from-gray-800 dark:to-gray-700 dark:hover:border-green-800 md:rounded-2xl md:p-6"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1 space-y-2 md:space-y-4">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3">
                        <span className="text-sm font-bold text-gray-900 dark:text-white md:text-lg">
                          {order.orderId}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold md:px-3 md:py-1 md:text-xs ${getStatusBadgeStyles(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="hidden sm:inline">{order.status}</span>
                          <span className="sm:hidden">{order.status.split(" ")[0]}</span>
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 md:text-base md:line-clamp-none">
                        {order.items}
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 md:text-sm">
                        Store:{" "}
                        <span className="font-semibold">{order.store}</span>{" "}
                        <span className="hidden md:inline">•</span>
                        <span className="md:hidden">{" "}</span>
                        <span className="hidden md:inline">Tracking: </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[9px] dark:bg-gray-700 md:px-2 md:py-1 md:text-xs">
                          {order.tracking}
                        </span>
                      </p>
                      <div className="md:hidden">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white">
                          {formatCurrencySync(order.value)}
                        </p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          Delivery: {order.deliveryDate}
                        </p>
                      </div>
                    </div>
                    <div className="hidden space-y-4 text-right md:block">
                      <div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrencySync(order.value)}
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
                  <div className="mt-3 md:hidden">
                    <button
                      onClick={() => handleTrackOrder(order.id)}
                      className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-medium text-white shadow-md transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
