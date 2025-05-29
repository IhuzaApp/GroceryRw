import RootLayout from "@components/ui/layout";
import UserRecentOrders from "@components/userProfile/userRecentOrders";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export default function CurrentOrdersPage() {
  const [filter, setFilter] = useState("pending");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      const res = await fetch(
        `/api/queries/orders${userId ? `?user_id=${userId}` : ""}`
      );
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (!session) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gray-50 p-4 transition-colors duration-200 dark:bg-gray-900 md:ml-16">
          <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
            <div className="rounded-lg bg-white p-8 shadow-lg transition-colors duration-200 dark:bg-gray-800">
              <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                Please Sign In
              </h1>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                You need to be logged in to view your orders.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center rounded-md bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition duration-150 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-offset-gray-900"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50 p-4 transition-colors duration-200 dark:bg-gray-900 md:ml-16">
        <div className="max-w-1xl container mx-auto">
          {/* Profile Header */}
          <div className="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors duration-200 dark:bg-gray-800">
            <div className="flex items-center">
              <Link
                href="/"
                className="flex items-center text-gray-700 transition hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500"
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
              <h1 className="ml-4 text-2xl font-bold text-gray-900 dark:text-white">
                Orders Track
              </h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back, {session.user?.name}
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex gap-3">
            <button
              className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition duration-150 ${
                filter === "pending"
                  ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter("pending")}
            >
              <svg
                className={`mr-2 h-5 w-5 ${
                  filter === "pending"
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ongoing Orders
            </button>
            <button
              className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition duration-150 ${
                filter === "done"
                  ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              onClick={() => setFilter("done")}
            >
              <svg
                className={`mr-2 h-5 w-5 ${
                  filter === "done"
                    ? "text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
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
              Completed Orders
            </button>
          </div>

          {/* Orders List */}
          <div className="rounded-lg bg-white p-4 shadow-sm transition-colors duration-200 dark:bg-gray-800">
            <UserRecentOrders
              filter={filter}
              orders={orders}
              loading={loading}
              onRefresh={fetchOrders}
            />
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
