import RootLayout from "@components/ui/layout";
import UserRecentOrders from "@components/userProfile/userRecentOrders";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export default function CurrentOrdersPage() {
  const [filter, setFilter] = useState("pending"); // 'pending' means not done
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Define fetchOrders so it can be reused
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Include user_id in the request if session exists
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

  // If not logged in, show a message
  if (!session) {
    return (
      <RootLayout>
        <div className="p-4 md:ml-16">
          <div className="container mx-auto py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Please Sign In</h1>
            <p className="mb-6">
              You need to be logged in to view your orders.
            </p>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Sign In
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
          {/* Profile Header */}
          <div className="mb-6 flex items-center">
            <Link href="/" className="flex items-center text-gray-700">
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
            <h1 className="ml-4 text-2xl font-bold">Orders Track</h1>
          </div>

          {/* Filter Buttons */}
          <div className="mb-4 flex gap-3">
            <button
              className={`rounded px-4 py-2 text-sm font-medium ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("pending")}
            >
              Ongoing Orders
            </button>
            <button
              className={`rounded px-4 py-2 text-sm font-medium ${
                filter === "done"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => setFilter("done")}
            >
              Completed Orders
            </button>
          </div>

          {/* Orders List */}
          <UserRecentOrders
            filter={filter}
            orders={orders}
            loading={loading}
            onRefresh={fetchOrders}
          />
        </div>
      </div>
    </RootLayout>
  );
}
