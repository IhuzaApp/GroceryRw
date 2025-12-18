import React, { useEffect } from "react";
import Image from "next/image";
import {
  Input,
  InputGroup,
  Button,
  Panel,
  Steps,
  Rate,
  Message,
} from "rsuite";
import Link from "next/link";
import { useState } from "react";
import { formatCurrency } from "../../../lib/formatCurrency";
import EstimatedDeliveryTime from "./EstimatedDeliveryTime";
import { useTheme } from "../../../context/ThemeContext";

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
  const { theme } = useTheme();
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

      {/* Feedback Modal - Tailwind CSS Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setFeedbackModal(false);
              setRating(0);
              setComment("");
              setSubmitError(null);
            }}
          />

          {/* Modal */}
          <div
            className={`relative z-10 w-full max-w-[550px] rounded-2xl border shadow-2xl ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b px-4 py-4 sm:px-6 ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${
                    theme === "dark"
                      ? "bg-orange-500/20"
                      : "bg-gradient-to-br from-orange-100 to-orange-50"
                  }`}
                >
                  <svg
                    className={`h-6 w-6 ${
                      theme === "dark" ? "text-orange-400" : "text-orange-600"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <div>
                  <h2
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Rate Your Restaurant Order
                  </h2>
                  <p
                    className={`mt-1 text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Help us improve by sharing your feedback
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackModal(false);
                  setRating(0);
                  setComment("");
                  setSubmitError(null);
                }}
                className={`rounded-lg p-2 transition-colors ${
                  theme === "dark"
                    ? "text-gray-400 hover:bg-gray-700 hover:text-gray-300"
                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div
              className={`max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              {submitError && (
                <div
                  className={`mb-6 rounded-lg p-4 ${
                    theme === "dark"
                      ? "bg-red-900/30 border border-red-800/50"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className={`h-5 w-5 ${
                          theme === "dark" ? "text-red-400" : "text-red-500"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-red-400" : "text-red-700"
                        }`}
                      >
                        {submitError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-6">
            {/* Rating Section - Redesigned */}
            <div className={`rounded-xl p-6 text-center transition-all ${
              theme === "dark"
                ? "bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-700"
                : "bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200"
            }`}>
              <h4 className={`mb-4 text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                How was your experience?
              </h4>
              <div className="flex justify-center mb-4">
                <Rate
                  defaultValue={0}
                  value={rating}
                  onChange={setRating}
                  color={rating > 3 ? "orange" : rating > 0 ? "yellow" : undefined}
                  size="lg"
                  className="text-4xl"
                />
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                theme === "dark"
                  ? "bg-gray-700/50"
                  : "bg-white/80"
              }`}>
                <p className={`text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  {rating === 0 && "Select your rating"}
                  {rating === 1 && "⭐ Poor"}
                  {rating === 2 && "⭐⭐ Fair"}
                  {rating === 3 && "⭐⭐⭐ Good"}
                  {rating === 4 && "⭐⭐⭐⭐ Very Good"}
                  {rating === 5 && "⭐⭐⭐⭐⭐ Excellent"}
                </p>
              </div>
            </div>
            {/* Details Section - Redesigned */}
            <div className={`space-y-4 rounded-xl p-6 border ${
              theme === "dark"
                ? "bg-gray-700/30 border-gray-700"
                : "bg-white border-gray-200"
            }`}>
              <h4 className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}>
                Additional Feedback
              </h4>
              <div>
                <label className={`mb-2 block text-sm font-medium ${
                  theme === "dark" ? "text-gray-300" : "text-gray-700"
                }`}>
                  Share your thoughts (Optional)
                </label>
                <textarea
                  className={`w-full rounded-lg p-4 text-sm transition-all ${
                    theme === "dark"
                      ? "bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-orange-500 focus:ring-orange-500/50"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500"
                  } border focus:outline-none focus:ring-2`}
                  placeholder="Tell us what you liked or what we could improve..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
            </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`flex w-full flex-col-reverse gap-3 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6 ${
                theme === "dark" ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
              }`}
            >
            <button
              onClick={() => {
                setFeedbackModal(false);
                setRating(0);
                setComment("");
                setSubmitError(null);
              }}
              className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                theme === "dark"
                  ? "border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500"
              } border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitRating}
              disabled={submitting}
              className={`flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all ${
                theme === "dark"
                  ? "bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 focus:ring-orange-500"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              type="submit"
            >
              {submitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Submit Rating
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      <style jsx global>{`
        .rs-modal-header {
          border-bottom: 1px solid !important;
          padding: 1.5rem !important;
        }
        .rs-modal-body {
          padding: 0 !important;
        }
        .rs-modal-footer {
          padding: 0 !important;
          border-top: 1px solid !important;
        }
        .rs-rate-character-active {
          color: #eab308 !important;
        }
        .rs-rate-character:hover {
          transform: scale(1.1);
          transition: transform 0.2s ease;
        }
        .rs-modal-content {
          border-radius: 1rem !important;
          overflow: hidden !important;
        }
        .dark .rs-modal-content {
          background-color: #1f2937 !important;
        }
        .dark .rs-modal-header {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        .dark .rs-modal-body {
          background-color: #1f2937 !important;
        }
        .dark .rs-modal-footer {
          background-color: #1f2937 !important;
          border-color: #374151 !important;
        }
        /* Dark theme styles for Steps in Order Status card */
        .dark .rs-steps-item-title {
          color: #ffffff !important;
        }
        .dark .rs-steps-item-description {
          color: #e5e7eb !important;
        }
        .dark .rs-steps-item-title-wrapper {
          color: #ffffff !important;
        }
        .dark .rs-steps-item-content {
          color: #ffffff !important;
        }
        .dark .rs-steps-item-icon-wrapper {
          color: #ffffff !important;
        }
        .dark .rs-steps-item-status-wait .rs-steps-item-icon-wrapper {
          color: #9ca3af !important;
          border-color: #9ca3af !important;
        }
        @media (max-width: 640px) {
          .rs-modal {
            margin: 1rem !important;
          }
          .rs-modal-header {
            padding: 1.25rem !important;
          }
          .rs-rate {
            font-size: 2.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
