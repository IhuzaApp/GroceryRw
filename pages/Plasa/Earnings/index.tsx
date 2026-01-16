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
import EarningOverviewChart from "@components/shopper/earnings/EarningOverviewChart";
import TopStoresCard from "@components/shopper/earnings/TopStoresCard";
import EarningsComponentsCard from "@components/shopper/earnings/EarningsComponentsCard";
import PerformanceMetricsCard from "@components/shopper/earnings/PerformanceMetricsCard";
import BusiestTimesCard from "@components/shopper/earnings/BusiestTimesCard";
import EarningsTabs from "@components/shopper/earnings/EarningsTabs";
import TransactionCardsMobile from "@components/shopper/earnings/TransactionCardsMobile";
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

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    fetchDailyEarnings(value);
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

      const data = await response.json();

      if (!response.ok) {
        // Extract the error message from the API response
        const errorMessage = data.message || data.error || "Failed to request payout";
        throw new Error(errorMessage);
      }
      
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
        {/* Loading State */}
        {!isInitialized && (
          <div className="flex h-full items-center justify-center">
            <Loader size="lg" />
          </div>
        )}

        {/* New Dashboard Layout */}
        {isInitialized && (
          <div className="container mx-auto max-w-7xl">
            {/* Tabs Navigation */}
            <EarningsTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <>
              {/* Top Grid - Stats Cards */}
              <div className="mb-3 sm:mb-4 md:mb-6 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
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
              <div className="mb-3 sm:mb-4 md:mb-6 grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
                {/* Earning Overview Chart - Takes 2 columns */}
                <EarningOverviewChart
                  totalEarnings={earningsStats.totalEarnings}
                  period={period}
                  onPeriodChange={handlePeriodChange}
                  dailyEarnings={dailyEarnings}
                  isLoading={dailyEarningsLoading}
                />

                {/* Top Stores by Earnings */}
                <TopStoresCard
                  storeBreakdown={earningsStats.storeBreakdown}
                  isLoading={loading}
                />
              </div>

              {/* Bottom Grid - Major Expenses, Asset Valuation, Promo */}
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
                {/* Earnings Components */}
                <EarningsComponentsCard
                  earningsComponents={earningsStats.earningsComponents}
                  totalEarnings={earningsStats.totalEarnings}
                  isLoading={loading}
                />

                {/* Performance Metrics */}
                <PerformanceMetricsCard
                  performance={earningsStats.performance}
                  rating={earningsStats.rating}
                  isLoading={loading}
                />

                {/* Busiest Times Card */}
                <BusiestTimesCard
                  activitySummary={activitySummary}
                  isLoading={loading}
                />
              </div>

                </>
              )}

              {/* Breakdown Tab Content */}
              {activeTab === 'breakdown' && (
                <div
                  className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
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
                  className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
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
                  {/* Desktop View - Table */}
                  <div className="hidden md:block">
                    <TransactionTable
                      transactions={transactions}
                      isLoading={walletLoading}
                    />
                  </div>

                  {/* Mobile View - Cards */}
                  <div className="block md:hidden">
                    <TransactionCardsMobile
                      transactions={transactions}
                      isLoading={walletLoading}
                    />
                  </div>
                </div>
              )}

              {/* Achievements Tab Content */}
              {activeTab === 'achievements' && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2 items-start">
                  {/* Left Column - Working Towards Achievements */}
                  <div
                    className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
                      theme === "dark"
                        ? "bg-gray-800 text-white"
                        : "bg-white text-gray-900"
                    }`}
                  >
                    <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-bold">Working Towards</h3>
                    <AchievementBadges />
                  </div>

                  {/* Right Column - Insights & Tips */}
                  <div className="space-y-4 sm:space-y-6">
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
      </ShopperLayout>
    </AuthGuard>
  );
};

export default EarningsPage;
