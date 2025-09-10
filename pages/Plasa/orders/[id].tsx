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
  orderType?: 'regular' | 'reel';
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

export default function OrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

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
        className={`min-h-screen px-4 py-8 ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="mb-4 flex items-center">
          <Link href="/">
            <Button
              appearance="link"
              className={
                theme === "dark" ? "text-gray-300 hover:text-gray-100" : ""
              }
            >
              <span className="flex items-center">
                <span className="mr-1">←</span> Back to Available Batches
              </span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div
            className={`flex h-64 items-center justify-center ${
              theme === "dark" ? "text-gray-300" : "text-gray-700"
            }`}
          >
            <Loader content="Loading order details..." />
          </div>
        ) : !orderDetails ? (
          <Panel
            shaded
            bordered
            bodyFill
            className={`mx-auto max-w-3xl ${
              theme === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="p-8 text-center">
              <h2
                className={`mb-4 text-xl font-semibold ${
                  theme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Order Not Found
              </h2>
              <p
                className={`mb-4 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                The order you&apos;re looking for could not be found or you
                don&apos;t have permission to view it.
              </p>
              <Link href="/">
                <Button appearance="primary" color="green">
                  Return to Available Batches
                </Button>
              </Link>
            </div>
          </Panel>
        ) : (
          <div className="mx-auto max-w-3xl">
            <Panel
              shaded
              bordered
              bodyFill
              className={`mb-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-gray-100" : "text-gray-900"
                        }`}
                      >
                        {orderDetails.orderType === 'reel' ? 'Reel Order' : 'Order'} #{orderDetails.id}
                      </h2>
                      {orderDetails.orderType === 'reel' && (
                        <Tag color="violet" size="sm">
                          Quick Batch
                        </Tag>
                      )}
                    </div>
                    <p
                      className={`mt-1 ${
                        theme === "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      Created {orderDetails.createdAt}
                    </p>
                  </div>
                  <Tag color={getStatusColor(orderDetails.status)} size="lg">
                    {orderDetails.status}
                  </Tag>
                </div>

                <Divider
                  className={theme === "dark" ? "border-gray-700" : ""}
                />

                <div
                  className={`mb-6 rounded border p-4 ${
                    theme === "dark"
                      ? "border-gray-700 bg-gray-700/50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between">
                    <span
                      className={`font-medium ${
                        theme === "dark" ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Total Order Amount:
                    </span>
                    <span
                      className={`font-bold ${
                        theme === "dark" ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {formatCurrency(orderDetails.total)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between">
                    <span
                      className={`font-medium ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      Estimated Earnings:
                    </span>
                    <span
                      className={`font-bold ${
                        theme === "dark" ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {formatCurrency(orderDetails.estimatedEarnings)}
                    </span>
                  </div>
                </div>

                {/* Reel Order Specific Information */}
                {orderDetails.orderType === 'reel' && orderDetails.reel && (
                  <div
                    className={`mb-6 rounded border p-4 ${
                      theme === "dark"
                        ? "border-purple-700 bg-purple-900/20"
                        : "border-purple-200 bg-purple-50"
                    }`}
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                        🎬 Reel Details
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Product: 
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {orderDetails.reel.Product}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Quantity: 
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {orderDetails.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Price per item: 
                        </span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                          {formatCurrency(parseFloat(orderDetails.reel.Price))}
                        </span>
                      </div>
                      {orderDetails.deliveryNote && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Delivery Note: 
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {orderDetails.deliveryNote}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {orderDetails.status === "PENDING" && (
                  <div className="flex justify-end">
                    <Button
                      appearance="primary"
                      color="green"
                      size="lg"
                      onClick={handleAcceptOrder}
                      disabled={isAccepting}
                      className={theme === "dark" ? "rs-btn-dark" : ""}
                    >
                      {isAccepting ? (
                        <div className="flex items-center">
                          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                          Accepting...
                        </div>
                      ) : (
                        "Accept Batch"
                      )}
                    </Button>
                  </div>
                )}

                {orderDetails.status === "ASSIGNED" && (
                  <div className="flex justify-end space-x-4">
                    <Button
                      appearance="ghost"
                      color="red"
                      className={theme === "dark" ? "rs-btn-dark" : ""}
                    >
                      Cancel Batch
                    </Button>
                    <Button
                      appearance="primary"
                      color="blue"
                      className={theme === "dark" ? "rs-btn-dark" : ""}
                    >
                      Start Shopping
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          </div>
        )}
      </div>
    </ShopperLayout>
  );
}
