import React from "react";
import { Tag, Button } from "rsuite";
import Link from "next/link";
import { formatCurrency } from "../../lib/formatCurrency";
import { useRouter } from "next/router";

// Define the shape of an order including item counts
type Order = {
  id: string;
  status: string;
  created_at: string;
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
};

// Props for the UserRecentOrders component
interface UserRecentOrdersProps {
  filter: string;
  orders: Order[];
  loading: boolean;
}

export default function UserRecentOrders({ filter, orders = [], loading }: UserRecentOrdersProps) {
  const { pathname } = useRouter();
  const isPendingOrdersPage = pathname === "/CurrentPendingOrders";
  return (
    <>
      <h3 className="mb-4 text-lg font-bold">Orders</h3>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders
          .filter((order: Order) =>
            filter === "pending" ? order.status !== "done" : order.status === "done"
          )
          .map((order: Order) => (
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
                    <div className="font-semibold">{order.shop.name}</div>
                    <div className="text-sm text-gray-500">{order.shop.address}</div>
                  </div>
                </div>
              ) : null}

              {/* Order Info */}
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <span className="font-bold">Order #{order.id}</span>
                  <span className="ml-4 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <Tag
                  color={order.status === "done" ? "green" : "blue"}
                  className={
                    order.status === "done"
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-100 text-blue-600"
                  }
                >
                  {order.status === "done" ? "Completed" : "Ongoing"}
                </Tag>
              </div>

              <div className="mb-3 flex justify-between text-sm text-gray-600">
                <span>{order.itemsCount} items ({order.unitsCount} units)</span>
                <span className="font-bold">{formatCurrency(order.total)}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/CurrentPendingOrders/viewOrderDetails?orderId=${order.id}`}
                  passHref
                >
                  <Button appearance="ghost" size="sm">
                    View Details
                  </Button>
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
      <div className="mt-4 text-center">
        <Button appearance="link">View All Orders</Button>
      </div>
    </>
  );
}
