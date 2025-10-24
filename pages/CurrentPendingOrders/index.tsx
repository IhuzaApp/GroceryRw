import RootLayout from "@components/ui/layout";
import UserRecentOrders from "@components/userProfile/userRecentOrders";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { authenticatedFetch } from "@lib/authenticatedFetch";
import { AuthGuard } from "../../src/components/AuthGuard";
import { useTheme } from "../../src/context/ThemeContext";

// Mobile Component - Clean, minimal design
const MobileCurrentOrders = ({ 
  filter, 
  setFilter, 
  orders, 
  loading, 
  fetchOrders 
}: {
  filter: string;
  setFilter: (filter: string) => void;
  orders: any[];
  loading: boolean;
  fetchOrders: () => void;
}) => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700 -mx-4 -mt-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-gray-700 transition hover:text-green-600 dark:text-gray-300 dark:hover:text-green-500"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </Link>
          
          <div className="text-center">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Track
            </h1>
          </div>
          
          <div className="w-6"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="px-4 py-6">
        {/* Filter Buttons - Enhanced Design */}
        <div className="mb-6">
          <div className="relative rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <div className="flex">
              <button
                className={`relative flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  filter === "pending"
                    ? "bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => setFilter("pending")}
              >
                <div className="flex items-center justify-center">
                  <div className={`mr-2 rounded-full p-1 ${
                    filter === "pending"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}>
                    <svg
                      className={`h-3 w-3 ${
                        filter === "pending"
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Ongoing
                </div>
              </button>
              <button
                className={`relative flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  filter === "done"
                    ? "bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => setFilter("done")}
              >
                <div className="flex items-center justify-center">
                  <div className={`mr-2 rounded-full p-1 ${
                    filter === "done"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}>
                    <svg
                      className={`h-3 w-3 ${
                        filter === "done"
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Completed
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="rounded-lg bg-white shadow-sm dark:bg-gray-800">
          <UserRecentOrders
            filter={filter}
            orders={orders}
            loading={loading}
            onRefresh={fetchOrders}
          />
        </div>
      </div>
    </div>
  );
};

// Desktop Component - Original design
const DesktopCurrentOrders = ({ 
  filter, 
  setFilter, 
  orders, 
  loading, 
  fetchOrders,
  session 
}: {
  filter: string;
  setFilter: (filter: string) => void;
  orders: any[];
  loading: boolean;
  fetchOrders: () => void;
  session: any;
}) => {
  return (
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

        {/* Filter Buttons - Enhanced Design */}
        <div className="mb-6">
          <div className="relative rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <div className="flex">
              <button
                className={`relative flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  filter === "pending"
                    ? "bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => setFilter("pending")}
              >
                <div className="flex items-center justify-center">
                  <div className={`mr-3 rounded-full p-1.5 ${
                    filter === "pending"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}>
                    <svg
                      className={`h-4 w-4 ${
                        filter === "pending"
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Ongoing Orders
                </div>
              </button>
              <button
                className={`relative flex-1 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-200 ${
                  filter === "done"
                    ? "bg-white text-green-600 shadow-sm dark:bg-gray-700 dark:text-green-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
                onClick={() => setFilter("done")}
              >
                <div className="flex items-center justify-center">
                  <div className={`mr-3 rounded-full p-1.5 ${
                    filter === "done"
                      ? "bg-green-100 dark:bg-green-900/30"
                      : "bg-gray-200 dark:bg-gray-600"
                  }`}>
                    <svg
                      className={`h-4 w-4 ${
                        filter === "done"
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Completed Orders
                </div>
              </button>
            </div>
          </div>
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
  );
};

function CurrentOrdersPage() {
  // Add page debugging - DISABLED FOR PERFORMANCE
  // const { debugInfo, logCustomEvent, logError, logSuccess } = usePageDebug({
  //   pageName: 'CurrentPendingOrders',
  //   requireAuth: true,
  //   allowedRoles: ['user', 'shopper'],
  //   debugLevel: 'verbose'
  // });

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
    <AuthGuard requireAuth={true}>
      <RootLayout>
        {/* Mobile View */}
        <div className="block md:hidden">
          <MobileCurrentOrders
            filter={filter}
            setFilter={setFilter}
            orders={orders}
            loading={loading}
            fetchOrders={fetchOrders}
          />
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block">
          <DesktopCurrentOrders
            filter={filter}
            setFilter={setFilter}
            orders={orders}
            loading={loading}
            fetchOrders={fetchOrders}
            session={session}
          />
        </div>
      </RootLayout>
    </AuthGuard>
  );
}

export default CurrentOrdersPage;
