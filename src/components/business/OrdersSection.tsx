"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Truck, Loader2, MapPin, X, Eye, Package, Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import { formatCurrencySync } from "../../utils/formatCurrency";
import Image from "next/image";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  price_per_item: number;
  quantity: number;
  unit: string;
  measurement_type?: string;
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
  shopper?: {
    id: string;
    name: string;
    profile_picture: string;
    phone: string;
    email: string;
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 12;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/queries/business-product-orders");
      const data = await response.json();
      
      if (response.ok) {
        const fetchedOrders = data.orders || [];
        setOrders(fetchedOrders);
        setFilteredOrders(fetchedOrders);
      } else {
        setError(data.error || "Failed to fetch orders");
      }
    } catch (err) {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Handle export logic
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
      const response = await fetch("/api/mutations/update-business-product-order-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: "Ready for Pickup",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the order in the local state
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, status: "Ready for Pickup" }
              : order
          )
        );
        // Update selected order
        setSelectedOrder({ ...selectedOrder, status: "Ready for Pickup" });
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
    if (normalizedStatus.includes("delivered") || normalizedStatus === "completed") {
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900 dark:to-emerald-900 dark:text-green-200";
    } else if (normalizedStatus.includes("ready for pickup") || normalizedStatus.includes("ready")) {
      return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 dark:from-blue-900 dark:to-cyan-900 dark:text-blue-200";
    } else if (
      normalizedStatus.includes("transit") ||
      normalizedStatus.includes("on the way") ||
      normalizedStatus === "in_progress"
    ) {
      return "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900 dark:to-indigo-900 dark:text-purple-200";
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
    } else if (normalizedStatus.includes("ready for pickup") || normalizedStatus.includes("ready")) {
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
            {/* Export Button */}
            <button
              onClick={handleExport}
              className="flex-shrink-0 rounded-lg border-2 border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 transition-all duration-300 hover:border-green-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 md:rounded-xl md:px-4 md:py-2.5 md:text-sm"
            >
              Export
            </button>
          </div>
        </div>
        <div className="p-4 md:p-8">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 md:text-base">
                {searchQuery ? "No orders match your search" : "No orders found"}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 md:space-y-6">
                {paginatedOrders.map((order) => (
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
                          onClick={() => handleViewOrder(order)}
                          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium !text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
                        >
                          <Eye className="h-4 w-4 !text-white" />
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
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
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

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div 
          className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/60 backdrop-blur-sm md:items-center md:px-4 md:pb-4"
          onClick={() => setShowOrderDetails(false)}
        >
          <div 
            className="w-full h-full max-h-screen max-w-2xl overflow-y-auto rounded-t-3xl border-t border-l border-r border-gray-200 bg-white shadow-2xl animate-slide-up dark:border-gray-700 dark:bg-gray-800 md:h-auto md:max-h-[90vh] md:rounded-2xl md:animate-none md:border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:border-gray-700 dark:from-gray-700 dark:to-gray-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                Order Details - {selectedOrder.orderId}
              </h2>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Shopper Information Section */}
              {selectedOrder.shopper_id && selectedOrder.shopper && (
                <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-blue-500 bg-blue-100 dark:bg-blue-900/30">
                      {selectedOrder.shopper.profile_picture ? (
                        <Image
                          src={selectedOrder.shopper.profile_picture}
                          alt={selectedOrder.shopper.name || "Shopper"}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Truck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          Assigned Shopper
                        </h3>
                      </div>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {selectedOrder.shopper.name || "Unknown Shopper"}
                      </p>
                      {selectedOrder.shopper.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedOrder.shopper.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getStatusBadgeStyles(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
              </div>

              {/* Products Section */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Products Ordered
                </h3>
                <div className="space-y-3">
                  {Array.isArray(selectedOrder.allProducts) && selectedOrder.allProducts.length > 0 ? (
                    selectedOrder.allProducts.map((product: Product, index: number) => (
                      <div
                        key={product.id || index}
                        className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {product.name}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {product.quantity} {product.unit || product.measurement_type || ""}
                            </p>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              Price per item: {formatCurrencySync(product.price_per_item)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                              {formatCurrencySync(product.price_per_item * product.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No product details available</p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Order Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrencySync(selectedOrder.value - selectedOrder.transportation_fee - selectedOrder.service_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Transportation Fee:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrencySync(selectedOrder.transportation_fee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Service Fee:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrencySync(selectedOrder.service_fee)}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between border-t border-gray-300 pt-2 dark:border-gray-600">
                    <span className="text-base font-bold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-base font-bold text-green-600 dark:text-green-400">
                      {formatCurrencySync(selectedOrder.value)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Delivery Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Address:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Date:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.deliveryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery Time:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.deliveryTime}</p>
                  </div>
                  {selectedOrder.deliveryAddress && (
                    <button
                      onClick={() => handleViewLocation(selectedOrder.deliveryAddress)}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-medium !text-white shadow-md transition-all duration-300 hover:from-green-600 hover:to-emerald-600"
                    >
                      <MapPin className="h-4 w-4" />
                      View Location on Map
                    </button>
                  )}
                </div>
              </div>

              {/* Comment Section */}
              {selectedOrder.comment && (
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                  <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                    Order Comment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedOrder.comment}</p>
                </div>
              )}

              {/* Availability Confirmation Section */}
              {(selectedOrder.status === "Pending" || selectedOrder.status === "Processing") && (
                <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 p-4 dark:border-orange-800 dark:from-orange-900/20 dark:to-yellow-900/20">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Confirm Availability
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Confirm that all items in this order are available and ready for pickup
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleConfirmAvailability(selectedOrder.id)}
                    disabled={updatingStatus}
                    className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-3 text-base font-semibold !text-white shadow-md transition-all duration-300 hover:from-orange-600 hover:to-yellow-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {updatingStatus ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Confirming...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Confirm Items Available for Pickup
                      </span>
                    )}
                      </button>
                </div>
              )}

              {/* Availability Status (if already confirmed) */}
              {(selectedOrder.status === "Ready for Pickup" || selectedOrder.status === "In Transit" || selectedOrder.status === "Delivered") && (
                <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Availability Confirmed
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Items have been confirmed as available for pickup
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-700/50 dark:to-gray-800/50">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  Additional Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Store:</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.store}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Total Units:</p>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrder.units}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Tracking ID:</p>
                    <p className="font-mono text-gray-600 dark:text-gray-400">{selectedOrder.tracking}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">Order Date:</p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedOrder.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-base font-semibold !text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
