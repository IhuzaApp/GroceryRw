"use client";

import React, { useState, SyntheticEvent, useEffect, useCallback } from "react";
import Head from "next/head";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { Panel, Button, SelectPicker, Nav, Tabs, Loader } from "rsuite";
import { useTheme } from "../../../src/context/ThemeContext";
import EarningsSummaryCard from "@components/shopper/earnings/EarningsSummaryCard";
import DailyEarningsChart from "@components/shopper/earnings/DailyEarningsChart";
import RecentOrdersList from "@components/shopper/earnings/RecentOrdersList";
import EarningsBreakdown from "@components/shopper/earnings/EarningsBreakdown";
import ActivityHeatmap from "@components/shopper/earnings/ActivityHeatmap";
import PerformanceMetrics from "@components/shopper/earnings/PerformanceMetrics";
import EarningsGoals from "@components/shopper/earnings/EarningsGoals";
import PaymentHistory from "@components/shopper/earnings/PaymentHistory";
import AchievementBadges from "@components/shopper/earnings/AchievementBadges";
import AchievementBadgesMobile from "@components/shopper/earnings/AchievementBadgesMobile";
import EarningsTipsMobile from "@components/shopper/earnings/EarningsTipsMobile";
import { logger } from "../../../src/utils/logger";
import {
  formatCurrencySync,
  getCurrencySymbol,
} from "../../../src/utils/formatCurrency";
import { AuthGuard } from "../../../src/components/AuthGuard";
import { authenticatedFetch } from "@lib/authenticatedFetch";

// Interface for earnings stats
interface EarningsStats {
  totalEarnings: number;
  completedOrders: number;
  activeHours: number;
  rating: number;
  storeBreakdown?: StoreBreakdown[];
  earningsComponents?: EarningsComponent[];
  performance?: {
    customerRating: number;
    onTimeDelivery: number;
    orderAccuracy: number;
    acceptanceRate: number;
    performanceScore?: number;
  };
  goals?: {
    weekly: {
      current: number;
      target: number;
      percentage: number;
    };
    monthly: {
      current: number;
      target: number;
      percentage: number;
    };
    quarterly: {
      current: number;
      target: number;
      percentage: number;
    };
  };
}

// Interface for wallet data
interface Wallet {
  id: string;
  availableBalance: number;
  reservedBalance: number;
}

// Interface for transaction data
interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description: string;
  date: string;
  time?: string;
  orderId?: string | null;
  orderNumber?: number | null;
}

// Interface for delivery stats
interface DeliveryStats {
  totalKilometers: number;
  totalItems: number;
  avgTimePerOrder: number;
  storesVisited: number;
}

// Interface for store breakdown
interface StoreBreakdown {
  store: string;
  amount: number;
  percentage: number;
}

// Interface for earnings component
interface EarningsComponent {
  type: string;
  amount: number;
  percentage: number;
}

const EarningsPage: React.FC = () => {
  const { theme } = useTheme();

  const [period, setPeriod] = useState("this-week");
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [earningsStats, setEarningsStats] = useState<EarningsStats>({
    totalEarnings: 0,
    completedOrders: 0,
    activeHours: 0,
    rating: 0,
  });
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dailyEarnings, setDailyEarnings] = useState<any[]>([]);
  const [dailyEarningsLoading, setDailyEarningsLoading] = useState(true);

  // Effect to handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isInitialized]);

  // Fetch earnings stats
  useEffect(() => {
    const fetchEarningsStats = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch("/api/shopper/earningsStats");
        if (!response.ok) {
          throw new Error("Failed to fetch earnings stats");
        }
        const data = await response.json();
        if (data.success) {
          setEarningsStats(data.stats);
        }
      } catch (error) {
        logger.error("Error fetching earnings stats", "EarningsPage", error);
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to prevent preload warnings
    const timeoutId = setTimeout(fetchEarningsStats, 100);
    return () => clearTimeout(timeoutId);
  }, [period]);

  // Fetch wallet and transaction data on component mount
  useEffect(() => {
    const timeoutId = setTimeout(fetchWalletData, 150);
    return () => clearTimeout(timeoutId);
  }, []);

  // Add useEffect to fetch daily earnings
  useEffect(() => {
    const timeoutId = setTimeout(() => fetchDailyEarnings(period), 200);
    return () => clearTimeout(timeoutId);
  }, [period]);

  // Function to fetch wallet and transaction data
  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const response = await authenticatedFetch("/api/shopper/walletHistory");
      if (!response.ok) {
        throw new Error("Failed to fetch wallet data");
      }
      const data = await response.json();
      if (data.success) {
        setWallet(
          data.wallet || { id: "", availableBalance: 0, reservedBalance: 0 }
        );
        setTransactions(data.transactions || []);
      } else {
        setWallet({ id: "", availableBalance: 0, reservedBalance: 0 });
        setTransactions([]);
      }
    } catch (error) {
      logger.error("Error fetching wallet data", "EarningsPage", error);
      setWallet({ id: "", availableBalance: 0, reservedBalance: 0 });
      setTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  };

  // Function to fetch daily earnings
  const fetchDailyEarnings = async (selectedPeriod: string) => {
    try {
      setDailyEarningsLoading(true);
      const response = await fetch(
        `/api/shopper/dailyEarnings?period=${selectedPeriod}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch daily earnings");
      }
      const data = await response.json();
      if (data.success) {
        setDailyEarnings(data.data || []);
      } else {
        setDailyEarnings([]);
      }
    } catch (error) {
      logger.error("Error fetching daily earnings", "EarningsPage", error);
      setDailyEarnings([]);
    } finally {
      setDailyEarningsLoading(false);
    }
  };

  const handlePeriodChange = (value: string | null, event: SyntheticEvent) => {
    if (value) {
      setPeriod(value);
      fetchDailyEarnings(value);
    }
  };

  // Format number with decimal places but no currency symbol
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return formatCurrencySync(amount);
  };

  // Get monthly earnings data for the chart
  const getMonthlyData = () => {
    const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => ({
      month,
      earnings: dailyEarnings[index]?.total || Math.random() * 100000,
    }));
  };

  // Sample top income earners data
  const topIncome = [
    { name: 'Ralph Edwards', points: 1220 },
    { name: 'Bessie Cooper', points: 1024 },
    { name: 'Marvin McKinney', points: 980 },
  ];

  return (
    <AuthGuard requireAuth={true} requireRole="shopper">
      <Head>
        <title>Plasa - Earnings Dashboard</title>
        <meta
          name="description"
          content="View your earnings, achievements, and payout information"
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ShopperLayout>
        <div
          className={`min-h-screen p-6 ${
            theme === "dark"
              ? "bg-gray-900 text-gray-100"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          {/* Loading State */}
          {!isInitialized && (
            <div className="flex h-full items-center justify-center">
              <Loader size="lg" />
            </div>
          )}

          {/* New Dashboard Layout */}
          {isInitialized && (
            <div className="container mx-auto max-w-7xl">
              {/* Top Grid - Stats Cards */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Balance Card */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium opacity-70">Total Balance</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">
                      {formatCurrency(wallet?.availableBalance || 1450000)}
                    </p>
                    <p className="mt-1 text-sm text-green-500">
                      Available spend: {formatCurrency(wallet?.availableBalance || 30000)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-full bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600">
                      Transfer
                    </button>
                    <button className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
                      Withdraw
                    </button>
                  </div>
                </div>

                {/* Total Transaction Card */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium opacity-70">Total transaction</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">{earningsStats.completedOrders || 57}</p>
                    <p className="mt-1 text-sm opacity-60">
                      Pending Transaction: 10
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full bg-green-500 px-4 py-2 text-xs font-medium text-white">
                      Success
                    </button>
                    <button className="rounded-full border border-gray-300 px-4 py-2 text-xs font-medium">
                      Pending
                    </button>
                  </div>
                </div>

                {/* Total Spend Card */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium opacity-70">Total spend</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-3xl font-bold">{formatCurrency(earningsStats.totalEarnings || 1115000)}</p>
                    <p className="mt-1 text-sm opacity-60">
                      Completed: {earningsStats.completedOrders || 0} orders
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="rounded-full bg-green-500 px-4 py-2 text-xs font-medium text-white">
                      All Time
                    </button>
                    <button className="rounded-full border border-gray-300 px-4 py-2 text-xs font-medium">
                      This Month
                    </button>
                  </div>
                </div>

                {/* Schedule Calendar Card */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium opacity-70">Schedule</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-xs">
                    <div className="mb-2 grid grid-cols-7 gap-1 text-center font-medium opacity-60">
                      <div>Su</div>
                      <div>Mo</div>
                      <div>Tu</div>
                      <div>We</div>
                      <div>Th</div>
                      <div>Fr</div>
                      <div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {[...Array(31)].map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-full p-1 ${
                            i === 13
                              ? "bg-green-500 text-white font-bold"
                              : i === 1 || i === 3 || i === 7 || i === 8
                              ? "text-green-500"
                              : i === 4
                              ? "text-red-500"
                              : i === 5
                              ? "text-yellow-500"
                              : ""
                          }`}
                        >
                          {i === 0 ? "" : i}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Earning Overview Chart - Takes 2 columns */}
                <div
                  className={`lg:col-span-2 rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Earning Overview</h3>
                    <SelectPicker
                      data={[
                        { label: "Today", value: "today" },
                        { label: "This Week", value: "this-week" },
                        { label: "Last Week", value: "last-week" },
                        { label: "This Month", value: "this-month" },
                        { label: "Last Month", value: "last-month" },
                      ]}
                      value={period}
                      cleanable={false}
                      onChange={handlePeriodChange}
                      style={{ width: 150 }}
                      size="sm"
                    />
                  </div>
                  
                  {/* Chart Stats */}
                  <div className="mb-4">
                    <p className="text-sm opacity-60">Total Earning</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{formatCurrency(earningsStats.totalEarnings)}</p>
                      <span className="text-sm font-medium text-green-500">+67%</span>
                    </div>
                  </div>

                  {/* Real Daily Earnings Chart */}
                  <div className="h-64">
                    <DailyEarningsChart
                      data={dailyEarnings}
                      isLoading={dailyEarningsLoading}
                      period={period}
                    />
                  </div>
                </div>

                {/* Top Stores by Earnings */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Top Stores</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(earningsStats.storeBreakdown?.slice(0, 3) || topIncome).map((item, index) => {
                      const storeName = item.store || item.name;
                      const amount = item.amount;
                      const percentage = item.percentage || item.points;
                      
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                index === 0
                                  ? "bg-green-100 text-green-600"
                                  : index === 1
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-purple-100 text-purple-600"
                              }`}
                            >
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                              </svg>
                            </div>
                            <div>
                              <p className="font-medium">{storeName}</p>
                              <p className="text-sm opacity-60">
                                {amount ? formatCurrency(amount) : `${percentage} Points`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-500">
                              {percentage ? `${Math.round(percentage)}%` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {earningsStats.storeBreakdown && earningsStats.storeBreakdown.length === 0 && (
                    <div className="py-8 text-center text-sm opacity-60">
                      <p>No store data available yet</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Grid - Major Expenses, Asset Valuation, Promo */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Major Expenses */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Major Expenses</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {earningsStats.earningsComponents?.slice(0, 4).map((component, index) => (
                      <button
                        key={index}
                        className={`rounded-full px-4 py-2 text-xs font-medium ${
                          index === 0
                            ? "bg-green-500 text-white"
                            : "border border-gray-300 opacity-60"
                        }`}
                      >
                        {component.type}
                      </button>
                    )) || (
                      <>
                        <button className="rounded-full bg-green-500 px-4 py-2 text-xs font-medium text-white">
                          Delivery
                        </button>
                        <button className="rounded-full border border-gray-300 px-4 py-2 text-xs font-medium opacity-60">
                          Tips
                        </button>
                        <button className="rounded-full border border-gray-300 px-4 py-2 text-xs font-medium opacity-60">
                          Bonus
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mb-2">
                    <p className="text-sm opacity-60">
                      {earningsStats.earningsComponents?.[0]?.type || "Total Earnings"}
                    </p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(earningsStats.earningsComponents?.[0]?.amount || earningsStats.totalEarnings || 10254)}
                    </p>
                  </div>

                  {/* Earnings components chart */}
                  <div className="relative h-32">
                    <div className="flex h-full items-end justify-between gap-1">
                      {(earningsStats.earningsComponents || Array(7).fill({ percentage: 50 })).slice(0, 7).map((component, index) => (
                        <div
                          key={index}
                          className={`flex-1 rounded-t transition-all ${
                            index === 0 ? "bg-green-500" : "bg-gray-300"
                          }`}
                          style={{ height: `${component.percentage || 50}%`, minHeight: "10%" }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 text-center text-sm opacity-60">
                    <p>Average <span className="font-bold">{formatCurrency(earningsStats.totalEarnings / (earningsStats.completedOrders || 1))}</span></p>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Performance</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Performance Stats */}
                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="opacity-60">Customer Rating</span>
                        <span className="font-bold">{earningsStats.performance?.customerRating?.toFixed(1) || earningsStats.rating?.toFixed(1) || "4.8"}/5</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div 
                          className="h-full rounded-full bg-green-500" 
                          style={{ width: `${((earningsStats.performance?.customerRating || earningsStats.rating || 4.8) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="opacity-60">On-Time Delivery</span>
                        <span className="font-bold">{earningsStats.performance?.onTimeDelivery || 95}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div 
                          className="h-full rounded-full bg-green-500" 
                          style={{ width: `${earningsStats.performance?.onTimeDelivery || 95}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="opacity-60">Order Accuracy</span>
                        <span className="font-bold">{earningsStats.performance?.orderAccuracy || 98}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div 
                          className="h-full rounded-full bg-green-500" 
                          style={{ width: `${earningsStats.performance?.orderAccuracy || 98}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex justify-between text-sm">
                        <span className="opacity-60">Acceptance Rate</span>
                        <span className="font-bold">{earningsStats.performance?.acceptanceRate || 92}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200">
                        <div 
                          className="h-full rounded-full bg-green-500" 
                          style={{ width: `${earningsStats.performance?.acceptanceRate || 92}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Promotional Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg">
                  <div className="relative z-10">
                    <div className="mb-4 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                      Join Our Venture
                    </div>
                    <h3 className="mb-4 text-2xl font-bold">
                      Are you prepared to start with us?
                    </h3>
                    <button className="rounded-full bg-white px-6 py-3 font-medium text-green-600 hover:bg-gray-100">
                      Get Started
                    </button>
                  </div>
                  {/* Decorative circles */}
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                  <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Analytics Tabs Section */}
              <div className="mt-6">
                <Tabs
                  className={`${
                    theme === "dark"
                      ? "rs-tabs-dark !text-white [&_.rs-nav-item-active]:!text-green-500 [&_.rs-nav-item-content]:!text-white [&_.rs-nav-item]:!text-white"
                      : "[&_.rs-nav-item-active]:!text-green-600"
                  }`}
                  defaultActiveKey="breakdown"
                  appearance="subtle"
                >
                  <Tabs.Tab
                    eventKey="breakdown"
                    title={
                      <div className="flex items-center space-x-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                        </svg>
                        <span>Earnings Breakdown</span>
                      </div>
                    }
                  >
                    <div
                      className={`mt-4 rounded-2xl p-6 shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {loading ? (
                        <div className="flex justify-center py-8">
                          <Loader size="md" content="Loading earnings data..." />
                        </div>
                      ) : !earningsStats.storeBreakdown || !earningsStats.earningsComponents ? (
                        <div className="py-8 text-center opacity-60">
                          <p>No earnings breakdown data available.</p>
                        </div>
                      ) : (
                        <>
                          <EarningsBreakdown
                            storeBreakdown={earningsStats.storeBreakdown.map((store) => ({
                              ...store,
                              amount: parseFloat(store.amount.toFixed(2)),
                            }))}
                            earningsComponents={earningsStats.earningsComponents.map((component) => ({
                              ...component,
                              amount: parseFloat(component.amount.toFixed(2)),
                            }))}
                          />
                          <div className="mt-6">
                            <ActivityHeatmap />
                          </div>
                        </>
                      )}
                    </div>
                  </Tabs.Tab>

                  <Tabs.Tab
                    eventKey="recent-orders"
                    title={
                      <div className="flex items-center space-x-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                        <span>Recent Orders</span>
                      </div>
                    }
                  >
                    <div
                      className={`mt-4 rounded-2xl p-6 shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <RecentOrdersList
                        orders={[]}
                        isLoading={false}
                        pageSize={10}
                        currentPage={1}
                        totalOrders={0}
                        onPageChange={() => {}}
                        serverPagination={false}
                      />
                    </div>
                  </Tabs.Tab>

                  <Tabs.Tab
                    eventKey="payments"
                    title={
                      <div className="flex items-center space-x-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                        </svg>
                        <span>Payment History</span>
                      </div>
                    }
                  >
                    <div
                      className={`mt-4 rounded-2xl p-6 shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      {walletLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader size="md" content="Loading wallet data..." />
                        </div>
                      ) : (
                        <PaymentHistory
                          wallet={wallet}
                          transactions={transactions}
                          onViewAllPayments={() => console.log("View all payments clicked")}
                          isLoading={walletLoading}
                        />
                      )}
                    </div>
                  </Tabs.Tab>

                  <Tabs.Tab
                    eventKey="achievements"
                    title={
                      <div className="flex items-center space-x-2">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>Achievements</span>
                      </div>
                    }
                  >
                    <div
                      className={`mt-4 rounded-2xl p-6 shadow-lg ${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-900"
                      }`}
                    >
                      <AchievementBadges />
                    </div>
                  </Tabs.Tab>
                </Tabs>
              </div>
            </div>
          )}
        </div>
      </ShopperLayout>
    </AuthGuard>
  );
};

export default EarningsPage;
