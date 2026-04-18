"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Loader, Placeholder, Panel, Grid, Row, Col } from "rsuite";
import "rsuite/dist/rsuite.min.css";
import { useTheme } from "../../../context/ThemeContext";
import { useRouter } from "next/router";
import { formatCurrencySync } from "../../../utils/formatCurrency";

// Define a type for completed orders
interface CompletedOrder {
  id: string;
  shopName: string;
  shopAddress: string;
  customerAddress: string;
  distance: string;
  items: number;
  total: string;
  earnings: string;
  completedAt: string;
  orderType: "regular" | "reel" | "restaurant";
  deliveryTime?: string;
  customerName?: string;
}

interface TodayCompletedOrdersProps {
  isMobile?: boolean;
  isExpanded?: boolean;
  toggleExpanded?: () => void;
}

// Compute relative time from ISO string
function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffHours >= 1) {
    return `${diffHours}h ${diffMins % 60}m ago`;
  }
  return `${diffMins} mins ago`;
}

export default function TodayCompletedOrders({
  isMobile = false,
  isExpanded = false,
  toggleExpanded,
}: TodayCompletedOrdersProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const [sortBy, setSortBy] = useState<"newest" | "earnings" | "distance">(
    "newest"
  );
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(false);

  // Load completed orders for today
  const loadCompletedOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/shopper/todayCompletedOrders");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.orders) {
        const formattedOrders = data.orders.map((order: any) => ({
          id: order.id,
          shopName: order.shopName || order.restaurantName || "Unknown Shop",
          shopAddress:
            order.shopAddress || order.restaurantAddress || "No address",
          customerAddress: order.customerAddress || "No address",
          distance: order.distance ? `${order.distance} km` : "N/A",
          items: order.itemsCount || 1,
          total: order.total || "0",
          earnings: order.earnings || order.deliveryFee || "0",
          completedAt: order.completedAt || order.deliveredAt,
          orderType: order.orderType || "regular",
          deliveryTime: order.deliveryTime,
          customerName: order.customerName,
        }));

        // Sort orders
        const sorted = sortOrders(formattedOrders, sortBy);
        setCompletedOrders(sorted);
        setTotalEarnings(data.totalEarnings || 0);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Error fetching completed orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]);

  // Sort orders function
  const sortOrders = useCallback(
    (
      orders: CompletedOrder[],
      criteria: "newest" | "earnings" | "distance"
    ) => {
      let sorted = [...orders];

      switch (criteria) {
        case "newest":
          sorted.sort(
            (a, b) =>
              new Date(b.completedAt).getTime() -
              new Date(a.completedAt).getTime()
          );
          break;
        case "earnings":
          sorted.sort(
            (a, b) => parseFloat(b.earnings) - parseFloat(a.earnings)
          );
          break;
        case "distance":
          sorted.sort((a, b) => {
            const distA = parseFloat(a.distance.replace(" km", "")) || 0;
            const distB = parseFloat(b.distance.replace(" km", "")) || 0;
            return distB - distA;
          });
          break;
      }

      return sorted;
    },
    []
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (newSortBy: "newest" | "earnings" | "distance") => {
      setSortBy(newSortBy);
      const sorted = sortOrders(completedOrders, newSortBy);
      setCompletedOrders(sorted);
    },
    [completedOrders, sortOrders]
  );

  // Toggle auto-refresh
  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefreshing((prev) => !prev);
  }, []);

  // Initial load
  useEffect(() => {
    loadCompletedOrders();
  }, [loadCompletedOrders]);

  // Auto-refresh if enabled
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isAutoRefreshing) {
      intervalId = setInterval(loadCompletedOrders, 60000); // Refresh every 1 minute
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAutoRefreshing, loadCompletedOrders]);

  // Order card component
  const OrderCard = ({ order }: { order: CompletedOrder }) => (
    <div
      className="overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-[var(--bg-secondary)] border-transparent dark:border-white/5"
    >
      <div className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              {order.shopName}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {order.shopAddress}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${
              order.orderType === "restaurant"
                ? "bg-orange-100 text-orange-700"
                : order.orderType === "reel"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {order.orderType === "restaurant"
              ? "Restaurant"
              : order.orderType === "reel"
              ? "Reel"
              : "Regular"}
          </div>
        </div>

        <div className="mb-4 space-y-3">
          <div className="flex items-center text-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className="mr-3 h-4 w-4 text-[var(--text-secondary)] opacity-80"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-[var(--text-primary)] font-medium">
              {order.customerAddress}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="mr-2 h-4 w-4 text-[var(--text-secondary)] opacity-80"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-[var(--text-secondary)]">
                {relativeTime(order.completedAt)}
              </span>
            </div>
            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="mr-2 h-4 w-4 text-[var(--text-secondary)] opacity-80"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <span className="text-[var(--text-secondary)] font-medium">
                {order.items} items
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--bg-primary)] dark:border-white/5 pt-4 mt-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-semibold mb-0.5">
              Earnings
            </p>
            <p className="text-xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              {formatCurrencySync(parseFloat(order.earnings))}
            </p>
          </div>
          <button
            onClick={() =>
              router.push(`/Plasa/active-batches/batch/${order.id}`)
            }
            className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 bg-[var(--bg-primary)] text-[var(--text-primary)] hover:scale-[1.03] active:scale-95 shadow-[0_4px_10px_rgb(0,0,0,0.05)] border border-transparent dark:border-white/10"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  // Desktop view
  if (!isMobile) {
    return (
      <div className="px-2 pb-2">
        <div className="flex items-center justify-between px-4 pt-4">
          <div>
            <h1 className="text-3xl font-black text-[var(--text-primary)] mb-1">Completed Orders</h1>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {completedOrders.length} orders &bull; Total earnings:{" "}
              <span className="text-emerald-500 font-bold">{formatCurrencySync(totalEarnings)}</span>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-gray-100 p-1.5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="h-3 w-3 text-gray-500"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-500">
                {lastRefreshed &&
                  `Updated ${lastRefreshed.toLocaleTimeString()}`}
              </span>
            </div>

            <button
              onClick={toggleAutoRefresh}
              className={`flex items-center rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                isAutoRefreshing
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-y-0.5"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mr-1 h-3 w-3"
              >
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              {isAutoRefreshing ? "Auto" : "Manual"}
            </button>

            <button
              className="flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-5 py-2 text-sm font-bold text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)] transition-all duration-300 hover:scale-[1.02] active:scale-95 hover:shadow-[0_6px_20px_rgb(16,185,129,0.4)]"
              onClick={loadCompletedOrders}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="mr-1.5 h-4 w-4"
              >
                <path d="M1 4v6h6M23 20v-6h-6" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-6 mt-4 flex items-center px-4">
          <div className="mr-4 flex items-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="mr-2 h-4 w-4 text-[var(--text-secondary)]"
            >
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
            <span className="text-sm font-bold text-[var(--text-secondary)]">Sort by:</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleSortChange("newest")}
              className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                sortBy === "newest"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-y-0.5"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="mr-1.5 h-4 w-4"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              Recent First
            </button>
            <button
              onClick={() => handleSortChange("earnings")}
              className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                sortBy === "earnings"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-y-0.5"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="mr-1.5 h-4 w-4"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
              Earnings
            </button>
            <button
              onClick={() => handleSortChange("distance")}
              className={`flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
                sortBy === "distance"
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:-translate-y-0.5"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="mr-1.5 h-4 w-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
              Distance
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="px-4">
            <Grid fluid>
              <Row className="gap-4">
                {[1, 2, 3].map((i) => (
                  <Col key={i} xs={24} md={12} lg={8}>
                    <Panel bordered className="h-[180px]">
                      <Placeholder.Paragraph rows={3} active />
                      <div className="mt-4 flex justify-between">
                        <Placeholder.Graph active width={70} height={24} />
                        <Placeholder.Graph active width={120} height={24} />
                      </div>
                    </Panel>
                  </Col>
                ))}
              </Row>
            </Grid>
          </div>
        ) : completedOrders.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 px-4 md:grid-cols-2 lg:grid-cols-3">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="mx-4 rounded-2xl bg-[var(--bg-secondary)] border border-transparent dark:border-white/5 p-10 text-center shadow-sm">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-primary)] text-[var(--text-secondary)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-[var(--text-primary)]">
              No Completed Orders Today
            </h3>
            <p className="text-[var(--text-secondary)] max-w-sm mx-auto">
              You haven't completed any orders yet today. When you do, they will appear here.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mobile view
  return (
    <div
      className={`fixed bottom-16 left-0 right-0 z-[1000] rounded-t-3xl border-t border-[var(--bg-secondary)] shadow-[0_-10px_40px_rgb(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgb(0,0,0,0.4)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] bg-[var(--bg-primary)] text-[var(--text-primary)] ${
        isExpanded ? "h-[calc(100%-16rem)]" : "h-[85px]"
      }`}
    >
      {/* Handle to expand/collapse */}
      <div className="relative">
        <div
          className="flex cursor-pointer items-center justify-center p-3"
          onClick={toggleExpanded}
        >
          <div className="mx-auto h-1.5 w-12 rounded-full bg-[var(--bg-secondary)]" />
        </div>
      </div>

      {isExpanded ? (
        <div className="h-full overflow-y-auto px-4 pb-4">
          <div className="mb-6 flex items-center justify-between pt-2">
            <div className="flex items-center">
              <div className="mr-3 rounded-full bg-emerald-500/10 p-2.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-5 w-5 text-emerald-500">
                  <path d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                  Today's Completed
                </h2>
                <p className="text-sm font-medium text-[var(--text-secondary)]">
                  {completedOrders.length} orders •{" "}
                  <span className="text-emerald-500 font-bold">{formatCurrencySync(totalEarnings)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={
                  isAutoRefreshing ? toggleAutoRefresh : loadCompletedOrders
                }
                className={`flex items-center rounded-xl px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  isAutoRefreshing
                    ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]"
                    : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="mr-1 h-3 w-3"
                >
                  <path d="M1 4v6h6M23 20v-6h-6" />
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                </svg>
                {isAutoRefreshing ? "Auto" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-2">
            <button onClick={() => handleSortChange("newest")} className={`flex items-center rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${sortBy === "newest" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80"}`} >
              Recent
            </button>
            <button onClick={() => handleSortChange("earnings")} className={`flex items-center rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${sortBy === "earnings" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80"}`} >
              Earnings
            </button>
            <button onClick={() => handleSortChange("distance")} className={`flex items-center rounded-lg px-4 py-2 text-xs font-bold transition-all duration-300 ${sortBy === "distance" ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-[0_4px_15px_rgb(16,185,129,0.3)]" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/80"}`} >
              Distance
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4 px-1">
              {[1, 2].map((i) => (
                <Panel
                  key={i}
                  bordered
                  className="h-[180px] bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  <Placeholder.Paragraph rows={3} active />
                  <div className="mt-4 flex justify-between">
                    <Placeholder.Graph active width={70} height={24} />
                    <Placeholder.Graph active width={120} height={24} />
                  </div>
                </Panel>
              ))}
            </div>
          ) : completedOrders.length > 0 ? (
            <div className="space-y-4 pb-20">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[var(--text-secondary)]">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-[var(--text-primary)]">
                No completed orders
              </h3>
              <p>You haven't completed any orders yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between px-5">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
                  <path d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-[var(--text-primary)]">
                Today's Completed
              </span>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
              {completedOrders.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
