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

interface UserReelOrderDetailsProps {
  order: any;
  isMobile?: boolean;
}

export default function UserReelOrderDetails({
  order,
  isMobile = false,
}: UserReelOrderDetailsProps) {
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
          `/api/queries/checkRating?reelOrderId=${order.id}`
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

  const getStatusStep = (status: string, assignedTo: any) => {
    // If no shopper is assigned yet
    if (!assignedTo) {
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

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      setSubmitError("Please provide a rating");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/ratings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reel_order_id: order.id,
          shopper_id: order.assignedTo.id,
          rating: rating.toString(),
          review: comment,
          delivery_experience: rating.toString(),
          packaging_quality: rating.toString(),
          professionalism: rating.toString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit feedback");
      }

      // Close modal and update state
      setFeedbackModal(false);
      setRating(0);
      setComment("");
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
            Reel Order #{formatOrderID(order.OrderID)}
          </h1>
          <span className="ml-2 text-gray-500">Placed on {order.placedAt}</span>
        </div>
      )}

      {/* Order Status */}
      <Panel shaded bordered className="mb-6">
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Order Status</h2>
          {isMobile ? (
            // Mobile: Simple status display or shopper details
            <div className="py-4">
              {order.status === "delivered" ? (
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Delivered
                  </div>
                  <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Order completed successfully
                  </div>
                </div>
              ) : order.assignedTo || order.shopper_id ? (
                // Show shopper details when assigned (regardless of status)
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-purple-100 dark:bg-purple-900/30">
                    {order.assignedTo?.profile_photo ? (
                      <Image
                        src={order.assignedTo.profile_photo}
                        alt={order.assignedTo.name || "Shopper"}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        className="h-6 w-6 text-purple-600 dark:text-purple-400"
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
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {order.assignedTo?.name || "Shopper Assigned"}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      {order.assignedTo?.rating && (
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-3 w-3 text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {order.assignedTo.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                      {order.assignedTo?.phone && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {order.assignedTo.phone}
                        </span>
                      )}
                    </div>
                  </div>
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
                      : "Waiting for shopper assignment"}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Desktop: Full steps display
            <div className="custom-steps-wrapper">
              <Steps
                current={getStatusStep(order.status, order.assignedTo)}
                className="custom-steps"
                vertical={false}
              >
                <Steps.Item
                  title="Awaiting Assignment"
                  description="Waiting for shopper assignment"
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
                <Steps.Item title="Delivered" description="Enjoy your order!" />
              </Steps>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Delivery Info */}
          <div className="w-full">
            <p className="mb-2 text-gray-600">Estimated delivery time:</p>
            <EstimatedDeliveryTime
              estimatedDelivery={order.estimatedDelivery}
              status={order.status}
            />
          </div>

          {/* Action Buttons */}
          {order.status === "delivered" && !hasExistingRating ? (
            <button
              className="inline-flex items-center rounded-md bg-purple-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
              <Button
                appearance="ghost"
                className="flex items-center justify-center bg-purple-500 text-white transition hover:bg-purple-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-1 h-4 w-4"
                >
                  <path d="M15.05 5A5 5 0 0119 8.95M15.05 1A9 9 0 0123 8.94m-1 7.98v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                </svg>
                Contact Support
              </Button>
            </div>
          )}
        </div>
      </Panel>

      {/* Order Content */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left Column - Order Details */}
        <div className="w-full md:w-2/3">
          <Panel shaded bordered className="mb-6">
            <h2 className="mb-4 text-xl font-bold">Reel Details</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                {/* Reel Video Thumbnail */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                  {order.reel?.video_url ? (
                    <video
                      src={order.reel.video_url}
                      className="h-full w-full object-cover"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-300">
                      <svg
                        className="h-8 w-8 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Reel Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {order.reel?.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.reel?.description}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Type: {order.reel?.type}</span>
                    <span>Category: {order.reel?.category}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Quantity
                </span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Base Price
                </span>
                <span className="font-medium">
                  {formatCurrency(parseFloat(order.reel?.Price || "0"))}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Service Fee
                </span>
                <span className="font-medium">
                  {formatCurrency(order.service_fee || 0)}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Fee
                </span>
                <span className="font-medium">
                  {formatCurrency(order.delivery_fee || 0)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="mb-2 flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount</span>
                  <span className="font-medium">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
              )}
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
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

            {/* Delivery Notes if any */}
            {order.delivery_note && (
              <div className="mt-6">
                <h3 className="mb-2 font-semibold">Delivery Notes</h3>
                <div className="rounded-lg bg-gray-50 p-3 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  <p>{order.delivery_note}</p>
                </div>
              </div>
            )}
          </Panel>
        </div>

        {/* Right Column - Assigned Person */}
        <div className="w-full md:w-1/3">
          <Panel shaded bordered className="overflow-hidden">
            <div className="relative bg-gradient-to-br from-purple-50 to-purple-100/50 px-6 py-5 dark:from-purple-900/20 dark:to-purple-800/10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {order.status === "shopping" || order.status === "packing"
                  ? "Your Shopper"
                  : "Your Delivery Person"}
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

            {order.assignedTo ? (
              <div className="p-6">
                <div className="flex flex-col items-center">
                  {/* Profile Image with Ring */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 opacity-20 blur-xl"></div>
                    <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ring-4 ring-purple-100 dark:border-gray-800 dark:ring-purple-900/30">
                      {order.assignedTo.profile_photo ? (
                        <Image
                          src={order.assignedTo.profile_photo}
                          alt={order.assignedTo.name}
                          width={112}
                          height={112}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image
                          src={"/assets/images/profile.jpg"}
                          alt={order.assignedTo.name}
                          width={112}
                          height={112}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {order.assignedTo.name}
                  </h3>

                  {/* Phone */}
                  {order.assignedTo.phone && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-1.5 dark:bg-gray-800">
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
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
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {order.assignedTo.phone}
                      </p>
                    </div>
                  )}

                  {/* Rating and Stats */}
                  <div className="mt-4 flex w-full items-center justify-center gap-4">
                    {(order.assignedTo?.rating !== undefined && order.assignedTo?.rating !== null) && (
                      <div className="flex flex-col items-center rounded-lg bg-yellow-50 px-4 py-2 dark:bg-yellow-900/20">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_: any, i: number) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(Number(order.assignedTo.rating) || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600"
                              }`}
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="mt-1 text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                          {Number(order.assignedTo.rating).toFixed(1)} Rating
                        </span>
                      </div>
                    )}
                    {order.assignedTo?.orders_aggregate?.aggregate?.count !== undefined && (
                      <div className="flex flex-col items-center rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-900/20">
                        <span className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {order.assignedTo.orders_aggregate.aggregate.count}
                        </span>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                          Orders
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 w-full space-y-3">
                    <button
                      onClick={() => {
                        if (order.assignedTo?.phone) {
                          window.location.href = `tel:${order.assignedTo.phone}`;
                        }
                      }}
                      disabled={order.status === "delivered" || !order.assignedTo?.phone}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 ${
                        order.status === "delivered" || !order.assignedTo?.phone
                          ? "cursor-not-allowed bg-gray-400 opacity-50"
                          : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-5 w-5"
                      >
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
                      </svg>
                      Call Shopper
                    </button>
                    <button
                      disabled={order.status === "delivered"}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                        order.status === "delivered"
                          ? "cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400 opacity-50 dark:border-gray-700 dark:bg-gray-800"
                          : "border-purple-500 bg-white text-purple-600 hover:bg-purple-50 hover:shadow-md active:scale-[0.98] dark:border-purple-600 dark:bg-gray-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="h-5 w-5"
                      >
                        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 a8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"></path>
                      </svg>
                      Send Message
                    </button>
                  </div>
                </div>
              </div>

                {/* Recent Reviews Section */}
                {order.assignedTo?.recentReviews && order.assignedTo.recentReviews.length > 0 && (
                  <div className="mt-8 w-full border-t border-gray-200 pt-6 dark:border-gray-700">
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Recent Reviews
                      </h3>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {order.assignedTo.recentReviews.length} review
                        {order.assignedTo.recentReviews.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="max-h-[280px] space-y-3 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9' }}>
                      {order.assignedTo.recentReviews.map((review: any) => (
                        <div
                          key={review.id}
                          className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-purple-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-purple-600"
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-100 to-purple-200 ring-2 ring-purple-50 dark:from-purple-900/30 dark:to-purple-800/30 dark:ring-purple-900/20">
                                {review.User?.profile_picture ? (
                                  <Image
                                    src={review.User.profile_picture}
                                    alt={review.User.name || "Customer"}
                                    width={32}
                                    height={32}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
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
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-400 dark:text-gray-400">
                                  {review.User?.name || "Anonymous Customer"}
                                </p>
                                {review.reviewed_at && (
                                  <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-400">
                                    {new Date(review.reviewed_at).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-0.5 rounded-lg bg-yellow-50 px-2 py-1 dark:bg-yellow-900/20">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 transition-all ${
                                    i < (review.rating || 0)
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
                                {review.rating || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-left text-sm leading-relaxed text-black dark:text-white">
                            {review.review}
                          </p>
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
                  No assigned person available
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  Waiting for shopper assignment
                </p>
              </div>
            )}
          </Panel>
        </div>
      </div>

      {/* Feedback Modal */}
      <Modal
        open={feedbackModal}
        onClose={() => {
          setFeedbackModal(false);
          setRating(0);
          setComment("");
          setSubmitError(null);
        }}
        className="mx-4 max-w-[95%] overflow-hidden md:mx-auto md:max-w-[500px]"
      >
        <Modal.Header>
          <Modal.Title>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Rate Your Experience
              </span>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitError && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
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
                  <p className="text-sm text-red-500">{submitError}</p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-6">
            {/* Rating Section */}
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <h4 className="mb-4 text-lg font-medium text-gray-900">
                How was your experience?
              </h4>
              <div className="flex justify-center">
                <Rate
                  defaultValue={0}
                  value={rating}
                  onChange={setRating}
                  color={rating > 0 ? "yellow" : undefined}
                  size="lg"
                  className="text-3xl"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {rating === 0 && "Select your rating"}
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            </div>
            {/* Details Section */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
              <h4 className="text-lg font-medium text-gray-900">
                Additional Feedback
              </h4>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Share your thoughts
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="Tell us what you liked or what we could improve..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex w-full flex-col-reverse gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              onClick={() => {
                setFeedbackModal(false);
                setRating(0);
                setComment("");
                setSubmitError(null);
              }}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleFeedbackSubmit}
              disabled={submitting}
              className="flex items-center justify-center rounded-md bg-purple-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
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
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
}
