import RootLayout from "@components/ui/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserOrderDetails from "@components/UserCarts/orders/UserOrderDetails";

export default function ViewOrderDetailsPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/queries/orderDetails?orderId=${orderId}`);
        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        console.error(err);
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
  if (!order) {
    return (
      <RootLayout>
        <p className="p-4">Order not found.</p>
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
