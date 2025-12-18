import RootLayout from "@components/ui/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserOrderDetails from "@components/UserCarts/orders/UserOrderDetails";
import UserReelOrderDetails from "@components/UserCarts/orders/UserReelOrderDetails";
import UserRestaurantOrderDetails from "@components/UserCarts/orders/UserRestaurantOrderDetails";
import { Button } from "rsuite";
import Link from "next/link";
import { AuthGuard } from "@components/AuthGuard";
import { useTheme } from "../../../src/context/ThemeContext";
import Image from "next/image";

// Helper to pad order IDs to at least 4 digits
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  return s.length >= 4 ? s : s.padStart(4, "0");
}

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: string): string {
  if (!timestamp) return "Unknown";

  try {
    const now = Date.now();
    const past = new Date(timestamp).getTime();

    // Check if the date is valid
    if (isNaN(past)) {
      return new Date().toLocaleDateString();
    }

    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  } catch (error) {
    console.error("Error parsing timestamp:", error);
    return new Date().toLocaleDateString();
  }
}

// Helper to get order status display info with SVG icons
function getOrderStatusInfo(order: any) {
  const isDone = order?.status === "delivered";
  const isAssigned = !!order?.shopper_id || !!order?.assignedTo;

  if (isDone) {
    return {
      status: "Delivered",
      color: "green",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      description: "Order completed successfully",
    };
  } else if (!isAssigned) {
    return {
      status: "Pending",
      color: "yellow",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: "Waiting for shopper assignment",
    };
  } else {
    switch (order?.status) {
      case "shopping":
        return {
          status: "Shopping",
          color: "blue",
          icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
          description: "Shopper is picking your items",
        };
      case "packing":
        return {
          status: "Packing",
          color: "purple",
          icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
          description: "Preparing for delivery",
        };
      case "on_the_way":
        return {
          status: "On the Way",
          color: "orange",
          icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          ),
          description: "Heading to your location",
        };
      default:
        return {
          status: "Ongoing",
          color: "blue",
          icon: (
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          description: "Order in progress",
        };
    }
  }
}

// Mobile Component - Clean, minimal design
const MobileOrderDetails = ({
  order,
  orderType,
}: {
  order: any;
  orderType: "regular" | "reel" | "restaurant" | null;
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  // Get image source - prioritize shop image, then reel image, then default
  const getHeaderImage = () => {
    if (order?.shop?.image) return order.shop.image;
    if (order?.reel?.thumbnail) return order.reel.thumbnail;
    if (order?.restaurant?.image) return order.restaurant.image;
    return "/images/store-placeholder.jpg";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header with Image */}
      <div
        className="relative h-36 w-full sm:hidden"
        style={{
          marginTop: "-44px",
          marginLeft: "-16px",
          marginRight: "-16px",
          width: "calc(100% + 32px)",
        }}
      >
        {/* Cover Image */}
        <Image
          src={getHeaderImage()}
          alt={order?.shop?.name || order?.reel?.title || "Order"}
          fill
          className="object-cover"
          priority
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />

        {/* Back Button */}
        <Link
          href="/CurrentPendingOrders"
          className="absolute left-4 top-7 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/30"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 text-white"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        {/* Order ID Badge */}
        <div className="absolute right-4 top-7 z-20">
          <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-4 py-2 text-sm font-semibold !text-white shadow-lg">
            #{formatOrderID(order?.OrderID)}
          </span>
        </div>

        {/* Header Content */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <h1 className="text-2xl font-bold !text-white">Order Details</h1>
          {order?.shop?.name && (
            <p className="mt-1 text-sm !text-white/90">{order.shop.name}</p>
          )}
          {order?.reel?.title && (
            <p className="mt-1 text-sm !text-white/90">{order.reel.title}</p>
          )}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="px-4 py-6">
        {/* Order Status Badge - Modern Design */}
        <div className="mb-6">
          {(() => {
            const statusInfo = getOrderStatusInfo(order);
            const colorClasses = {
              green:
                "from-green-400 to-green-600 shadow-green-200 dark:shadow-green-900/50",
              yellow:
                "from-yellow-400 to-yellow-600 shadow-yellow-200 dark:shadow-yellow-900/50",
              blue: "from-blue-400 to-blue-600 shadow-blue-200 dark:shadow-blue-900/50",
              purple:
                "from-purple-400 to-purple-600 shadow-purple-200 dark:shadow-purple-900/50",
              orange:
                "from-orange-400 to-orange-600 shadow-orange-200 dark:shadow-orange-900/50",
            };

            return (
              <div
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${
                  colorClasses[statusInfo.color as keyof typeof colorClasses]
                } p-6 text-white shadow-lg`}
              >
                {/* Animated background elements */}
                <div className="absolute -right-4 -top-4 h-16 w-16 animate-pulse rounded-full bg-white opacity-10"></div>
                <div className="absolute -bottom-2 -left-2 h-12 w-12 animate-bounce rounded-full bg-white opacity-5"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20">
                      {statusInfo.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold">
                        {statusInfo.status}
                      </h2>
                      <p className="text-sm opacity-90">
                        {statusInfo.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Order Details Component */}
        <div className="rounded-2xl bg-white shadow-sm dark:bg-gray-800">
          {orderType === "reel" ? (
            <UserReelOrderDetails order={order} isMobile={true} />
          ) : orderType === "restaurant" ? (
            <UserRestaurantOrderDetails order={order} isMobile={true} />
          ) : (
            <UserOrderDetails order={order} isMobile={true} />
          )}
        </div>
      </div>
    </div>
  );
};

// Desktop Component - No header
const DesktopOrderDetails = ({
  order,
  orderType,
}: {
  order: any;
  orderType: "regular" | "reel" | "restaurant" | null;
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
      {/* Desktop Content - No Header */}
      <div className="container mx-auto px-8 py-8">
        <div className="rounded-2xl bg-white shadow-sm dark:bg-gray-800">
          {orderType === "reel" ? (
            <UserReelOrderDetails order={order} />
          ) : orderType === "restaurant" ? (
            <UserRestaurantOrderDetails order={order} />
          ) : (
            <UserOrderDetails order={order} />
          )}
        </div>
      </div>
    </div>
  );
};

function ViewOrderDetailsPage() {
  const router = useRouter();
  const { orderId } = router.query;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<
    "regular" | "reel" | "restaurant" | null
  >(null);

  useEffect(() => {
    if (!orderId || !router.isReady) return;

    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);

        // Try to fetch as regular order first
        let res = await fetch(`/api/queries/orderDetails?id=${orderId}`);

        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            setOrderType("regular");
            return;
          }
        } else if (res.status === 404) {
          // Silently handle 404 for regular orders - this is expected for reel orders
        }

        // If not found as regular order, try as reel order
        res = await fetch(`/api/queries/reel-order-details?id=${orderId}`);

        if (res.ok) {
          const data = await res.json();
          if (data.order) {
            setOrder(data.order);
            setOrderType("reel");
            return;
          }
        } else if (res.status === 404) {
          // Silently handle 404 for reel orders - this is expected for restaurant orders
        }

        // If not found as reel order, try as restaurant order
        res = await fetch(
          `/api/queries/restaurant-order-details?id=${orderId}`
        );

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error(
              "Order not found. Please check the order ID and try again."
            );
          }
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch order details");
        }

        const data = await res.json();

        // Validate that we have the necessary data
        if (!data.order) {
          throw new Error("Order data is missing");
        }

        setOrder(data.order);
        setOrderType("restaurant");
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
    <AuthGuard requireAuth={true}>
      <RootLayout>
        {/* Mobile View */}
        <div className="block md:hidden">
          <MobileOrderDetails order={order} orderType={orderType} />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <DesktopOrderDetails order={order} orderType={orderType} />
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default ViewOrderDetailsPage;
