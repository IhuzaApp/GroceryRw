import React, { useEffect } from "react";
import Image from "next/image";
import { Input, InputGroup, Button, Panel, Steps } from "rsuite";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { formatCurrency } from "../../../lib/formatCurrency";
import EstimatedDeliveryTime from "./EstimatedDeliveryTime";
import { useTheme } from "../../../context/ThemeContext";
import FeedbackModal from "./FeedbackModal";

// Helper to pad order IDs to at least 4 digits
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

interface UserOrderDetailsProps {
  order: any;
  isMobile?: boolean;
}
export default function UserOrderDetails({
  order,
  isMobile = false,
}: UserOrderDetailsProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [feedbackModal, setFeedbackModal] = useState(false);
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

    if (order?.id) {
      checkExistingRating();
    }
  }, [order?.id]);

  // Get shopper details from order.Shoppers
  const shopper = order.Shoppers?.shopper;
  const shopperPhone = shopper?.phone_number || order.Shoppers?.phone;
  const shopperName = shopper?.full_name || order.Shoppers?.name || "Plaser";
  const shopperProfilePhoto =
    shopper?.profile_photo || order.Shoppers?.profile_picture;
  const hasShopper = order.Shoppers && (shopper || order.shopper_id);

  const getStatusStep = (status: string, hasShopper: boolean) => {
    // If no Plaser is assigned yet
    if (!hasShopper) {
      return 0;
    }
    // Step indices shifted by +1 due to the new initial step
    switch (status) {
      case "shopping":
        return 1;
      case "packing":
        return 2;
      case "on_the_way":
        return 3;
      case "delivered":
        return 4;
      default:
        return 1;
    }
  };

  // Safely calculate total for an array of order items
  const getOrderItemsTotal = (orderItems: any[] | undefined | null): number => {
    if (!Array.isArray(orderItems)) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[UserOrderDetails] getOrderItemsTotal called with non-array:",
          orderItems
        );
      }
      return 0;
    }

    const total = orderItems.reduce((sum: number, item: any, index: number) => {
      if (!item) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[UserOrderDetails] Skipping falsy item at index",
            index,
            item
          );
        }
        return sum;
      }

      const product = item.product;
      if (!product) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[UserOrderDetails] Item without product at index",
            index,
            item
          );
        }
        return sum;
      }

      const rawPrice =
        product.final_price ?? item.price ?? product.price ?? "0";
      const price = parseFloat(String(rawPrice));

      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : parseFloat(String(item.quantity ?? "0")) || 0;

      if (process.env.NODE_ENV === "development") {
        console.log("[UserOrderDetails] Item calc", {
          index,
          productId: product.id,
          rawPrice,
          price,
          quantity,
          lineTotal: price * quantity,
        });
      }

      if (Number.isNaN(price) || Number.isNaN(quantity)) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[UserOrderDetails] Skipping NaN price/quantity for item at index",
            index,
            {
              rawPrice,
              price,
              quantity,
            }
          );
        }
        return sum;
      }

      return sum + price * quantity;
    }, 0);

    if (process.env.NODE_ENV === "development") {
      console.log("[UserOrderDetails] getOrderItemsTotal result:", {
        count: orderItems.length,
        total,
      });
    }

    return total;
  };

  const handleFeedbackSubmit = async (
    ratings: {
      rating: number;
      packaging_quality: number;
      delivery_experience: number;
      professionalism: number;
    },
    comment: string
  ) => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/ratings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: order.id,
          shopper_id: order.Shoppers?.id || order.shopper_id,
          rating: ratings.rating.toString(),
          review: comment,
          delivery_experience: ratings.delivery_experience.toString(),
          packaging_quality: ratings.packaging_quality.toString(),
          professionalism: ratings.professionalism.toString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit feedback");
      }

      // Close modal and update state
      setFeedbackModal(false);
      setHasExistingRating(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit feedback"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Order Tracking Header - Only show on desktop */}
      {!isMobile && (
        <div className="mb-6 flex items-center">
          <Link
            href="/CurrentPendingOrders"
            className="flex items-center text-gray-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mr-2 h-5 w-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">
            Order #{formatOrderID(order.OrderID)}
          </h1>
          <span className="ml-2 text-gray-500">Placed on {order.placedAt}</span>
        </div>
      )}

      <Panel shaded bordered className="mb-6">
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Order Status</h2>
          {isMobile ? (
            // Mobile: Simple status display or Plaser details
            <div className="py-4">
              {order.status === "delivered" ? (
                <div className="text-center">
                  <div className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                    Delivered
                  </div>
                  {order.deliveryPhotoUrl ? (
                    <div className="mt-3">
                      <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Delivery Proof
                      </p>
                      <div className="relative mx-auto max-w-[280px] overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700">
                        <Image
                          src={order.deliveryPhotoUrl}
                          alt="Delivery proof"
                          width={280}
                          height={280}
                          className="h-auto w-full object-cover"
                          unoptimized
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Order completed successfully
                    </div>
                  )}
                </div>
              ) : hasShopper ? (
                // Show shopper details when assigned (regardless of status) - Mobile enhanced view
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/30">
                      {shopperProfilePhoto ? (
                        <Image
                          src={shopperProfilePhoto}
                          alt={shopperName}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-8 w-8 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-base font-semibold text-gray-900 dark:text-white">
                        {shopperName}
                      </div>
                      {shopperPhone && (
                        <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {shopperPhone}
                        </div>
                      )}
                      {order.Shoppers?.email && (
                        <div className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {order.Shoppers.email}
                        </div>
                      )}
                    </div>
                  </div>
                  {order.status !== "delivered" && (
                    <div className="flex gap-2">
                      <Button
                        appearance="primary"
                        block
                        className="bg-green-500 text-white"
                        onClick={() => {
                          if (shopperPhone) {
                            window.location.href = `tel:${shopperPhone}`;
                          }
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                        </svg>
                        Call
                      </Button>
                      <Button
                        appearance="ghost"
                        block
                        className="border border-gray-300 dark:border-gray-600"
                        onClick={() => {
                          if (order?.id) {
                            router.push(`/Messages?orderId=${order.id}`);
                          }
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="mr-2 h-4 w-4"
                        >
                          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 a8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                        </svg>
                        Message
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.status === "on_the_way"
                      ? "On the Way"
                      : order.status === "packing"
                      ? "Packing"
                      : order.status === "shopping"
                      ? "Shopping"
                      : "Pending Assignment"}
                  </div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {order.status === "on_the_way"
                      ? "Heading to your location"
                      : order.status === "packing"
                      ? "Preparing for delivery"
                      : order.status === "shopping"
                      ? "Picking your items"
                      : "Waiting for assignment"}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Desktop: Full steps display
            <div className="custom-steps-wrapper">
              <Steps
                current={getStatusStep(order.status, hasShopper)}
                className="custom-steps"
                vertical={false}
              >
                <Steps.Item
                  title="Awaiting Assignment"
                  description="Waiting for assignment"
                />
                <Steps.Item title="Shopping" description="Picking your items" />
                <Steps.Item
                  title="Packing"
                  description="Preparing for delivery"
                />
                <Steps.Item
                  title="On the way"
                  description="Heading to your location"
                />
                <Steps.Item
                  title="Delivered"
                  description="Enjoy your groceries!"
                />
              </Steps>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Delivery Info - Hidden on desktop */}
          <div className="w-full md:hidden">
            <p className="mb-2 text-gray-600">Estimated delivery time:</p>
            <EstimatedDeliveryTime
              estimatedDelivery={order.estimatedDelivery}
              status={order.status}
            />
          </div>

          {/* Action Buttons */}
          {order.status === "delivered" && !hasExistingRating ? (
            <button
              className="inline-flex items-center rounded-md bg-green-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={() => setFeedbackModal(true)}
            >
              <svg
                className="mr-1.5 h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Feedback
            </button>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button className="group flex items-center justify-center gap-2 !rounded-md bg-gradient-to-r from-green-500 to-green-600 px-4 py-2.5 text-sm font-semibold !text-white shadow-md transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-[0.98]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-5 w-5 !text-white transition-transform group-hover:scale-110"
                >
                  <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                </svg>
                Contact Support
              </button>
              {/* 
              <Button
                appearance="primary"
                className="flex items-center justify-center bg-green-500 text-white transition hover:bg-green-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-1 h-4 w-4"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                </svg>
                Track Live
              </Button> */}
            </div>
          )}
        </div>
      </Panel>

      {/* Order Content */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left Column - Order Details */}
        <div className="w-full md:w-2/3">
          <Panel shaded bordered className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Order Details</h2>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {order.Order_Items?.length || 0} items
              </span>
            </div>
            <div className="space-y-6">
              <div>
                {/* Shop Header (single order) */}
                {order.shop && (
                  <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    {order.shop.image && (
                      <Image
                        src={order.shop.image}
                        alt={order.shop.name}
                        width={48}
                        height={48}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {order.shop.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Order #{formatOrderID(order.OrderID)} •{" "}
                        {order.Order_Items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Subtotal
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatCurrency(getOrderItemsTotal(order.Order_Items))}
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-4">
                  {order.Order_Items?.map((item: any, index: number) => (
                    <div
                      key={item.id || index}
                      className="flex items-center gap-4 border-b pb-4 last:border-0"
                    >
                      <div className="h-16 w-16 flex-shrink-0">
                        <Image
                          src={
                            (item.product?.ProductName?.image ||
                              item.product?.image) ??
                            "/images/groceryPlaceholder.png"
                          }
                          alt={item.product?.ProductName?.name || "Product"}
                          width={60}
                          height={60}
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">
                            {item.product?.ProductName?.name || "Product"}
                          </h3>
                          {order.shop?.name && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                              {order.shop.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>
                            {item.quantity} ×{" "}
                            {formatCurrency(
                              parseFloat(item.product?.final_price || "0")
                            )}
                          </span>
                          <span className="font-bold">
                            {formatCurrency(
                              parseFloat(item.product?.final_price || "0") *
                                item.quantity
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) ?? null}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              {/* Subtotal */}
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium">
                  {formatCurrency(getOrderItemsTotal(order.Order_Items))}
                </span>
              </div>

              {/* Service Fee */}
              <div className="mb-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Service Fee
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Number(order.serviceFee) || 0)}
                  </span>
                </div>
              </div>

              {/* Delivery Fee */}
              <div className="mb-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Delivery Fee
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Number(order.deliveryFee) || 0)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {formatCurrency(
                    getOrderItemsTotal(order.Order_Items) +
                      (Number(order.serviceFee) || 0) +
                      (Number(order.deliveryFee) || 0)
                  )}
                </span>
              </div>
            </div>
          </Panel>

          <Panel shaded bordered>
            <h2 className="mb-4 text-xl font-bold">Delivery Information</h2>

            {/* Delivery Time */}
            <div className="mb-6">
              <h3 className="mb-2 font-semibold">Estimated Delivery Time</h3>
              <EstimatedDeliveryTime
                estimatedDelivery={order.estimatedDelivery}
                status={order.status}
              />
            </div>

            {/* Delivery Address */}
            <div>
              <h3 className="mb-2 font-semibold">Delivery Address</h3>
              <div className="flex items-start gap-3">
                <div className="mt-1 text-green-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <p className="font-medium">
                    {order.address?.street || "Address not available"}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {order.address?.city || "City"},{" "}
                    {order.address?.postal_code || "Postal Code"}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Notes if any */}
            {order.deliveryNotes && (
              <div className="mt-6">
                <h3 className="mb-2 font-semibold">Delivery Notes</h3>
                <div className="rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <p>{order.deliveryNotes}</p>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column - Assigned Person (Desktop only) */}
        <div className="hidden w-full md:block md:w-1/3">
          <Panel shaded bordered className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-green-50 to-green-100/50 px-6 py-5 dark:from-green-900/20 dark:to-green-800/10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {order.status === "shopping" || order.status === "packing"
                  ? "Your Plaser"
                  : "Your Plaser"}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {order.status === "shopping"
                  ? "Currently shopping for your items"
                  : order.status === "packing"
                  ? "Preparing your order"
                  : order.status === "on_the_way"
                  ? "On the way to you"
                  : "Assigned to your order"}
              </p>
            </div>

            {hasShopper ? (
              <div className="p-4">
                {/* Profile Icon and Info Row */}
                <div className="flex items-center gap-3">
                  {/* Profile Icon */}
                  <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-green-600 ring-2 ring-green-100 dark:ring-green-900/30">
                    {shopperProfilePhoto ? (
                      <Image
                        src={shopperProfilePhoto}
                        alt={shopperName}
                        width={56}
                        height={56}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-7 w-7 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Name, Phone, Email - Horizontal Layout */}
                  <div className="flex flex-1 flex-col gap-1.5">
                    {/* Name */}
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {shopperName}
                    </h3>

                    {/* Phone, Email in a row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Phone */}
                      {shopperPhone && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <svg
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          <span className="text-xs">{shopperPhone}</span>
                        </div>
                      )}

                      {/* Email */}
                      {order.Shoppers?.email && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <svg
                            className="h-3.5 w-3.5 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="text-xs">
                            {order.Shoppers.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      if (shopperPhone) {
                        window.location.href = `tel:${shopperPhone}`;
                      }
                    }}
                    disabled={order.status === "delivered" || !shopperPhone}
                    className={`flex flex-1 items-center justify-center gap-1.5 !rounded-md px-3 py-2 text-xs font-semibold !text-white shadow-md transition-all duration-200 ${
                      order.status === "delivered" || !shopperPhone
                        ? "cursor-not-allowed bg-gray-400 opacity-50"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg active:scale-[0.98]"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="h-4 w-4 !text-white"
                    >
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                    </svg>
                    Call
                  </button>
                  <button
                    disabled={order.status === "delivered"}
                    onClick={() => {
                      if (order?.id && order.status !== "delivered") {
                        router.push(`/Messages?orderId=${order.id}`);
                      }
                    }}
                    className={`flex flex-1 items-center justify-center gap-1.5 !rounded-md border-2 px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                      order.status === "delivered"
                        ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 opacity-50 dark:border-gray-700 dark:bg-gray-800"
                        : "border-green-500 bg-white text-green-600 hover:bg-green-50 hover:shadow-md active:scale-[0.98] dark:border-green-600 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-green-900/20"
                    }`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="h-4 w-4"
                    >
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 a8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                    </svg>
                    Message
                  </button>
                </div>

                {/* Ratings Section - Show ratings from order.Shoppers.Ratings if available */}
                {order.Shoppers?.Ratings && order.Shoppers.Ratings.length > 0 && (
                  <div className="mt-8 w-full border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Ratings & Reviews
                      </h3>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {order.Shoppers.Ratings.length} review
                        {order.Shoppers.Ratings.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div
                      className="max-h-[280px] space-y-3 overflow-y-auto pr-2"
                      style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 #f1f5f9",
                      }}
                    >
                      {order.Shoppers.Ratings.map((rating: any) => (
                        <div
                          key={rating.id}
                          className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-green-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-green-600"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex-1">
                              {rating.reviewed_at && (
                                <p className="text-xs text-gray-400 dark:text-gray-400">
                                  {new Date(
                                    rating.reviewed_at
                                  ).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-yellow-50 px-2 py-1 dark:bg-yellow-900/20">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 transition-all ${
                                    i < Number(rating.rating || 0)
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
                                  }`}
                                  viewBox="0 0 20 20"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                              <span className="ml-1.5 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                                {Number(rating.rating || 0).toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {rating.review && (
                            <p className="text-left text-sm leading-relaxed text-black dark:text-white">
                              {rating.review}
                            </p>
                          )}
                          {(rating.packaging_quality ||
                            rating.delivery_experience ||
                            rating.professionalism) && (
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              {rating.packaging_quality && (
                                <span className="rounded bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Packaging:{" "}
                                  {Number(rating.packaging_quality).toFixed(1)}
                                </span>
                              )}
                              {rating.delivery_experience && (
                                <span className="rounded bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Delivery:{" "}
                                  {Number(rating.delivery_experience).toFixed(
                                    1
                                  )}
                                </span>
                              )}
                              {rating.professionalism && (
                                <span className="rounded bg-gray-100 px-2 py-1 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Professionalism:{" "}
                                  {Number(rating.professionalism).toFixed(1)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <svg
                    className="h-10 w-10 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  No Plaser assigned yet
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Waiting for assignment
                </p>
              </div>
            )}
          </Panel>

          {order.status === "on_the_way" && (
            <Panel shaded bordered className="mt-6">
              <h2 className="mb-4 text-xl font-bold">Live Tracking</h2>
              <div className="flex h-48 items-center justify-center rounded-lg bg-gray-200">
                <p className="text-gray-500">Map view would appear here</p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Current location:</p>
                <p className="font-medium">
                  2.5 miles away • Arriving in ~15 minutes
                </p>
              </div>
            </Panel>
          )}

          {order.status === "delivered" && order.deliveryPhotoUrl && (
            <Panel shaded bordered className="mt-6">
              <h2 className="mb-4 text-xl font-bold">Delivery Proof</h2>
              <div className="relative mx-auto overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700">
                <Image
                  src={order.deliveryPhotoUrl}
                  alt="Delivery proof"
                  width={448}
                  height={448}
                  className="h-auto w-full object-cover"
                  unoptimized
                />
              </div>
            </Panel>
          )}
        </div>
      </div>

      {/* Feedback Modal - Custom Component */}
      <FeedbackModal
        isOpen={feedbackModal}
        onClose={() => {
          setFeedbackModal(false);
          setSubmitError(null);
        }}
        onSubmit={handleFeedbackSubmit}
        submitting={submitting}
        submitError={submitError}
        accentColor="green"
      />

      <style jsx global>{`
        .custom-steps
          .rs-steps-item-status-process
          .rs-steps-item-icon-wrapper {
          background-color: #22c55e !important;
          border-color: #22c55e !important;
        }
        .custom-steps .rs-steps-item-status-finish .rs-steps-item-icon-wrapper {
          color: #22c55e !important;
          border-color: #22c55e !important;
        }
        .custom-steps .rs-steps-item-status-finish .rs-steps-item-tail {
          border-color: #22c55e !important;
        }
        /* Dark theme styles for Steps */
        .dark .custom-steps .rs-steps-item-title {
          color: #ffffff !important;
        }
        .dark .custom-steps .rs-steps-item-description {
          color: #e5e7eb !important;
        }
        .dark .custom-steps .rs-steps-item-title-wrapper {
          color: #ffffff !important;
        }
        .dark .custom-steps .rs-steps-item-content {
          color: #ffffff !important;
        }
        /* Ensure step icons are visible in dark theme */
        .dark .custom-steps .rs-steps-item-icon-wrapper {
          color: #ffffff !important;
        }
        .dark
          .custom-steps
          .rs-steps-item-status-wait
          .rs-steps-item-icon-wrapper {
          color: #9ca3af !important;
          border-color: #9ca3af !important;
        }
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
    </>
  );
}
