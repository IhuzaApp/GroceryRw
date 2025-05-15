import RootLayout from "@components/ui/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserOrderDetails from "@components/UserCarts/orders/UserOrderDetails";
import { Button } from "rsuite";
import Link from "next/link";

export default function ViewOrderDetailsPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/queries/orderDetails?orderId=${orderId}`);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const data = await res.json();

        // Validate that we have the necessary data
        if (!data.order) {
          throw new Error("Order data is missing");
        }

        // Ensure estimatedDelivery exists
        if (!data.order.estimatedDelivery) {
          console.warn("Order is missing estimated delivery time");
          // We'll still set the order but the component will handle the missing time
        }

        setOrder(data.order);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [orderId]);

  if (loading) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center space-x-4">
              <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            {/* Order Status Skeleton */}
            <div className="mb-6">
              <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="flex items-center space-x-2">
                {[...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-4 w-4 animate-pulse rounded-full bg-gray-200"
                  />
                ))}
              </div>
            </div>
            {/* Estimated Delivery Skeleton */}
            <div className="mt-4 flex items-center space-x-2">
              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            </div>
            {/* Order Items Skeleton */}
            <div className="space-y-4">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="h-16 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="flex-grow space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                </div>
              ))}
            </div>
            {/* Totals Skeleton */}
            <div className="mt-6 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (error) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto py-12 text-center">
            <div className="rounded-lg bg-red-50 p-6">
              <h2 className="mb-4 text-2xl font-bold text-red-700">
                Error Loading Order
              </h2>
              <p className="mb-6 text-red-600">{error}</p>
              <Link href="/CurrentPendingOrders" passHref>
                <Button appearance="primary" color="red">
                  Return to Orders
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  if (!order) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto py-12 text-center">
            <h2 className="mb-4 text-2xl font-bold">Order Not Found</h2>
            <p className="mb-6">
              We couldn&apos;t find the order you&apos;re looking for.
            </p>
            <Link href="/CurrentPendingOrders" passHref>
              <Button appearance="primary">Return to Orders</Button>
            </Link>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="p-4 md:ml-16">
        <div className="container mx-auto">
          <UserOrderDetails order={order} />
        </div>
      </div>
    </RootLayout>
  );
}
