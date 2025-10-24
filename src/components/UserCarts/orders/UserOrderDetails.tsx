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

interface UserOrderDetailsProps {
  order: any;
  isMobile?: boolean;
}
export default function UserOrderDetails({ order, isMobile = false }: UserOrderDetailsProps) {
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
          order_id: order.id,
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
            Order #{formatOrderID(order.OrderID)}
          </h1>
          <span className="ml-2 text-gray-500">Placed on {order.placedAt}</span>
        </div>
      )}

      <Panel shaded bordered className="mb-6">
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Order Status</h2>
          {isMobile ? (
            // Mobile: Simple status display
            <div className="text-center py-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {order.status === "delivered" ? "Delivered" : 
                 order.status === "on_the_way" ? "On the Way" :
                 order.status === "packing" ? "Packing" :
                 order.status === "shopping" ? "Shopping" :
                 "Pending Assignment"}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {order.status === "delivered" ? "Order completed successfully" :
                 order.status === "on_the_way" ? "Heading to your location" :
                 order.status === "packing" ? "Preparing for delivery" :
                 order.status === "shopping" ? "Picking your items" :
                 "Waiting for shopper assignment"}
              </div>
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
                <Steps.Item
                  title="Delivered"
                  description="Enjoy your groceries!"
                />
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
              <Button
                appearance="ghost"
                className="flex items-center justify-center bg-green-500 text-white transition hover:bg-green-600"
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
            <h2 className="mb-4 text-xl font-bold">Order Details</h2>
            <div className="space-y-4">
              {order.Order_Items?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 border-b pb-4 last:border-0"
                >
                  <div className="h-16 w-16 flex-shrink-0">
                    <Image
                      src={
                        (item.product.ProductName?.image ||
                          item.product.image) ??
                        "/images/groceryPlaceholder.png"
                      }
                      alt={item.product.ProductName?.name || "Product"}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">
                      {item.product.ProductName?.name || "Product"}
                    </h3>
                    <div className="mt-1 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        {item.quantity} ×{" "}
                        {formatCurrency(parseFloat(item.product.final_price))}
                      </span>
                      <span className="font-bold">
                        {formatCurrency(
                          parseFloat(item.product.final_price) * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )) ?? null}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium">
                  {formatCurrency(
                    order.Order_Items?.reduce((sum: number, item: any) => {
                      return (
                        sum +
                        parseFloat(item.product.final_price) * item.quantity
                      );
                    }, 0) || 0
                  )}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Service Fee
                </span>
                <span className="font-medium">
                  {formatCurrency(order.serviceFee || 0)}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Delivery Fee
                </span>
                <span className="font-medium">
                  {formatCurrency(order.deliveryFee || 0)}
                </span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {formatCurrency(
                    (order.Order_Items?.reduce((sum: number, item: any) => {
                      return (
                        sum +
                        parseFloat(item.product.final_price) * item.quantity
                      );
                    }, 0) || 0) +
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

        {/* Right Column - Assigned Person */}
        <div className="w-full md:w-1/3">
          <Panel shaded bordered>
            <h2 className="mb-4 text-xl font-bold">
              {order.status === "shopping" || order.status === "packing"
                ? "Your Shopper"
                : "Your Delivery Person"}
            </h2>
            {order.assignedTo ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 h-24 w-24 overflow-hidden rounded-full">
                  <Image
                    src={"/assets/images/profile.jpg"}
                    alt={order.assignedTo.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold">{order.assignedTo.name}</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {order.assignedTo.phone}
                </p>
                <div className="mt-1 flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_: any, i: number) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        fill={
                          i < Math.floor(order.assignedTo.rating || 0)
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-4 w-4 ${
                          i < Math.floor(order.assignedTo.rating || 0)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                    {order.assignedTo.rating || 0}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {order.assignedTo.orders_aggregate?.aggregate?.count || 0}{" "}
                  orders completed
                </p>
                <div className="mt-6 w-full space-y-3">
                  <Button
                    appearance="primary"
                    block
                    className={`${
                      order.status === "delivered"
                        ? "cursor-not-allowed opacity-50"
                        : "bg-green-500"
                    } text-white`}
                    disabled={order.status === "delivered"}
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
                    disabled={order.status === "delivered"}
                    className={
                      order.status === "delivered"
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }
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
              </div>
            ) : (
              <p className="text-gray-600">No assigned person available.</p>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-500"
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
                  color={rating > 3 ? "green" : rating > 0 ? "yellow" : "gray"}
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
                  className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
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
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleFeedbackSubmit}
              disabled={submitting}
              className="flex items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
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
        .rs-modal-header {
          border-bottom: none !important;
          padding: 1.5rem !important;
        }
        .rs-modal-body {
          padding: 0 !important;
        }
        .rs-modal-footer {
          padding: 0 !important;
          border-top: none !important;
        }
        .rs-rate-character-active {
          color: #eab308 !important;
        }
        .rs-modal-content {
          border-radius: 0.75rem !important;
        }
        @media (max-width: 640px) {
          .rs-modal {
            margin: 1rem !important;
          }
          .rs-modal-header {
            padding: 1rem !important;
          }
          .rs-rate {
            font-size: 2rem !important;
          }
        }
      `}</style>
    </>
  );
}
