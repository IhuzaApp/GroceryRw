"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ShopperLayout from "../../../src/components/shopper/ShopperLayout";
import { Panel, Loader, Button, Divider, Timeline, Tag } from "rsuite";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useTheme } from "../../../src/context/ThemeContext";
import { logger } from "../../../src/utils/logger";
import VideoValidationModal from "../../../src/components/Reels/VideoValidationModal";
import { AuthGuard } from "../../../src/components/AuthGuard";

// Define interface for order data
interface OrderDetails {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  items: any[];
  createdAt: string;
  status: string;
  total: number;
  estimatedEarnings: number;
  shopLatitude?: number;
  shopLongitude?: number;
  customerLatitude?: number;
  customerLongitude?: number;
  orderType?: "regular" | "reel";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
    Restaurant?: {
      id: string;
      name: string;
      location: string;
      lat: number;
      long: number;
    };
  };
  quantity?: number;
  deliveryNote?: string;
  customerName?: string;
  customerPhone?: string;
}

function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    // Only fetch data when ID is available
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    try {
      if (!id) {
        throw new Error("Order ID is required");
      }

      // Fetch order details from API
      const response = await fetch(`/api/shopper/orderDetails?id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch order details");
      }

      if (data.success && data.order) {
        setOrderDetails(data.order);
      } else {
        throw new Error(data.error || "Failed to load order details");
      }
    } catch (error) {
      logger.error("Error fetching order details", "OrderDetailsPage", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to load order details"
      );
      setOrderDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!id) return;

    setIsAccepting(true);
    try {
      const response = await fetch("/api/shopper/assignOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });

      const data = await response.json();

      if (data.success) {
        logger.info("Order assigned successfully", "OrderDetailsPage", {
          orderId: id,
        });
        toast.success("Order assigned successfully!");
        // Refresh order details
        fetchOrderDetails();
      } else if (data.error === "no_wallet") {
        logger.warn("No wallet found for shopper", "OrderDetailsPage");
        toast.error("You need a wallet to accept batches");

        try {
          // Create wallet automatically
          const walletResponse = await fetch("/api/queries/createWallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          const walletData = await walletResponse.json();

          if (walletData.success) {
            logger.info("Wallet created successfully", "OrderDetailsPage");
            toast.success(
              "Wallet created. Trying to accept the batch again..."
            );

            // Try again after wallet creation
            setTimeout(async () => {
              const retryResponse = await fetch("/api/shopper/assignOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: id }),
              });

              const retryData = await retryResponse.json();

              if (retryData.success) {
                logger.info(
                  "Order assigned successfully after wallet creation",
                  "OrderDetailsPage",
                  { orderId: id }
                );
                toast.success("Order assigned successfully!");
                fetchOrderDetails();
              } else {
                logger.error(
                  "Failed to assign order after wallet creation",
                  "OrderDetailsPage",
                  { error: retryData.error }
                );
                toast.error(retryData.error || "Failed to assign order");
              }

              setIsAccepting(false);
            }, 1000);

            return;
          } else {
            logger.error("Failed to create wallet", "OrderDetailsPage", {
              error: walletData.error,
            });
            toast.error("Failed to create wallet");
          }
        } catch (walletError) {
          logger.error(
            "Error creating wallet",
            "OrderDetailsPage",
            walletError
          );
          toast.error("Failed to create wallet");
        }
      } else {
        logger.error("Failed to assign order", "OrderDetailsPage", {
          error: data.error,
        });
        toast.error(data.error || "Failed to assign order");
      }
    } catch (error) {
      logger.error("Error accepting order", "OrderDetailsPage", error);
      toast.error("Failed to accept order");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleApproveProduct = async () => {
    setIsApproving(true);
    try {
      // TODO: Implement approve product logic
      toast.success("Product approved successfully!");
      setShowVideoModal(false);
    } catch (error) {
      logger.error("Error approving product", "OrderDetailsPage", error);
      toast.error("Failed to approve product. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectProduct = async () => {
    setIsRejecting(true);
    try {
      // TODO: Implement reject product logic
      toast.success("Product rejected successfully!");
      setShowVideoModal(false);
    } catch (error) {
      logger.error("Error rejecting product", "OrderDetailsPage", error);
      toast.error("Failed to reject product. Please try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusColor = (
    status: string
  ): "red" | "orange" | "yellow" | "green" | "cyan" | "blue" | "violet" => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "orange";
      case "ASSIGNED":
        return "blue";
      case "SHOPPING":
        return "cyan";
      case "DELIVERING":
        return "yellow";
      case "DELIVERED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "violet";
    }
  };

  return (
    <ShopperLayout>
      <div
        className={`min-h-screen ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-gray-200/20 bg-white/80 backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-900/80">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <Link href="/">
                <button
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    theme === "dark"
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <svg
                    className="h-4 w-4 transition-transform group-hover:-translate-x-1"
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
                  Back to Batches
                </button>
              </Link>

              {orderDetails && (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Order ID: {orderDetails.id.slice(0, 8)}...
                    </p>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      getStatusColor(orderDetails.status) === "green"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : getStatusColor(orderDetails.status) === "orange"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                        : getStatusColor(orderDetails.status) === "blue"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {orderDetails.status}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-600 dark:border-t-blue-400"></div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                  Loading order details...
                </p>
              </div>
            </div>
          ) : !orderDetails ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 h-24 w-24 rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                  <svg
                    className="h-12 w-12 text-red-600 dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Order Not Found
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-400">
                  The order you're looking for could not be found or you don't
                  have permission to view it.
                </p>
                <Link href="/">
                  <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                    Return to Available Batches
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Header Card */}
              <div
                className={`overflow-hidden rounded-2xl border shadow-lg ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                          {orderDetails.orderType === "reel"
                            ? "Reel Order"
                            : "Order"}{" "}
                          #{orderDetails.id.slice(0, 8)}
                        </h1>
                        {orderDetails.orderType === "reel" && (
                          <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                            Quick Batch
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Created {orderDetails.createdAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total Value
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(orderDetails.total)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Your Earnings
                        </p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(orderDetails.estimatedEarnings)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details Grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Shop/Customer Info */}
                <div
                  className={`overflow-hidden rounded-2xl border shadow-lg ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      {orderDetails.orderType === "reel"
                        ? "Pickup Location"
                        : "Shop Information"}
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
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
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {orderDetails.shopName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {orderDetails.shopAddress}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                          <svg
                            className="h-5 w-5 text-green-600 dark:text-green-400"
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
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            Delivery Address
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {orderDetails.customerAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div
                  className={`overflow-hidden rounded-2xl border shadow-lg ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                      Order Items ({orderDetails.items?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {orderDetails.items.map((item: any, index: number) => (
                        <div
                          key={item.id || index}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700/50"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reel Order Specific Information */}
              {orderDetails.orderType === "reel" && orderDetails.reel && (
                <div
                  className={`overflow-hidden rounded-2xl border shadow-lg ${
                    theme === "dark"
                      ? "border-purple-700 bg-gradient-to-r from-purple-900/20 to-pink-900/20"
                      : "border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50"
                  }`}
                >
                  <div className="p-6">
                    <div className="mb-6 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <svg
                          className="h-5 w-5 text-purple-600 dark:text-purple-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        Reel Details
                      </h3>
                    </div>

                    {/* Product Information Card */}
                    <div className="mb-6 rounded-xl bg-white/50 p-4 dark:bg-gray-800/50">
                      <div className="flex items-start gap-4">
                        {/* Product Image Placeholder */}
                        <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                          <svg
                            className="h-8 w-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>

                        <div className="flex-1">
                          <h4 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                            {orderDetails.reel.Product}
                          </h4>
                          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                            {orderDetails.reel.description ||
                              "No description available"}
                          </p>

                          {/* Video Preview Button */}
                          <button
                            onClick={() => setShowVideoModal(true)}
                            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
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
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
                              />
                            </svg>
                            View Video
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg bg-white/30 p-4 dark:bg-gray-800/30">
                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quantity
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {orderDetails.quantity}
                        </p>
                      </div>
                      <div className="rounded-lg bg-white/30 p-4 dark:bg-gray-800/30">
                        <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Price per item
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(parseFloat(orderDetails.reel.Price))}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Note */}
                    {orderDetails.deliveryNote && (
                      <div className="mt-6 rounded-lg bg-white/30 p-4 dark:bg-gray-800/30">
                        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Delivery Note
                        </p>
                        <p className="text-gray-900 dark:text-white">
                          {orderDetails.deliveryNote}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div
                className={`overflow-hidden rounded-2xl border shadow-lg ${
                  theme === "dark"
                    ? "border-gray-700 bg-gray-800"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="p-6">
                  {orderDetails.status === "PENDING" && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        onClick={handleAcceptOrder}
                        disabled={isAccepting}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isAccepting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Accepting...
                          </>
                        ) : (
                          <>
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Accept Batch
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {orderDetails.status === "ASSIGNED" && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button className="flex items-center justify-center gap-2 rounded-lg border border-red-300 bg-red-50 px-6 py-3 font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30">
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel Batch
                      </button>
                      <button className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700">
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
                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                          />
                        </svg>
                        Start Shopping
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Video Validation Modal */}
        {orderDetails?.orderType === "reel" && orderDetails.reel && (
          <VideoValidationModal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            videoUrl={orderDetails.reel.video_url || ""}
            productName={orderDetails.reel.Product}
            productDescription={orderDetails.reel.description}
            price={parseFloat(orderDetails.reel.Price)}
            onApprove={handleApproveProduct}
            onReject={handleRejectProduct}
          />
        )}
      </div>
    </ShopperLayout>
  );
}

export default OrderDetailsPage;
