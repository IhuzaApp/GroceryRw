import RootLayout from "@components/ui/layout";
import UserRecentOrders from "@components/userProfile/userRecentOrders";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { AuthGuard } from "../../src/components/AuthGuard";

function CurrentOrdersPage() {
  const [filter, setFilter] = useState("pending");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const userId = session?.user?.id;
      const res = await authenticatedFetch(
        `/api/queries/all-orders${userId ? `?user_id=${userId}` : ""}`
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
          <div className="flex min-h-[60vh] flex-col items-center justify-center py-12 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <svg
                    className="h-8 w-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
                  Sign In Required
                </h1>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                  Please sign in to view your orders.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/30 transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-xl"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Count only assigned orders that are not delivered for "Ongoing"
  const pendingCount = orders.filter((o) => {
    const isAssigned = !!o?.shopper_id || !!o?.assignedTo;
    return o.status !== "delivered" && isAssigned;
  }).length;
  const completedCount = orders.filter((o) => o.status === "delivered").length;

  return (
    <AuthGuard requireAuth={true}>
      <RootLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:ml-16">
          <div className="w-full py-3 md:py-8">
            {/* Header Section */}
            <div className="mb-4 px-3 md:mb-8 md:px-8">
              <div className="mb-4 flex items-center justify-between md:mb-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <Link
                    href="/"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition-all duration-200 hover:border-green-300 hover:bg-green-50 hover:text-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-green-600 dark:hover:bg-green-900/20 md:h-10 md:w-10"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4 md:h-5 md:w-5"
                    >
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-3xl">
                      My Orders
                    </h1>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 md:mt-1 md:text-sm">
                      Track and manage your orders
                    </p>
                  </div>
                </div>
                {session?.user?.name && (
                  <div className="hidden items-center gap-3 md:flex">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Welcome back
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Tabs - Modern Design */}
              <div className="inline-flex w-full rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:w-auto">
                <button
                  onClick={() => setFilter("pending")}
                  className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    filter === "pending"
                      ? "bg-gradient-to-r from-green-500 to-green-600 !text-white shadow-md shadow-green-500/30"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${
                      filter === "pending" ? "!text-white" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={filter === "pending" ? "!text-white" : ""}>Ongoing</span>
                  {pendingCount > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${
                        filter === "pending"
                          ? "bg-white/20 !text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter("done")}
                  className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    filter === "done"
                      ? "bg-gradient-to-r from-green-500 to-green-600 !text-white shadow-md shadow-green-500/30"
                      : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
                >
                  <svg
                    className={`h-4 w-4 ${
                      filter === "done" ? "!text-white" : "text-gray-500"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className={filter === "done" ? "!text-white" : ""}>Completed</span>
                  {completedCount > 0 && (
                    <span
                      className={`ml-1.5 rounded-full px-2 py-0.5 text-xs font-bold ${
                        filter === "done"
                          ? "bg-white/20 !text-white"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {completedCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Orders List */}
            <div className="mx-0 rounded-t-2xl bg-white shadow-sm dark:bg-gray-800 md:mx-8 md:rounded-2xl">
              <div className="p-3 md:p-6">
                <UserRecentOrders
                  filter={filter}
                  orders={orders}
                  loading={loading}
                  onRefresh={fetchOrders}
                />
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default CurrentOrdersPage;
