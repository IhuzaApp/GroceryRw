import React, { useEffect } from "react";
import Image from "next/image";
import { Input, InputGroup, Button, Panel, Steps, Rate, Modal } from "rsuite";
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
}
export default function UserOrderDetails({ order }: UserOrderDetailsProps) {
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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

  const handleFeedbackSubmit = () => {
    // In a real app, this would send the feedback to an API
    console.log("Feedback submitted:", { rating, comment });
    setFeedbackModal(false);
    // Show success message or update UI
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
          Order #{formatOrderID(order.OrderID)}
        </h1>
        <span className="ml-2 text-gray-500">Placed on {order.placedAt}</span>
      </div>

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
                description="Enjoy your groceries!"
              />
            </Steps>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          {/* Delivery Info */}
          <div className="w-full">
            <p className="text-gray-600 mb-2">Estimated delivery time:</p>
            <EstimatedDeliveryTime
              estimatedDelivery={order.estimatedDelivery}
              status={order.status}
            />
          </div>

          {/* Action Buttons */}
          {order.status === "delivered" ? (
            <Button
              appearance="primary"
              className="bg-green-500 text-white transition hover:bg-green-600"
              onClick={() => setFeedbackModal(true)}
            >
              Provide Feedback
            </Button>
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
                        item.product.image ??
                        "https://media.istockphoto.com/id/171302954/photo/groceries.jpg?s=612x612&w=0&k=20&c=D3MmhT5DafwimcYyxCYXqXMxr1W25wZnyUf4PF1RYw8="
                      }
                      alt={item.product.name}
                      width={60}
                      height={60}
                      className="rounded-md"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <div className="mt-1 flex justify-between text-sm text-gray-600">
                      <span>
                        {item.quantity} × {formatCurrency(item.price)}
                      </span>
                      <span className="font-bold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              )) ?? null}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-medium">
                  {formatCurrency(order.serviceFee)}
                </span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">
                  {formatCurrency(order.deliveryFee)}
                </span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>
                  {formatCurrency(
                    (Number(order.total) || 0) +
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
              <h3 className="font-semibold mb-2">Estimated Delivery Time</h3>
              <EstimatedDeliveryTime
                estimatedDelivery={order.estimatedDelivery}
                status={order.status}
              />
            </div>
            
            {/* Delivery Address */}
            <div>
              <h3 className="font-semibold mb-2">Delivery Address</h3>
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
                  <p className="font-medium">{order.address?.street}</p>
                    <p className="text-gray-600">
                    {order.address?.city}, {order.address?.postal_code}
                    </p>
                </div>
              </div>
            </div>
            
            {/* Delivery Notes if any */}
            {order.deliveryNotes && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Delivery Notes</h3>
                <div className="rounded-lg bg-gray-50 p-3 text-gray-700">
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
                <div className="mt-1 flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_: any, i: number) => (
                      <svg
                        key={i}
                        viewBox="0 0 24 24"
                        fill={
                          i < Math.floor(order.assignedTo.rating)
                            ? "currentColor"
                            : "none"
                        }
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-4 w-4 ${
                          i < Math.floor(order.assignedTo.rating)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    {order.assignedTo.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {order.assignedTo.orders} orders completed
                </p>
                <div className="mt-6 w-full space-y-3">
                  <Button
                    appearance="primary"
                    block
                    className="bg-green-500 text-white"
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
                  <Button appearance="ghost" block>
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
      <Modal open={feedbackModal} onClose={() => setFeedbackModal(false)}>
        <Modal.Header>
          <Modal.Title>Rate Your Experience</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-6 text-center">
            <p className="mb-4">How was your experience with this order?</p>
            <div className="flex justify-center">
              <Rate
                color="yellow"
                size="lg"
                value={rating}
                onChange={setRating}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="mb-2 block rounded-md text-sm text-gray-600">
              Additional Comments
            </label>
            <textarea
              placeholder="Tell us more about your experience..."
              name=""
              id=""
              rows={4}
            ></textarea>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setFeedbackModal(false)} appearance="subtle">
            Cancel
          </Button>
          <Button
            onClick={handleFeedbackSubmit}
            appearance="primary"
            className="bg-green-500 text-white"
          >
            Submit Feedback
          </Button>
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
      `}</style>
    </>
  );
}
