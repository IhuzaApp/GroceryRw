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
}

export default function UserReelOrderDetails({ order }: UserReelOrderDetailsProps) {
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isMobile, setIsMobile] = useState(false);
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

  // Update the isMobile state based on window size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check on mount
    handleResize();

    // Add event listener to handle resize
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener when the component unmounts
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      {/* Order Tracking Header */}
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

      {/* Reel Information */}
      <Panel shaded bordered className="mb-6">
        <div className="mb-4">
          <h2 className="mb-4 text-xl font-bold text-purple-600">Reel Details</h2>
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
                  <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Reel Info */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{order.reel?.title}</h3>
              <p className="text-sm text-gray-600">{order.reel?.description}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>Type: {order.reel?.type}</span>
                <span>Category: {order.reel?.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-gray-900">Order Information</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{order.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(order.reel?.Price || "0"))}</span>
                </div>
                {order.delivery_note && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Special Instructions:</span>
                    <span className="font-medium">{order.delivery_note}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900">Pricing Breakdown</h4>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(parseFloat(order.reel?.Price || "0") * order.quantity)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee:</span>
                  <span className="font-medium">{formatCurrency(order.service_fee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-medium">{formatCurrency(order.delivery_fee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-1">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Order Status */}
      <Panel shaded bordered className="mb-6">
        <div className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Order Status</h2>
          <div className="custom-steps-wrapper">
            <Steps
              current={getStatusStep(order.status, order.assignedTo)}
              className="custom-steps"
              vertical={isMobile}
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
                description="Enjoy your order!"
              />
            </Steps>
          </div>
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

      {/* Shopper Information */}
      {order.assignedTo && (
        <Panel shaded bordered className="mb-6">
          <h2 className="mb-4 text-xl font-bold">Your Shopper</h2>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
              {order.assignedTo.profile_photo ? (
                <Image
                  src={order.assignedTo.profile_photo}
                  alt={order.assignedTo.name}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-300">
                  <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{order.assignedTo.name}</h3>
              <p className="text-sm text-gray-600">{order.assignedTo.transport_mode}</p>
              <p className="text-sm text-gray-500">{order.assignedTo.phone}</p>
            </div>
          </div>
        </Panel>
      )}

      {/* Feedback Modal */}
      <Modal open={feedbackModal} onClose={() => setFeedbackModal(false)} size="sm">
        <Modal.Header>
          <Modal.Title>Rate Your Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
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
              <label className="block text-sm font-medium text-gray-700">
                Comments
              </label>
              <Input
                as="textarea"
                rows={3}
                value={comment}
                onChange={setComment}
                placeholder="Share your experience..."
                className="mt-1"
              />
            </div>
            {submitError && (
              <Message type="error" className="mt-2">
                {submitError}
              </Message>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setFeedbackModal(false)} appearance="subtle">
            Cancel
          </Button>
          <Button
            onClick={handleFeedbackSubmit}
            appearance="primary"
            loading={submitting}
            className="bg-purple-500 hover:bg-purple-600"
          >
            Submit Feedback
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
} 