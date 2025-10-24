import React, { useEffect } from "react";
import Image from "next/image";
import {
  Input,
  InputGroup,
  Button,
  Panel,
  Steps,
  Rate,
  Modal,
  Message,
} from "rsuite";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "../../../lib/formatCurrency";
import EstimatedDeliveryTime from "./EstimatedDeliveryTime";

// Helper to pad order IDs to at least 4 digits
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

interface UserRestaurantOrderDetailsProps {
  order: any;
  isMobile?: boolean;
}

export default function UserRestaurantOrderDetails({
  order,
  isMobile = false,
}: UserRestaurantOrderDetailsProps) {
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasExistingRating, setHasExistingRating] = useState(false);

  // Check for existing rating
  useEffect(() => {
    const checkExistingRating = async () => {
      try {
        const response = await fetch(
          `/api/queries/checkRating?orderId=${order.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setHasExistingRating(data.Ratings && data.Ratings.length > 0);
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
      }
    };

    checkExistingRating();
  }, [order.id]);

  // Function to check if preparation time has elapsed and update status
  const checkAndUpdatePreparationStatus = async () => {
    if (order.status !== "CONFIRMED") return;

    // Calculate total preparation time from all dishes
    const totalPrepTimeMinutes =
      order.restaurant_dishe_orders?.reduce((total, item) => {
        const prepTime = item.dish?.preparingTime || "0min";
        const minutes = parseInt(prepTime.replace(/[^\d]/g, "")) || 0;
        return Math.max(total, minutes); // Use the longest preparation time
      }, 0) || 0;

    if (totalPrepTimeMinutes === 0) return;

    // Calculate time elapsed since order was confirmed
    const orderCreatedTime = new Date(order.created_at).getTime();
    const currentTime = new Date().getTime();
    const elapsedMinutes = Math.floor(
      (currentTime - orderCreatedTime) / (1000 * 60)
    );

    // If preparation time has elapsed, update status to READY
    if (elapsedMinutes >= totalPrepTimeMinutes) {
      try {
        const response = await fetch("/api/restaurant/update-order-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            status: "READY",
          }),
        });

        if (response.ok) {
          // Update the local order status
          order.status = "READY";
          window.location.reload(); // Refresh to show updated status
        }
      } catch (error) {
        console.error("Error updating order status:", error);
      }
    }
  };

  // Check preparation status on component mount and set interval
  useEffect(() => {
    if (order.status === "CONFIRMED") {
      // Check immediately
      checkAndUpdatePreparationStatus();

      // Check every minute
      const interval = setInterval(checkAndUpdatePreparationStatus, 60000);

      return () => clearInterval(interval);
    }
  }, [order.status, order.created_at]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      setSubmitError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          rating: rating,
          comment: comment.trim(),
          shopId: order.Restaurant?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to submit rating");
      }

      setFeedbackModal(false);
      setRating(0);
      setComment("");
      setHasExistingRating(true);
      Message.success("Thank you for your feedback!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit rating"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getOrderStatus = () => {
    switch (order.status) {
      case "WAITING_FOR_CONFIRMATION":
        return "Waiting for Confirmation";
      case "PENDING":
        return "Order Placed";
      case "CONFIRMED":
        return "Confirmed";
      case "READY":
        return "Ready";
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery";
      case "DELIVERED":
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  const getOrderStatusColor = () => {
    switch (order.status) {
      case "WAITING_FOR_CONFIRMATION":
        return "warning";
      case "PENDING":
        return "processing";
      case "CONFIRMED":
      case "READY":
        return "info";
      case "OUT_FOR_DELIVERY":
        return "primary";
      case "DELIVERED":
        return "success";
      default:
        return "default";
    }
  };

  const getCurrentStep = () => {
    switch (order.status) {
      case "WAITING_FOR_CONFIRMATION":
        return 0;
      case "PENDING":
        return 1;
      case "CONFIRMED":
        return 2;
      case "READY":
        return 3;
      case "OUT_FOR_DELIVERY":
        return 4;
      case "DELIVERED":
        return 5;
      default:
        return 0;
    }
  };

  const steps = [
    "Order Placed",
    "Confirmed",
    "Ready",
    "Out for Delivery",
    "Delivered",
  ];

  return (
    <div className="space-y-6">
      {/* Header - Only show on desktop */}
      {!isMobile && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{formatOrderID(order.OrderID)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Placed {timeAgo(order.created_at)}
            </p>
          </div>
          <Link href="/CurrentPendingOrders">
            <Button
              appearance="ghost"
              className="text-green-500 hover:text-green-600"
            >
              ← Back to Orders
            </Button>
          </Link>
        </div>
      )}

      {/* Restaurant Information */}
      {order.Restaurant && (
        <Panel className="border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {order.Restaurant.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {order.Restaurant.location}
              </p>
              {order.Restaurant.phone && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  📞 {order.Restaurant.phone}
                </p>
              )}
            </div>
          </div>
        </Panel>
      )}

      {/* Order Status */}
      <Panel className="border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Order Status
          </h3>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Current Status Badge */}
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  order.status === "WAITING_FOR_CONFIRMATION"
                    ? "bg-yellow-100 dark:bg-yellow-900/20"
                    : order.status === "PENDING"
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : order.status === "CONFIRMED"
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : order.status === "READY"
                    ? "bg-green-100 dark:bg-green-900/20"
                    : order.status === "OUT_FOR_DELIVERY"
                    ? "bg-purple-100 dark:bg-purple-900/20"
                    : order.status === "DELIVERED"
                    ? "bg-green-100 dark:bg-green-900/20"
                    : "bg-gray-100 dark:bg-gray-900/20"
                }`}
              >
                <svg
                  className={`h-5 w-5 ${
                    order.status === "WAITING_FOR_CONFIRMATION"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : order.status === "PENDING"
                      ? "text-blue-600 dark:text-blue-400"
                      : order.status === "CONFIRMED"
                      ? "text-blue-600 dark:text-blue-400"
                      : order.status === "READY"
                      ? "text-green-600 dark:text-green-400"
                      : order.status === "OUT_FOR_DELIVERY"
                      ? "text-purple-600 dark:text-purple-400"
                      : order.status === "DELIVERED"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {order.status === "WAITING_FOR_CONFIRMATION" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : order.status === "PENDING" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : order.status === "CONFIRMED" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : order.status === "READY" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  ) : order.status === "OUT_FOR_DELIVERY" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : order.status === "DELIVERED" ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <div className="flex-grow">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    order.status === "WAITING_FOR_CONFIRMATION"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : order.status === "PENDING"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : order.status === "CONFIRMED"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                      : order.status === "READY"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : order.status === "OUT_FOR_DELIVERY"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                      : order.status === "DELIVERED"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                  }`}
                >
                  {getOrderStatus()}
                </span>
              </div>
            </div>

            {/* Status Description */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {order.status === "WAITING_FOR_CONFIRMATION" &&
                "Restaurant is reviewing your order"}
              {order.status === "PENDING" &&
                "Order confirmed and being prepared"}
              {order.status === "CONFIRMED" &&
                "Restaurant is preparing your food"}
              {order.status === "READY" && "Your order is ready for pickup"}
              {order.status === "OUT_FOR_DELIVERY" &&
                "Your order is on the way"}
              {order.status === "DELIVERED" &&
                "Order has been delivered successfully"}
            </div>
          </div>
        </div>

        {/* Progress Steps - Desktop only */}
        <div className="hidden sm:block">
          <Steps current={getCurrentStep()} className="mt-4">
            {steps.map((step, index) => (
              <Steps.Item key={index} title={step} />
            ))}
          </Steps>
        </div>
      </Panel>

      {/* Delivery & Shopper Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Delivery Information */}
        <Panel className="border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Delivery Information
          </h3>
          {order.Address && (
            <div className="space-y-2">
              <p className="text-gray-900 dark:text-white">
                <strong>Address:</strong> {order.Address.street},{" "}
                {order.Address.city} {order.Address.postal_code}
              </p>
              {order.delivery_notes && (
                <p className="text-gray-600 dark:text-gray-400">
                  <strong>Notes:</strong> {order.delivery_notes}
                </p>
              )}
              {order.delivery_time && (
                <div className="mt-4">
                  <EstimatedDeliveryTime
                    estimatedDelivery={order.delivery_time}
                    status={order.status}
                  />
                </div>
              )}
            </div>
          )}
        </Panel>

        {/* Assigned Shopper Details */}
        <Panel className="border border-gray-200 dark:border-gray-700">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Assigned Shopper
          </h3>
          {order.shopper_id ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                    <svg
                      className="h-8 w-8 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Shopper Assigned
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your order has been assigned to a shopper
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Shopper ID: {order.shopper_id.slice(-8)}
                  </p>
                </div>
              </div>

              {/* Shopper Contact Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    📞 +250 788 123 456
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    💬 Message Shopper
                  </span>
                </div>
              </div>

              {/* Shopper Details */}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Name:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      John Doe
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Gender:
                    </span>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      Male
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Rating:
                    </span>
                    <div className="flex items-center">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className="h-4 w-4 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                        (4.8)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-300">
                  Active
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Waiting for shopper assignment
                </p>
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Order Items */}
      <Panel className="border border-gray-200 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Order Items ({order.itemsCount} dishes)
        </h3>
        <div className="space-y-4">
          {order.restaurant_dishe_orders?.map((item: any, index: number) => (
            <div
              key={index}
              className="flex flex-col gap-3 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
            >
              {/* Image */}
              <div className="flex-shrink-0 self-center sm:self-start">
                <Image
                  src={item.dish?.image || "/images/restaurantDish.png"}
                  alt={item.dish?.name || "Dish"}
                  width={isMobile ? 56 : 64}
                  height={isMobile ? 56 : 64}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-grow">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left side - Dish info */}
                  <div className="min-w-0 flex-grow">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                      {item.dish?.name || "Unknown Dish"}
                    </h4>
                    {item.dish?.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                        {item.dish.description}
                      </p>
                    )}
                    {item.dish?.preparingTime && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        ⏱️ Prep time: {item.dish.preparingTime}
                      </p>
                    )}
                  </div>

                  {/* Right side - Quantity and price */}
                  <div className="mt-2 flex items-center justify-between sm:mt-0 sm:flex-col sm:items-end sm:gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                        Qty:
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white sm:text-base">
                        {item.quantity}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                      {formatCurrency(
                        parseFloat(item.dish?.price || item.price) *
                          parseInt(item.quantity)
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {/* Order Summary */}
      <Panel className="border border-gray-200 dark:border-gray-700">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Order Summary
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(order.subtotal || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Tax (18%):</span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(order.tax || 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Delivery Fee:
            </span>
            <span className="text-gray-900 dark:text-white">
              {formatCurrency(parseFloat(order.delivery_fee || "0"))}
            </span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                Discount:
              </span>
              <span className="text-red-600 dark:text-red-400">
                -{formatCurrency(order.discount)}
              </span>
            </div>
          )}
          {order.voucher_code && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Voucher:</span>
              <span className="text-gray-900 dark:text-white">
                {order.voucher_code}
              </span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total:
              </span>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>
      </Panel>

      {/* Rating Section */}
      {order.status === "DELIVERED" && (
        <Panel className="border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rate Your Experience
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Help us improve by rating your order
              </p>
            </div>
            {!hasExistingRating && (
              <Button
                appearance="primary"
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => setFeedbackModal(true)}
              >
                Rate Order
              </Button>
            )}
            {hasExistingRating && (
              <div className="text-green-600 dark:text-green-400">
                ✓ Thank you for your feedback!
              </div>
            )}
          </div>
        </Panel>
      )}

      {/* Feedback Modal */}
      <Modal
        open={feedbackModal}
        onClose={() => setFeedbackModal(false)}
        title="Rate Your Restaurant Order"
        size="sm"
      >
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rating
              </label>
              <Rate
                value={rating}
                onChange={setRating}
                size="lg"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Comments (Optional)
              </label>
              <Input
                as="textarea"
                rows={3}
                value={comment}
                onChange={setComment}
                placeholder="Tell us about your experience..."
                className="mt-1"
              />
            </div>
            {submitError && <Message type="error" description={submitError} />}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setFeedbackModal(false)}
            appearance="ghost"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRating}
            appearance="primary"
            className="bg-orange-500 hover:bg-orange-600"
            loading={submitting}
          >
            Submit Rating
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
