import React, { useState } from "react";
import { Tag, Button } from "rsuite";
import Link from "next/link";
import { formatCurrency } from "../../lib/formatCurrency";
import { useRouter } from "next/router";

// Define the shape of an order including assignment status and external OrderID
type Order = {
  id: string;
  OrderID: string;
  status: string;
  created_at: string;
  delivery_time: string;
  total: number;
  user: {
    id: string;
    name: string;
    email: string;
    profile_picture: string;
  };
  shop: {
    id: string;
    name: string;
    address: string;
    image: string;
  };
  itemsCount: number;
  unitsCount: number;
  shopper_id: string | null;
  service_fee?: number;
  delivery_fee?: number;
};

// Props for the UserRecentOrders component
interface UserRecentOrdersProps {
  filter: string;
  orders: Order[];
  loading: boolean;
  onRefresh?: () => void;
}

// Helper to display timestamps as relative time ago
function timeAgo(timestamp: string): string {
  const now = Date.now();
  const past = new Date(timestamp).getTime();
  const diff = now - past;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds} sec${seconds !== 1 ? "s" : ""} ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

// Helper to display estimated delivery time
function EstimatedDelivery({
  deliveryTime,
  status,
}: {
  deliveryTime: string;
  status: string;
}) {
  if (!deliveryTime) return null;
  if (status === "delivered") {
    return <span className="font-medium text-green-600">Delivered</span>;
  }

  const now = new Date();
  const est = new Date(deliveryTime);
  const diffMs = est.getTime() - now.getTime();

  if (diffMs <= 0) {
    return (
      <span className="font-medium text-red-500">Delivery time exceeded</span>
    );
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  let text: string;
  if (days > 0) {
    text = `Delivery in ${days} day${days > 1 ? "s" : ""}${
      hours > 0 ? ` ${hours}h` : ""
    }`;
  } else if (hours > 0) {
    text = `Delivery in ${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  } else {
    text = `Delivery in ${mins} minutes`;
  }

  return (
    <div className="flex items-center gap-1">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4 text-green-500"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span className="font-medium text-green-600">{text}</span>
    </div>
  );
}

// Helper to pad order IDs to at least 4 digits, with fallback
function formatOrderID(id?: string | number): string {
  const s = id != null ? id.toString() : "0";
  // pad to at least 4 characters
  return s.length >= 4 ? s : s.padStart(4, "0");
}

export default function UserRecentOrders({
  filter,
  orders = [],
  loading,
  onRefresh,
}: UserRecentOrdersProps) {
  const { pathname } = useRouter();
  const isPendingOrdersPage = pathname === "/CurrentPendingOrders";
  // Pagination state: show initial 10 orders, then load more in increments of 10
  const [visibleCount, setVisibleCount] = useState(10);
  // Apply filter once, then slice for pagination
  const filteredOrders = orders.filter((order: Order) =>
    filter === "pending"
      ? order.status !== "delivered"
      : order.status === "delivered"
  );
  const visibleOrders = filteredOrders.slice(0, visibleCount);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Orders</h3>
        {onRefresh && (
          <Button
            appearance="link"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        )}
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-4 animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-md"
            >
              <div className="mb-2 h-4 w-1/3 rounded bg-gray-200"></div>
              <div className="mb-4 h-3 w-1/4 rounded bg-gray-200"></div>
              <div className="mb-2 h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-4 w-1/6 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        visibleOrders.map((order: Order) => (
          <div
            key={order.id}
            className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-md"
          >
            {/* Shop Profile */}
            {order.shop ? (
              <div className="mb-4 flex items-center gap-3">
                <svg
                  fill="#008000"
                  width="20px"
                  height="20px"
                  viewBox="0 0 0.6 0.6"
                  data-name="Layer 1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title />
                  <path d="M0.138 0.125 0.125 0.075H0.031a0.025 0.025 0 0 0 0 0.05h0.056L0.168 0.45H0.5v-0.05H0.207l-0.008 -0.034L0.525 0.304V0.125ZM0.475 0.263 0.186 0.318 0.15 0.175h0.325ZM0.175 0.475a0.038 0.038 0 1 0 0.038 0.038A0.038 0.038 0 0 0 0.175 0.475m0.3 0a0.038 0.038 0 1 0 0.038 0.038A0.038 0.038 0 0 0 0.475 0.475" />
                </svg>
                <div>
                  <div className="font-semibold">{order?.shop?.name}</div>
                  <div className="text-sm text-gray-500">
                    {order?.shop?.address}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Order Info */}
            <div className="mb-2 flex items-center justify-between">
              <div>
                <span className="font-bold">
                  Order #{formatOrderID(order?.OrderID)}
                </span>
                <span className="ml-4 text-sm text-gray-500">
                  {timeAgo(order?.created_at)}
                </span>
              </div>
              {/* Status Badge: Pending when no shopper, Ongoing when assigned, Completed when done */}
              {(() => {
                const isDone = order.status === "delivered";
                const isAssigned = !!order?.shopper_id;
                if (isDone) {
                  return (
                    <Tag color="green" className="bg-green-100 text-green-600">
                      Completed
                    </Tag>
                  );
                } else if (!isAssigned) {
                  return (
                    <Tag
                      color="orange"
                      className="bg-yellow-100 text-yellow-600"
                    >
                      Pending
                    </Tag>
                  );
                } else {
                  return (
                    <Tag color="blue" className="bg-blue-100 text-blue-600">
                      Ongoing
                    </Tag>
                  );
                }
              })()}
            </div>

            <div className="mb-3 flex justify-between text-sm text-gray-600">
              <span className="font-bold text-green-600">
                {order.itemsCount} items ({order.unitsCount} units)
              </span>
              <span className="font-bold">
                {formatCurrency(
                  order.total +
                    (order.service_fee ?? 0) +
                    (order.delivery_fee ?? 0)
                )}
              </span>
            </div>

            {/* Estimated Delivery Time */}
            {order.delivery_time && (
              <div className="mb-3">
                <EstimatedDelivery
                  deliveryTime={order.delivery_time}
                  status={order.status}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Link
                href={`/CurrentPendingOrders/viewOrderDetails?orderId=${order.id}`}
                passHref
              >
                <button
                  className="inline-flex items-center rounded-md border-2 border-black px-3 py-1.5 text-sm font-medium text-black shadow-sm transition hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <svg
                    className="mr-1.5 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View Details
                </button>
              </Link>

              {!isPendingOrdersPage && (
                <Button appearance="ghost" size="sm">
                  Reorder
                </Button>
              )}
            </div>
          </div>
        ))
      )}
      {/* Load more button for pagination */}
      {filteredOrders.length > visibleCount && (
        <div className="mt-4 text-center">
          <Button
            appearance="link"
            onClick={() => setVisibleCount((prev) => prev + 10)}
          >
            Load More
          </Button>
        </div>
      )}
    </>
  );
}
