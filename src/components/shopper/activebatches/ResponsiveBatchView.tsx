"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "../../../context/ThemeContext";
import { BatchTable } from "./BatchTable";
import { BatchCardMobile } from "./BatchCardMobile";
import { BatchFilters, FilterState } from "./BatchFilters";
import { BatchTableSkeleton } from "./BatchTableSkeleton";
import { BatchCardSkeleton } from "./BatchCardSkeleton";

interface Order {
  id: string;
  OrderID: string | number;
  orderIDs?: Array<string | number>;
  status: string;
  createdAt?: string;
  created_at?: string;
  deliveryTime?: string;
  shopName?: string;
  shopNames?: string[];
  shopAddress?: string;
  shopLat?: number;
  shopLng?: number;
  customerName?: string;
  customerAddress?: string;
  customerLat?: number;
  customerLng?: number;
  items?: number;
  total: number;
  estimatedEarnings?: string;
  orderType?: "regular" | "reel" | "restaurant" | "combined";
  reel?: {
    id: string;
    title: string;
    description: string;
    Price: string;
    Product: string;
    type: string;
    video_url: string;
    restaurant_id?: string | null;
    user_id?: string | null;
    isRestaurantUserReel?: boolean;
  };
  quantity?: number;
  deliveryNote?: string | null;
  customerPhone?: string;
}

interface ResponsiveBatchViewProps {
  orders: Order[];
  isLoading?: boolean;
}

export function ResponsiveBatchView({
  orders,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
}: ResponsiveBatchViewProps) {
  const { theme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update filtered orders when orders prop changes
  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  // Group orders by day (created_at) for mobile view
  const groupOrdersByDay = (ordersList: Order[]) => {
    const grouped: { [key: string]: { orders: Order[]; date: Date } } = {};

    ordersList.forEach((order) => {
      const date = new Date(
        order.createdAt || order.created_at || order.deliveryTime || Date.now()
      );
      const dayKey = date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      if (!grouped[dayKey]) {
        grouped[dayKey] = { orders: [], date };
      }
      grouped[dayKey].orders.push(order);
    });

    // Sort days in descending order (most recent first)
    return Object.keys(grouped)
      .sort((a, b) => {
        return grouped[b].date.getTime() - grouped[a].date.getTime();
      })
      .map((day) => ({
        day,
        orders: grouped[day].orders,
      }));
  };

  const calculateUrgency = (order: Order): string => {
    const now = currentTime.getTime();

    // Check if newly accepted (status is accepted and created within last hour)
    if (order.status === "accepted") {
      const createdTime = new Date(order.createdAt).getTime();
      const hourAgo = now - 60 * 60 * 1000;
      if (createdTime > hourAgo) {
        return "newly_accepted";
      }
    }

    // Check delivery time urgency
    if (order.deliveryTime) {
      const deliveryTime = new Date(order.deliveryTime).getTime();
      const timeDiff = deliveryTime - now;
      const minutesRemaining = timeDiff / (1000 * 60);

      // Late: past delivery time
      if (minutesRemaining <= 0) {
        return "late";
      }

      // Urgent: 10 minutes or less
      if (minutesRemaining <= 10) {
        return "urgent";
      }
    }

    // Everything else is okay
    return "okay";
  };

  const handleFilterChange = (filters: FilterState) => {
    let filtered = [...orders];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.OrderID.toString().toLowerCase().includes(searchLower) ||
          order.customerName.toLowerCase().includes(searchLower) ||
          order.shopName.toLowerCase().includes(searchLower) ||
          order.customerAddress.toLowerCase().includes(searchLower)
      );
    }

    // Apply order type filter
    if (filters.orderType) {
      filtered = filtered.filter(
        (order) => order.orderType === filters.orderType
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter((order) => order.status === filters.status);
    }

    // Apply urgency filter
    if (filters.urgency) {
      filtered = filtered.filter(
        (order) => calculateUrgency(order) === filters.urgency
      );
    }

    setFilteredOrders(filtered);
  };

  return (
    <div>
      {/* Filters - Show on both desktop and mobile */}
      <BatchFilters
        onFilterChange={handleFilterChange}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Loading Skeletons */}
      {isLoading && (
        <>
          {/* Desktop Skeleton - Hidden on mobile */}
          <div className="hidden lg:block">
            <BatchTableSkeleton rows={25} />
          </div>

          {/* Mobile Skeleton - Hidden on desktop */}
          <div className="block lg:hidden">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <BatchCardSkeleton count={6} />
            </div>
          </div>
        </>
      )}

      {/* Actual Content - Only show when not loading */}
      {!isLoading && (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block">
            <BatchTable orders={filteredOrders} />
          </div>

          {/* Mobile Card View - Hidden on desktop */}
          <div className="block lg:hidden">
            {groupOrdersByDay(filteredOrders).map(({ day, orders }) => (
              <div key={day} className="mb-6">
                {/* Day Header */}
                <h2
                  className={`mb-4 text-lg font-bold ${
                    theme === "dark" ? "text-gray-100" : "text-gray-900"
                  }`}
                >
                  {day}
                </h2>
                {/* Cards for this day */}
                <div className="grid grid-cols-1 gap-4">
                  {orders.map((order) => (
                    <BatchCardMobile
                      key={order.id}
                      order={order}
                      currentTime={currentTime}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && filteredOrders.length === 0 && (
        <div
          className={`rounded-xl border p-8 text-center ${
            theme === "dark"
              ? "border-gray-700 bg-gray-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`h-8 w-8 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p
            className={`mb-2 text-lg font-bold sm:text-xl ${
              theme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
          >
            No Batches Found
          </p>
          <p
            className={`text-sm sm:text-base ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            No batches match your current filters.
          </p>
        </div>
      )}
    </div>
  );
}
