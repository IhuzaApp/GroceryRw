"use client";

import React, { useState, SyntheticEvent, useEffect, useCallback } from "react";
import Head from "next/head";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { Button, SelectPicker, Loader } from "rsuite";
import { useTheme } from "../../../src/context/ThemeContext";
import EarningsSummaryCard from "@components/shopper/earnings/EarningsSummaryCard";
import DailyEarningsChart from "@components/shopper/earnings/DailyEarningsChart";
import RecentOrdersList from "@components/shopper/earnings/RecentOrdersList";
import EarningsBreakdown from "@components/shopper/earnings/EarningsBreakdown";
import ActivityHeatmap from "@components/shopper/earnings/ActivityHeatmap";
import PerformanceMetrics from "@components/shopper/earnings/PerformanceMetrics";
import EarningsGoals from "@components/shopper/earnings/EarningsGoals";
import PaymentHistory from "@components/shopper/earnings/PaymentHistory";
import TransactionTable from "@components/shopper/earnings/TransactionTable";
import TotalBalanceCard from "@components/shopper/earnings/TotalBalanceCard";
import TotalTransactionsCard from "@components/shopper/earnings/TotalTransactionsCard";
import TotalSpendCard from "@components/shopper/earnings/TotalSpendCard";
import ScheduleCard from "@components/shopper/earnings/ScheduleCard";
import AchievementBadges from "@components/shopper/earnings/AchievementBadges";
import AchievementBadgesMobile from "@components/shopper/earnings/AchievementBadgesMobile";
import EarningsTipsMobile from "@components/shopper/earnings/EarningsTipsMobile";
import PerformanceInsights from "@components/shopper/earnings/PerformanceInsights";
import DeliveryStatsCard from "@components/shopper/earnings/DeliveryStatsCard";
import EarningsGoalsProgress from "@components/shopper/earnings/EarningsGoalsProgress";
import EarningsTipsCard from "@components/shopper/earnings/EarningsTipsCard";
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
  const [activeTab, setActiveTab] = useState("overview");
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
  const [activitySummary, setActivitySummary] = useState<{
    busiestDay: string;
    busiestDayCount: number;
    busiestHour: string;
    busiestHourCount: number;
    totalOrders: number;
  } | null>(null);
  const [shopperSchedule, setShopperSchedule] = useState<{
    day_of_week: number;
    is_available: boolean;
  }[]>([]);

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

  // Fetch activity summary for busiest times
  useEffect(() => {
    const fetchActivitySummary = async () => {
      try {
        const response = await fetch("/api/shopper/activityHeatmap");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.summary) {
            setActivitySummary(data.summary);
          }
        }
      } catch (error) {
        logger.error("Error fetching activity summary", "EarningsPage", error);
      }
    };
    const timeoutId = setTimeout(fetchActivitySummary, 250);
    return () => clearTimeout(timeoutId);
  }, []);

  // Fetch shopper schedule for calendar
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await authenticatedFetch("/api/shopper/schedule");
        if (response.ok) {
          const data = await response.json();
          if (data.schedule) {
            setShopperSchedule(data.schedule);
          }
        }
      } catch (error) {
        logger.error("Error fetching shopper schedule", "EarningsPage", error);
      }
    };
    const timeoutId = setTimeout(fetchSchedule, 300);
    return () => clearTimeout(timeoutId);
  }, []);

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

  // Handle withdrawal/payout request
  const handleWithdrawal = async (amount: number) => {
    try {
      const response = await authenticatedFetch("/api/shopper/requestPayout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to request payout");
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh wallet data
        await fetchWalletData();
        logger.info("Payout requested successfully", "EarningsPage", { amount });
      } else {
        throw new Error(data.message || "Failed to request payout");
      }
    } catch (error) {
      logger.error("Error requesting payout", "EarningsPage", error);
      throw error;
    }
  };

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
              {/* Custom Tailwind Tabs */}
              <div className="mb-6">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'overview', label: 'Overview', icon: (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                      )},
                      { id: 'breakdown', label: 'Earnings Breakdown', icon: (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )},
                      { id: 'recent-orders', label: 'Recent Orders', icon: (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      )},
                      { id: 'payments', label: 'Payment History', icon: (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )},
                      { id: 'achievements', label: 'Achievements', icon: (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      )},
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'border-green-500 text-green-600'
                            : theme === 'dark'
                            ? 'border-transparent text-gray-400 hover:border-gray-600 hover:text-gray-300'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <>
              {/* Top Grid - Stats Cards */}
              <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
                <TotalBalanceCard
                  wallet={wallet}
                  isLoading={walletLoading}
                  onWithdraw={handleWithdrawal}
                />
                
                <TotalTransactionsCard
                  transactions={transactions}
                  completedOrders={earningsStats.completedOrders}
                  isLoading={loading}
                />
                
                <TotalSpendCard
                  earningsStats={earningsStats}
                  isLoading={loading}
                />
                
                <ScheduleCard
                  shopperSchedule={shopperSchedule}
                  isLoading={loading}
                />
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
                {/* Earnings Components */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Earnings Components</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Earnings Components Breakdown */}
                  {earningsStats.earningsComponents && earningsStats.earningsComponents.length > 0 ? (
                    <div className="space-y-4">
                      {earningsStats.earningsComponents.map((component, index) => (
                        <div key={index}>
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  component.type === "Delivery Fee"
                                    ? "bg-green-500"
                                    : component.type === "Service Fee"
                                    ? "bg-blue-500"
                                    : component.type === "Tips"
                                    ? "bg-purple-500"
                                    : "bg-orange-500"
                                }`}
                              />
                              <span className="text-sm font-medium">
                                {component.type}
                              </span>
                            </div>
                            <span className="text-sm font-bold">
                              {formatCurrency(component.amount)}
                            </span>
                          </div>
                          <div
                            className={`h-2 w-full rounded-full ${
                              theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`h-2 rounded-full ${
                                component.type === "Delivery Fee"
                                  ? "bg-green-500"
                                  : component.type === "Service Fee"
                                  ? "bg-blue-500"
                                  : component.type === "Tips"
                                  ? "bg-purple-500"
                                  : "bg-orange-500"
                              }`}
                              style={{ width: `${component.percentage}%` }}
                            />
                          </div>
                          <div className="mt-1 text-right text-xs opacity-60">
                            {Math.round(component.percentage)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm opacity-60">
                      <p>No earnings components data available</p>
                    </div>
                  )}

                  {/* Total */}
                  {earningsStats.earningsComponents && earningsStats.earningsComponents.length > 0 && (
                    <div className="mt-6 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">Total Earnings</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(earningsStats.totalEarnings)}
                        </span>
                      </div>
                    </div>
                  )}
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

                {/* Busiest Times Card */}
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
                    theme === "dark"
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Busiest Times</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  {/* Busiest Times Stats */}
                  {activitySummary ? (
                    <div className="space-y-4">
                      <div
                        className={`rounded-lg p-4 ${
                          theme === "dark" ? "bg-gray-700/50" : "bg-green-50"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <div className="text-sm font-medium opacity-70">Busiest Day</div>
                        </div>
                        <div className="ml-7">
                          <div className="text-xl font-bold text-green-600">
                            {activitySummary.busiestDay}
                          </div>
                          <div className="text-sm opacity-60">
                            {activitySummary.busiestDayCount} orders (
                            {Math.round((activitySummary.busiestDayCount / activitySummary.totalOrders) * 100)}% of total)
                          </div>
                        </div>
                      </div>

                      <div
                        className={`rounded-lg p-4 ${
                          theme === "dark" ? "bg-gray-700/50" : "bg-green-50"
                        }`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <div className="text-sm font-medium opacity-70">Busiest Hour</div>
                        </div>
                        <div className="ml-7">
                          <div className="text-xl font-bold text-green-600">
                            {activitySummary.busiestHour}
                          </div>
                          <div className="text-sm opacity-60">
                            {activitySummary.busiestHourCount} orders (
                            {Math.round((activitySummary.busiestHourCount / activitySummary.totalOrders) * 100)}% of total)
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm opacity-60">
                      <Loader size="sm" content="Loading activity data..." />
                    </div>
                  )}
                </div>
              </div>

                </>
              )}

              {/* Breakdown Tab Content */}
              {activeTab === 'breakdown' && (
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
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
                        hideEarningsComponents={true}
                      />
                      <div className="mt-6">
                        <ActivityHeatmap hideSummary={true} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Recent Orders Tab Content */}
              {activeTab === 'recent-orders' && (
                <div
                  className={`rounded-2xl p-6 shadow-lg ${
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
              )}

              {/* Payments Tab Content */}
              {activeTab === 'payments' && (
                <div>
                  <TransactionTable
                    transactions={transactions}
                    isLoading={walletLoading}
                  />
                </div>
              )}

              {/* Achievements Tab Content */}
              {activeTab === 'achievements' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 items-start">
                  {/* Left Column - Working Towards Achievements */}
                  <div
                    className={`rounded-2xl p-6 shadow-lg ${
                      theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <h3 className="mb-4 text-lg font-bold">Working Towards</h3>
                    <AchievementBadges />
                  </div>

                  {/* Right Column - Insights & Tips */}
                  <div className="space-y-6">
                    {/* Performance Insights */}
                    {earningsStats.performance && (
                      <PerformanceInsights
                        performance={earningsStats.performance}
                        isLoading={loading}
                      />
                    )}

                    {/* Delivery Stats */}
                    <DeliveryStatsCard
                      stats={{
                        totalKilometers: 0,
                        totalItems: 0,
                        avgTimePerOrder: 0,
                        storesVisited: earningsStats.storeBreakdown?.length || 0,
                      }}
                      isLoading={loading}
                    />

                    {/* Earnings Goals */}
                    {earningsStats.goals && (
                      <EarningsGoalsProgress
                        goals={earningsStats.goals}
                        isLoading={loading}
                      />
                    )}

                    {/* Tips to Boost Earnings */}
                    <EarningsTipsCard
                      performance={earningsStats.performance}
                      completedOrders={earningsStats.completedOrders}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ShopperLayout>
    </AuthGuard>
  );
};

export default EarningsPage;
