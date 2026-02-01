import RootLayout from "@components/ui/layout";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserOrderDetails from "@components/UserCarts/orders/UserOrderDetails";
import UserReelOrderDetails from "@components/UserCarts/orders/UserReelOrderDetails";
import UserRestaurantOrderDetails from "@components/UserCarts/orders/UserRestaurantOrderDetails";
import UserBusinessOrderDetails from "@components/UserCarts/orders/UserBusinessOrderDetails";
import ContactSupportModal from "@components/UserCarts/orders/ContactSupportModal";
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
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      description: "Order completed successfully",
    };
  } else if (!isAssigned) {
    return {
      status: "Pending",
      color: "yellow",
      icon: (
        <svg
          className="h-8 w-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      description: "Waiting for assignment",
    };
  } else {
    switch (order?.status) {
      case "shopping":
        return {
          status: "Shopping",
          color: "blue",
          icon: (
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          description: "Your Plaser is picking your items",
        };
      case "packing":
        return {
          status: "Packing",
          color: "purple",
          icon: (
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          ),
          description: "Preparing for delivery",
        };
      case "on_the_way":
        return {
          status: "On the Way",
          color: "orange",
          icon: (
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
          ),
          description: "Heading to your location",
        };
      default:
        return {
          status: "Ongoing",
          color: "blue",
          icon: (
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          ),
          description: "Order in progress",
        };
    }
  }
}

// Support ticket info shown when order already has a ticket
export type SupportTicketInfo = { ticket_num: number; status: string } | null;

// Mobile Component - Clean, minimal design
const MobileOrderDetails = ({
  order,
  orderType,
  combinedOrders,
  onContactSupport,
  supportTicket,
}: {
  order: any;
  orderType: "regular" | "reel" | "restaurant" | "business" | null;
  combinedOrders: any[];
  onContactSupport?: () => void;
  supportTicket?: SupportTicketInfo;
}) => {
  const { theme } = useTheme();
  const router = useRouter();

  // Get image source - restaurant orders use dedicated asset; then shop, reel, default
  const getHeaderImage = () => {
    if (orderType === "restaurant")
      return "/assets/images/restaurantImage.webp";
    if (order?.shop?.image) return order.shop.image;
    if (order?.reel?.thumbnail) return order.reel.thumbnail;
    if (order?.restaurant?.image) return order.restaurant.image;
    return "/images/shop-placeholder.jpg";
  };

  return (
    <div
      className="min-h-screen pb-20 md:pb-0"
      style={{ margin: 0, padding: 0, width: "100%" }}
    >
      {/* Mobile Header with Image - aligned with safe top, full-bleed */}
      <div
        className="relative h-40 w-full pt-4 sm:hidden"
        style={{
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

        {/* Back Button - 36px from viewport (header full-bleed extends 16px off-screen) */}
        <Link
          href="/CurrentPendingOrders"
          className="absolute left-9 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/30"
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
        <div className="absolute right-5 top-4 z-20">
          <span className="inline-flex items-center rounded-full bg-white/20 px-4 py-2 text-sm font-semibold !text-white shadow-lg backdrop-blur-md">
            {combinedOrders.length > 1 ? (
              <>
                {combinedOrders.map((ord: any, idx: number) => (
                  <span key={ord.id}>
                    #{formatOrderID(ord.OrderID)}
                    {idx < combinedOrders.length - 1 ? " & " : ""}
                  </span>
                ))}
              </>
            ) : (
              <>#{formatOrderID(order?.OrderID)}</>
            )}
          </span>
        </div>

        {/* Header Content - 36px horizontal from viewport */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-9 pb-5 pt-2">
          <h1 className="text-2xl font-bold !text-white">
            {combinedOrders.length > 1 ? "Orders Details" : "Order Details"}
          </h1>
          {combinedOrders.length > 1 ? (
            <p className="mt-1 text-sm !text-white/90">
              {combinedOrders.length === 2
                ? `${combinedOrders[0]?.shop?.name} & ${combinedOrders[1]?.shop?.name}`
                : `${combinedOrders[0]?.shop?.name} & ${
                    combinedOrders.length - 1
                  } others`}
            </p>
          ) : (
            <>
              {order?.shop?.name && (
                <p className="mt-1 text-sm !text-white/90">{order.shop.name}</p>
              )}
              {order?.reel?.title && (
                <p className="mt-1 text-sm !text-white/90">
                  {order.reel.title}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Content - px-4 for consistent side inset so content doesn't touch edges */}
      <div
        className={orderType === "restaurant" ? "w-full" : "px-4 py-6"}
        style={
          orderType === "restaurant"
            ? { margin: 0, padding: 0, width: "100%" }
            : {}
        }
      >
        {/* Order PIN Card - Compact Display */}
        {order?.pin && (
          <div className="mb-4">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 via-green-600 to-green-700 p-4 shadow-lg">
              {/* Animated background elements */}
              <div className="absolute -right-6 -top-6 h-20 w-20 animate-pulse rounded-full bg-white opacity-10"></div>
              <div className="absolute -bottom-3 -left-3 h-16 w-16 rounded-full bg-white opacity-5"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider !text-white">
                      Pickup PIN
                    </p>
                    <p className="mt-0.5 text-[10px] !text-white">
                      Show to Plaser
                    </p>
                  </div>
                  <div className="flex flex-col items-center rounded-lg border-2 border-dashed border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <span className="text-3xl font-black leading-none tracking-wider !text-white">
                      {order.pin}
                    </span>
                  </div>
                </div>

                {/* Order Status Indicator */}
                {(() => {
                  const statusInfo = getOrderStatusInfo(order);
                  return (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1.5 backdrop-blur-sm">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <div className="scale-75">{statusInfo.icon}</div>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold !text-white">
                          {statusInfo.status}
                        </p>
                        <p className="text-[10px] !text-white">
                          {statusInfo.description}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Order Details Component - Full width on mobile */}
        <div className="mobile-full-width">
          {orderType === "reel" ? (
            <UserReelOrderDetails
              order={order}
              isMobile={true}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
          ) : orderType === "restaurant" ? (
            <UserRestaurantOrderDetails
              order={order}
              isMobile={true}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
          ) : orderType === "business" ? (
            <UserBusinessOrderDetails
              order={order}
              isMobile={true}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
          ) : (
            <UserOrderDetails
              order={order}
              isMobile={true}
              combinedOrders={combinedOrders}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
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
  combinedOrders,
  onContactSupport,
  supportTicket,
}: {
  order: any;
  orderType: "regular" | "reel" | "restaurant" | "business" | null;
  combinedOrders: any[];
  onContactSupport?: () => void;
  supportTicket?: SupportTicketInfo;
}) => {
  return (
    <div className="min-h-screen md:ml-16">
      {/* Desktop Content - No Header */}
      <div className="container mx-auto px-8 py-8">
        <div className="rounded-2xl  shadow-sm ">
          {orderType === "reel" ? (
            <UserReelOrderDetails
              order={order}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
          ) : orderType === "restaurant" ? (
            <UserRestaurantOrderDetails
              order={order}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
          ) : orderType === "business" ? (
            <UserBusinessOrderDetails
              order={order}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
          ) : (
            <UserOrderDetails
              order={order}
              combinedOrders={combinedOrders}
              onContactSupport={onContactSupport}
              supportTicket={supportTicket}
            />
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
    "regular" | "reel" | "restaurant" | "business" | null
  >(null);
  const [combinedOrders, setCombinedOrders] = useState<any[]>([]);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportTicket, setSupportTicket] = useState<{
    ticket_num: number;
    status: string;
  } | null>(null);

  // Fetch support ticket for this order (subject = "Order issue #orderRef")
  const fetchSupportTicket = React.useCallback(async (orderObj: any) => {
    if (!orderObj?.id) return;
    const orderDisplayId =
      orderObj?.OrderID != null ? orderObj.OrderID : orderObj?.id;
    try {
      const res = await fetch(
        `/api/queries/ticket-by-order?orderId=${encodeURIComponent(
          orderObj.id
        )}&orderDisplayId=${encodeURIComponent(String(orderDisplayId))}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.ticket) {
          setSupportTicket({
            ticket_num: data.ticket.ticket_num,
            status: data.ticket.status,
          });
          return;
        }
      }
      setSupportTicket(null);
    } catch (e) {
      setSupportTicket(null);
    }
  }, []);

  useEffect(() => {
    if (!orderId || !router.isReady) return;

    const typeHint = (router.query.type as string) || "regular";

    async function fetchDetails() {
      try {
        setLoading(true);
        setError(null);

        const apis: Array<{
          type: "regular" | "reel" | "restaurant" | "business";
          url: string;
        }> =
          typeHint === "business"
            ? [
                {
                  type: "business",
                  url: `/api/queries/business-order-details?id=${orderId}`,
                },
                {
                  type: "regular",
                  url: `/api/queries/orderDetails?id=${orderId}`,
                },
                {
                  type: "reel",
                  url: `/api/queries/reel-order-details?id=${orderId}`,
                },
                {
                  type: "restaurant",
                  url: `/api/queries/restaurant-order-details?id=${orderId}`,
                },
              ]
            : typeHint === "restaurant"
            ? [
                {
                  type: "restaurant",
                  url: `/api/queries/restaurant-order-details?id=${orderId}`,
                },
                {
                  type: "regular",
                  url: `/api/queries/orderDetails?id=${orderId}`,
                },
                {
                  type: "reel",
                  url: `/api/queries/reel-order-details?id=${orderId}`,
                },
                {
                  type: "business",
                  url: `/api/queries/business-order-details?id=${orderId}`,
                },
              ]
            : typeHint === "reel"
            ? [
                {
                  type: "reel",
                  url: `/api/queries/reel-order-details?id=${orderId}`,
                },
                {
                  type: "regular",
                  url: `/api/queries/orderDetails?id=${orderId}`,
                },
                {
                  type: "restaurant",
                  url: `/api/queries/restaurant-order-details?id=${orderId}`,
                },
                {
                  type: "business",
                  url: `/api/queries/business-order-details?id=${orderId}`,
                },
              ]
            : [
                {
                  type: "regular",
                  url: `/api/queries/orderDetails?id=${orderId}`,
                },
                {
                  type: "reel",
                  url: `/api/queries/reel-order-details?id=${orderId}`,
                },
                {
                  type: "restaurant",
                  url: `/api/queries/restaurant-order-details?id=${orderId}`,
                },
                {
                  type: "business",
                  url: `/api/queries/business-order-details?id=${orderId}`,
                },
              ];

        for (const { type, url } of apis) {
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            if (data.order) {
              setOrder(data.order);
              setOrderType(type);
              return;
            }
          }
          if (res.status === 404) continue;
          // Non-404 error: for restaurant we throw with detail; for others try next
          if (type === "restaurant") {
            const errorData = await res.json().catch(() => ({}));
            const detail = errorData.detail ? `: ${errorData.detail}` : "";
            throw new Error(
              (errorData.error || "Failed to fetch order details") + detail
            );
          }
        }

        throw new Error(
          "Order not found. Please check the order ID and try again."
        );
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
  }, [orderId, router.isReady, router.query.type]);

  // Fetch support ticket when order is loaded
  useEffect(() => {
    if (order) fetchSupportTicket(order);
  }, [order, fetchSupportTicket]);

  // Fetch combined orders if this is a combined order
  useEffect(() => {
    const fetchCombinedOrders = async () => {
      if (!order?.combinedOrderId) {
        setCombinedOrders(order ? [order] : []);
        return;
      }

      try {
        const response = await fetch(
          `/api/queries/combined-orders?combined_order_id=${order.combinedOrderId}`
        );
        if (response.ok) {
          const data = await response.json();
          setCombinedOrders(data.orders || [order]);
        } else {
          setCombinedOrders([order]);
        }
      } catch (error) {
        console.error("Error fetching combined orders:", error);
        setCombinedOrders([order]);
      }
    };

    if (order) {
      fetchCombinedOrders();
    }
  }, [order]);

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

  // Always show Contact support for business (store) and reel orders; for others show when "ready for pickup" or no ticket
  const isReadyForPickup =
    order?.status &&
    String(order.status).toLowerCase().replace(/_/g, " ").includes("ready");
  const alwaysShowSupport =
    orderType === "business" || orderType === "reel";
  const showContactSupport =
    alwaysShowSupport || isReadyForPickup || !supportTicket
      ? () => setShowSupportModal(true)
      : undefined;

  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        {/* Mobile View */}
        <div className="block md:hidden">
          <MobileOrderDetails
            order={order}
            orderType={orderType}
            combinedOrders={combinedOrders}
            onContactSupport={showContactSupport}
            supportTicket={supportTicket}
          />
        </div>

        {/* Desktop View */}
        <div className="hidden md:block">
          <DesktopOrderDetails
            order={order}
            orderType={orderType}
            combinedOrders={combinedOrders}
            onContactSupport={showContactSupport}
            supportTicket={supportTicket}
          />
        </div>

        <ContactSupportModal
          open={showSupportModal}
          onClose={() => setShowSupportModal(false)}
          order={order}
          orderType={orderType ?? "regular"}
          onSuccess={() => fetchSupportTicket(order)}
        />

        {/* Mobile-specific styles for full-width layout */}
        <style jsx global>{`
          @media (max-width: 767px) {
            /* Panel body padding - allow internal padding for content */
            .mobile-full-width .rs-panel-body {
              padding: 1rem !important;
            }

            /* Remove padding from scroll view on mobile */
            .mobile-full-width .rs-scroll-view {
              padding: 0 !important;
            }

            /* Remove border radius, margins, and box shadows from panels */
            .mobile-full-width .rs-panel {
              border-radius: 0 !important;
              margin-left: 0 !important;
              margin-right: 0 !important;
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              box-shadow: none !important;
              border-left: none !important;
              border-right: none !important;
              width: 100% !important;
              max-width: 100% !important;
            }

            /* Remove border radius from panel body and scroll view */
            .mobile-full-width .rs-panel-body,
            .mobile-full-width .rs-scroll-view {
              border-radius: 0 !important;
            }

            /* Remove shadows from panel containers */
            .mobile-full-width .rs-panel,
            .mobile-full-width .rs-panel-body,
            .mobile-full-width .rs-scroll-view {
              box-shadow: none !important;
            }

            /* Restaurant order details - ensure panels are connected with borders */
            .mobile-full-width .rs-panel + .rs-panel {
              border-top: 1px solid rgba(229, 231, 235, 0.5) !important;
              margin-top: 0 !important;
            }

            .dark .mobile-full-width .rs-panel + .rs-panel {
              border-top-color: rgba(55, 65, 81, 0.5) !important;
            }

            /* Ensure panel body has proper padding for restaurant orders */
            .mobile-full-width .rs-panel-body {
              padding: 1rem !important;
            }
          }
        `}</style>
      </RootLayout>
    </AuthGuard>
  );
}

export default ViewOrderDetailsPage;
