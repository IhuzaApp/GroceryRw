import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Button, Message, Panel, Steps } from "rsuite";
import { formatCurrency } from "../../../src/utils/formatCurrency";
import { logger } from "../../../src/utils/logger";

interface BatchDetails {
  id: string;
  OrderID: string;
  shopName: string;
  customerAddress: string;
  distance: number;
  itemsCount: number;
  estimatedEarnings: number;
  orderType: "regular" | "reel" | "restaurant";
  createdAt: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  customer?: {
    name: string;
    phone: string;
  };
  deliveryNotes?: string;
  totalAmount: number;
  deliveryFee: number;
  serviceFee: number;
}

export default function BatchDetailsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { orderId } = router.query;
  const [batchDetails, setBatchDetails] = useState<BatchDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) {
      router.push("/auth/login");
      return;
    }

    if (orderId && typeof orderId === "string") {
      fetchBatchDetails(orderId);
    }
  }, [session, orderId, router]);

  const fetchBatchDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch batch details from the API
      const response = await fetch(`/api/shopper/batch-details?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch batch details");
      }

      const data = await response.json();

      if (!data.batch) {
        throw new Error("Batch not found or no longer available");
      }

      setBatchDetails(data.batch);
    } catch (error) {
      logger.error("Error fetching batch details:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load batch details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptBatch = async () => {
    if (!batchDetails || !session?.user?.id) return;

    try {
      setAccepting(true);

      const response = await fetch("/api/shopper/accept-batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: batchDetails.id,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept batch");
      }

      const data = await response.json();

      if (data.success) {
        Message.success("Batch accepted successfully!");
        // Redirect to active orders or shopper dashboard
        router.push("/shopper/dashboard");
      } else {
        throw new Error(data.error || "Failed to accept batch");
      }
    } catch (error) {
      logger.error("Error accepting batch:", error);
      Message.error(
        error instanceof Error ? error.message : "Failed to accept batch"
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleSkipBatch = () => {
    router.push("/shopper/dashboard");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading batch details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !batchDetails) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="mx-4 w-full max-w-md">
          <Panel className="text-center">
            <div className="mb-4 text-6xl text-red-500">❌</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
              Batch Not Available
            </h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              {error ||
                "This batch is no longer available or has been assigned to another shopper."}
            </p>
            <Button
              appearance="primary"
              onClick={() => router.push("/shopper/dashboard")}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </Panel>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Batch Details
            </h1>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {batchDetails.orderType === "reel"
                ? "Reel Order"
                : "Regular Order"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Order ID:
              </span>
              <p className="font-medium text-gray-900 dark:text-white">
                {batchDetails.OrderID || batchDetails.id}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">
                Distance:
              </span>
              <p className="font-medium text-gray-900 dark:text-white">
                {batchDetails.distance} km
              </p>
            </div>
          </div>
        </div>

        {/* Shop Information */}
        <Panel className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {batchDetails.shopName}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {batchDetails.customerAddress}
              </p>
            </div>
          </div>
        </Panel>

        {/* Order Items */}
        <Panel className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Order Items ({batchDetails.itemsCount} items)
          </h3>

          {batchDetails.items && batchDetails.items.length > 0 ? (
            <div className="space-y-3">
              {batchDetails.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600">
                      <svg
                        className="h-6 w-6 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="flex-grow">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              <svg
                className="mx-auto mb-2 h-12 w-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p>Item details not available</p>
            </div>
          )}
        </Panel>

        {/* Customer Information */}
        {batchDetails.customer && (
          <Panel className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Name:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {batchDetails.customer.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {batchDetails.customer.phone}
                </span>
              </div>
            </div>
          </Panel>
        )}

        {/* Delivery Notes */}
        {batchDetails.deliveryNotes && (
          <Panel className="mb-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Delivery Notes
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {batchDetails.deliveryNotes}
            </p>
          </Panel>
        )}

        {/* Order Summary */}
        <Panel className="mb-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Order Summary
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Items ({batchDetails.itemsCount}):
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(
                  batchDetails.totalAmount -
                    batchDetails.deliveryFee -
                    batchDetails.serviceFee
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">
                Delivery Fee:
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(batchDetails.deliveryFee)}
              </span>
            </div>
            {batchDetails.serviceFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">
                  Service Fee:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(batchDetails.serviceFee)}
                </span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total:
                </span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(batchDetails.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Earnings */}
        <Panel className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-green-800 dark:text-green-200">
              Your Estimated Earnings
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(batchDetails.estimatedEarnings)}
            </p>
          </div>
        </Panel>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            appearance="primary"
            size="lg"
            className="flex-1"
            loading={accepting}
            onClick={handleAcceptBatch}
          >
            ✅ Accept This Batch
          </Button>
          <Button
            appearance="default"
            size="lg"
            className="flex-1"
            onClick={handleSkipBatch}
          >
            ⏭️ Skip
          </Button>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Take your time to review the batch details before accepting.</p>
          <p>You can always skip if this batch doesn't work for you.</p>
        </div>
      </div>
    </div>
  );
}
