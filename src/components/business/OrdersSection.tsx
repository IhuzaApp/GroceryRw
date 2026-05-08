"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  AlertCircle,
  Truck,
  Loader2,
  MapPin,
  X,
  Eye,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  ZoomIn,
  Image as LucideImageIcon,
  Download,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { OrderDetailsView } from "./OrderDetailsView";
import { formatCurrencySync } from "../../utils/formatCurrency";
import Image from "next/image";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { usePortalCache } from "../../context/PortalCacheContext";

interface Product {
  id: string;
  name: string;
  price_per_item: number;
  quantity: number;
  unit: string;
  measurement_type?: string;
  image?: string;
  selectedDetails?: Record<string, string>;
}

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
  latitude: string;
  longitude: string;
  allProducts: Product[];
  shoppers?: {
    id: string;
    full_name: string;
    profile_photo: string | null;
    phone_number: string | null;
    email: string | null;
  } | null;
  shopper_id?: string | null;
  orderedBy?: {
    id: string;
    name: string;
    profile_picture: string;
    phone: string;
    email: string;
  } | null;
}

interface OrdersSectionProps {
  className?: string;
}

export function OrdersSection({ className = "" }: OrdersSectionProps) {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 12;
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // ── Use shared portal cache instead of fetching independently ────────────
  const { orders: ordersCache } = usePortalCache();
  const orders = (ordersCache.data ?? []) as Order[];
  const loading = ordersCache.isLoading;
  const error = ordersCache.error ? "Failed to fetch orders" : null;

  // Sync filteredOrders whenever the cache updates
  useEffect(() => {
    setFilteredOrders(orders);
  }, [ordersCache.data]);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        showExportMenu &&
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showExportMenu]);

  const isPendingOrder = (order: Order) => {
    const s = (order.status || "").toLowerCase();
    return s === "pending" || s === "processing";
  };

  const isSoldOrPaidOrder = (order: Order) => {
    const s = (order.status || "").toLowerCase();
    return (
      s.includes("ready for pickup") ||
      s.includes("ready") ||
      s.includes("transit") ||
      s.includes("on the way") ||
      s === "in_progress" ||
      s.includes("delivered") ||
      s === "completed"
    );
  };

  const formatOrderDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr || "";
    }
  };

  const handleExport = (type: "pending" | "sold") => {
    try {
      const toExport =
        type === "pending"
          ? orders.filter(isPendingOrder)
          : orders.filter(isSoldOrPaidOrder);
      const reportLabel =
        type === "pending" ? "Pending_Orders" : "Sold_Paid_Orders";

      if (toExport.length === 0) {
        toast(
          type === "pending"
            ? "No pending orders to export."
            : "No sold/paid orders to export.",
          { icon: "📋" }
        );
        setShowExportMenu(false);
        return;
      }

      const exportData = toExport.map((order, index) => {
        const customerName =
          order.orderedBy?.name || order.shoppers?.full_name || "—";
        const itemsText = Array.isArray(order.allProducts)
          ? order.allProducts
              .map((p: Product) => {
                const details =
                  p.selectedDetails &&
                  typeof p.selectedDetails === "object" &&
                  Object.keys(p.selectedDetails).length > 0
                    ? ` (${Object.entries(p.selectedDetails)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")})`
                    : "";
                return `${p.name} × ${p.quantity}${details}`;
              })
              .join("; ")
          : order.items || "—";
        const orderTotal =
          order.value -
          (order.transportation_fee || 0) -
          (order.service_fee || 0);
        return {
          "#": index + 1,
          "Order ID": order.orderId,
          Date: formatOrderDate(order.created_at),
          Store: order.store,
          Status: order.status,
          Customer: customerName,
          Items: itemsText,
          "Order Total": orderTotal,
          "Order Total (Formatted)": formatCurrencySync(orderTotal),
          "Delivery Address": order.deliveryAddress || "—",
          "Delivery Date": order.deliveryDate || "—",
          "Delivery Time": order.deliveryTime || "—",
          Tracking: order.tracking || "—",
          Comment: order.comment || "—",
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws["!cols"] = [
        { wch: 5 },
        { wch: 22 },
        { wch: 20 },
        { wch: 18 },
        { wch: 14 },
        { wch: 22 },
        { wch: 50 },
        { wch: 14 },
        { wch: 18 },
        { wch: 40 },
        { wch: 14 },
        { wch: 12 },
        { wch: 18 },
        { wch: 30 },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, reportLabel.replace(/_/g, " "));

      const date = new Date();
      const dateStr = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const timeStr = `${String(date.getHours()).padStart(2, "0")}${String(
        date.getMinutes()
      ).padStart(2, "0")}`;
      const filename = `Orders_${reportLabel}_${dateStr}_${timeStr}.xlsx`;
      XLSX.writeFile(wb, filename);

      setShowExportMenu(false);
      toast.success(`Exported ${toExport.length} order(s) to ${filename}`, {
        duration: 3000,
        icon: "📊",
      });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export to Excel. Please try again.");
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
    if (!query.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const searchLower = query.toLowerCase();

      // Search by order ID (query ID)
      if (order.orderId.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Search by product names from allProducts
      if (Array.isArray(order.allProducts) && order.allProducts.length > 0) {
        const productMatches = order.allProducts.some((product: Product) =>
          product.name?.toLowerCase().includes(searchLower)
        );
        if (productMatches) {
          return true;
        }
      }

      return false;
    });
    setFilteredOrders(filtered);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleViewLocation = (deliveryAddress: string) => {
    const encodedAddress = encodeURIComponent(deliveryAddress);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(url, "_blank");
  };

  const handleConfirmAvailability = async (orderId: string) => {
    if (!selectedOrder) return;

    setUpdatingStatus(true);
    try {
      const response = await fetch(
        "/api/mutations/update-business-product-order-status",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            status: "Ready for Pickup",
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update selected order
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: "Ready for Pickup" } : null
        );
        toast.success("Order confirmed as ready for pickup!");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update order status");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm availability");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    if (
      normalizedStatus.includes("delivered") ||
      normalizedStatus === "completed"
    ) {
      return "bg-green-100 !text-green-900 dark:bg-green-900/40 dark:!text-green-300";
    } else if (
      normalizedStatus.includes("ready for pickup") ||
      normalizedStatus.includes("ready")
    ) {
      return "bg-blue-100 !text-blue-900 dark:bg-blue-900/40 dark:!text-blue-300";
    } else if (
      normalizedStatus.includes("transit") ||
      normalizedStatus.includes("on the way") ||
      normalizedStatus === "in_progress"
    ) {
      return "bg-purple-100 !text-purple-900 dark:bg-purple-900/40 dark:!text-purple-300";
    } else if (
      normalizedStatus === "pending" ||
      normalizedStatus === "processing"
    ) {
      return "bg-yellow-100 !text-yellow-900 dark:bg-yellow-900/40 dark:!text-yellow-300";
    } else if (
      normalizedStatus === "cancelled" ||
      normalizedStatus === "rejected"
    ) {
      return "bg-red-100 !text-red-900 dark:bg-red-900/40 dark:!text-red-300";
    }
    return "bg-gray-100 !text-gray-900 dark:bg-gray-800 dark:!text-gray-300";
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    if (
      normalizedStatus.includes("delivered") ||
      normalizedStatus === "completed"
    ) {
      return <CheckCircle className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />;
    } else if (
      normalizedStatus.includes("ready for pickup") ||
      normalizedStatus.includes("ready")
    ) {
      return <Package className="mr-1 h-3 w-3 md:h-3.5 md:w-3.5" />;
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
        <div className="rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 sm:p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-700"></div>
                        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
                      </div>
                      <div className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="h-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-16 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-10 w-24 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
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

  if (error) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedOrder) {
    return (
      <OrderDetailsView
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onConfirmAvailability={handleConfirmAvailability}
        updatingStatus={updatingStatus}
        getStatusBadgeStyles={getStatusBadgeStyles}
        getStatusIcon={getStatusIcon}
      />
    );
  }

  return (
    <div className={`space-y-4 md:space-y-8 ${className}`}>
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl">
        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800 sm:p-6 md:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white md:text-2xl">
                Order History
              </h2>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 md:text-sm">
                Track and manage your orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all duration-300 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 md:rounded-xl md:py-2.5"
              />
            </div>
            {/* Export dropdown */}
            <div className="relative flex-shrink-0" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu((v) => !v)}
                className="flex items-center gap-2 rounded-lg border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </button>
              {showExportMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => handleExport("pending")}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Pending orders
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("sold")}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Sold / Paid orders
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 md:p-8">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">
                {searchQuery
                  ? "No orders match your search"
                  : "No orders found"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:space-y-6">
                {paginatedOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group rounded-xl border border-gray-200 bg-white p-2 transition-all duration-300 hover:border-green-300 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 md:rounded-2xl md:p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1 space-y-2 md:space-y-4">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <span className="text-xs font-bold text-gray-900 dark:text-white md:text-base">
                            {order.orderId}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold md:px-2.5 md:py-1 md:text-[10px] ${getStatusBadgeStyles(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            <span className="hidden sm:inline">
                              {order.status}
                            </span>
                            <span className="sm:hidden">
                              {order.status.split(" ")[0]}
                            </span>
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[11px] font-semibold text-gray-900 dark:text-white md:line-clamp-none md:text-sm">
                          {order.items}
                        </p>
                        {/* Store / Service badge */}
                        <div className="flex items-center gap-1.5">
                          {order.store_image ? (
                            <img
                              src={order.store_image}
                              alt={order.store}
                              className="h-5 w-5 flex-shrink-0 rounded-full object-cover ring-1 ring-green-400/40"
                            />
                          ) : (
                            <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
                              <Package className="h-3 w-3 text-green-600 dark:text-green-400" />
                            </span>
                          )}
                          <span className="rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-[9px] font-semibold text-green-700 dark:border-green-800/40 dark:bg-green-900/30 dark:text-green-300 md:text-[11px]">
                            {order.store}
                          </span>
                          <span className="hidden text-[9px] text-gray-400 md:inline">
                            •
                          </span>
                          <span className="hidden rounded bg-gray-100 px-2 py-0.5 font-mono text-[9px] dark:bg-gray-700 md:inline">
                            {order.tracking}
                          </span>
                        </div>
                        <div className="md:hidden">
                          <p className="text-[11px] font-semibold text-gray-900 dark:text-white">
                            {formatCurrencySync(
                              order.value -
                                order.transportation_fee -
                                order.service_fee
                            )}
                          </p>
                          <p className="text-[9px] font-bold !text-black dark:!text-gray-300">
                            Delivery: {order.deliveryDate}
                          </p>
                        </div>
                      </div>
                      <div className="hidden space-y-3 text-right md:block">
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatCurrencySync(
                              order.value -
                                order.transportation_fee -
                                order.service_fee
                            )}
                          </p>
                          <p className="text-xs font-bold !text-black dark:!text-gray-300">
                            Order Value
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black !text-black dark:!text-gray-300">
                            Delivery:{" "}
                            <span className="font-bold">
                              {order.deliveryDate}
                            </span>
                          </p>
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1.5 text-xs font-medium !text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
                          >
                            <Eye className="h-3.5 w-3.5 !text-white" />
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 md:hidden">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-2 text-xs font-medium !text-white shadow-md transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Eye className="h-3 w-3 !text-white" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredOrders.length)} of{" "}
                    {filteredOrders.length} orders
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 md:px-4 md:text-sm"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="px-3 text-xs font-medium text-gray-700 dark:text-gray-300 sm:text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-lg border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 md:px-4 md:text-sm"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
