import React, { useState, SyntheticEvent, useEffect } from "react";
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
  const [activeTab, setActiveTab] = useState("earnings");
  const [loading, setLoading] = useState(true);
  const [walletLoading, setWalletLoading] = useState(true);
  const [deliveryStatsLoading, setDeliveryStatsLoading] = useState(true);
  const [earningsStats, setEarningsStats] = useState<EarningsStats>({
    totalEarnings: 0,
    completedOrders: 0,
    activeHours: 0,
    rating: 0,
  });
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    totalKilometers: 0,
    totalItems: 0,
    avgTimePerOrder: 0,
    storesVisited: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(true);
  const [dailyEarnings, setDailyEarnings] = useState<any[]>([]);
  const [dailyEarningsLoading, setDailyEarningsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 5;

  // Fetch earnings stats
  useEffect(() => {
    const fetchEarningsStats = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/shopper/earningsStats");
        if (!response.ok) {
          throw new Error("Failed to fetch earnings stats");
        }
        const data = await response.json();
        if (data.success) {
          setEarningsStats(data.stats);
        }
      } catch (error) {
        console.error("Error fetching earnings stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsStats();
  }, []);

  // Fetch wallet and transaction data when the Payouts tab is selected
  useEffect(() => {
    if (activeTab === "payouts") {
      fetchWalletData();
    }
  }, [activeTab]);

  // Fetch delivery stats when the component loads
  useEffect(() => {
    fetchDeliveryStats();
  }, []);

  // Fetch recent orders when the earnings tab is selected or on component load
  useEffect(() => {
    if (activeTab === "earnings") {
      fetchRecentOrders();
    }
  }, [activeTab]);

  // Add useEffect to fetch daily earnings
  useEffect(() => {
    fetchDailyEarnings(period);
  }, [period]);

  // Function to fetch wallet and transaction data
  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const response = await fetch("/api/shopper/walletHistory");
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
      console.error("Error fetching wallet data:", error);
      setWallet({ id: "", availableBalance: 0, reservedBalance: 0 });
      setTransactions([]);
    } finally {
      setWalletLoading(false);
    }
  };

  // Function to fetch delivery stats
  const fetchDeliveryStats = async () => {
    try {
      setDeliveryStatsLoading(true);
      const response = await fetch("/api/shopper/deliveryStats");
      if (!response.ok) {
        throw new Error("Failed to fetch delivery stats");
      }
      const data = await response.json();
      if (data.success) {
        setDeliveryStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching delivery stats:", error);
    } finally {
      setDeliveryStatsLoading(false);
    }
  };

  // Function to fetch recent orders with pagination
  const fetchRecentOrders = async (page: number = 1) => {
    try {
      setRecentOrdersLoading(true);
      const response = await fetch(
        `/api/shopper/recentOrders?page=${page}&limit=${ordersPerPage}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch recent orders");
      }
      const data = await response.json();
      if (data.success) {
        setRecentOrders(data.orders);
        setTotalOrders(data.total || 0);
        setCurrentPage(page);
      } else {
        setRecentOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
      setRecentOrders([]);
      setTotalOrders(0);
    } finally {
      setRecentOrdersLoading(false);
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
        setDailyEarnings(data.data);
      } else {
        setDailyEarnings([]);
      }
    } catch (error) {
      console.error("Error fetching daily earnings:", error);
      setDailyEarnings([]);
    } finally {
      setDailyEarningsLoading(false);
    }
  };

  // Create performance metrics using data from the API
  const getPerformanceMetrics = () => {
    if (!earningsStats.performance) {
      // Fallback to default values if API doesn't provide performance data
      return [
        { metric: "Customer Rating", value: 4.92, max: 5, percentage: 98 },
        { metric: "On-time Delivery", value: 97, max: 100, percentage: 97 },
        { metric: "Order Accuracy", value: 99, max: 100, percentage: 99 },
        { metric: "Acceptance Rate", value: 82, max: 100, percentage: 82 },
      ];
    }

    return [
      {
        metric: "Customer Rating",
        value: earningsStats.performance.customerRating,
        max: 5,
        percentage: Math.round(
          (earningsStats.performance.customerRating / 5) * 100
        ),
      },
      {
        metric: "On-time Delivery",
        value: earningsStats.performance.onTimeDelivery,
        max: 100,
        percentage: earningsStats.performance.onTimeDelivery,
      },
      {
        metric: "Order Accuracy",
        value: earningsStats.performance.orderAccuracy,
        max: 100,
        percentage: earningsStats.performance.orderAccuracy,
      },
      {
        metric: "Acceptance Rate",
        value: earningsStats.performance.acceptanceRate,
        max: 100,
        percentage: earningsStats.performance.acceptanceRate,
      },
    ];
  };

  // Create earnings goals using data from the API
  const getEarningsGoals = () => {
    if (!earningsStats.goals) {
      // Fallback to default values if API doesn't provide goals data
      return [
        {
          goal: "Weekly Target",
          current: 1248.5,
          target: 1500,
          percentage: 83,
        },
        {
          goal: "Monthly Target",
          current: 3820.75,
          target: 6000,
          percentage: 64,
        },
        {
          goal: "Quarterly Bonus",
          current: 8500,
          target: 15000,
          percentage: 57,
        },
      ];
    }

    return [
      {
        goal: "Weekly Target",
        current: earningsStats.goals.weekly.current,
        target: earningsStats.goals.weekly.target,
        percentage: earningsStats.goals.weekly.percentage,
      },
      {
        goal: "Monthly Target",
        current: earningsStats.goals.monthly.current,
        target: earningsStats.goals.monthly.target,
        percentage: earningsStats.goals.monthly.percentage,
      },
      {
        goal: "Quarterly Bonus",
        current: earningsStats.goals.quarterly.current,
        target: earningsStats.goals.quarterly.target,
        percentage: earningsStats.goals.quarterly.percentage,
      },
    ];
  };

  const handlePeriodChange = (value: string | null, event: SyntheticEvent) => {
    if (value) {
      setPeriod(value);
      // Fetch data for the selected period
      fetchDailyEarnings(value);
    }
  };

  const handleTabChange = (
    eventKey: string | number | undefined,
    event: SyntheticEvent
  ) => {
    if (typeof eventKey === "string") {
      setActiveTab(eventKey);
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
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Create delivery stats for the performance metrics component
  const formattedDeliveryStats = [
    {
      title: "Total Kilometers",
      value: deliveryStats.totalKilometers,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      iconColor: "text-red-500",
    },
    {
      title: "Total Items",
      value: deliveryStats.totalItems.toLocaleString(),
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
      iconColor: "text-blue-500",
    },
    {
      title: "Avg. Time per Order",
      value: `${deliveryStats.avgTimePerOrder} min`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
      ),
      iconColor: "text-purple-500",
    },
    {
      title: "Stores Visited",
      value: deliveryStats.storesVisited,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
        </svg>
      ),
      iconColor: "text-green-500",
    },
  ];

  // Handle page change for recent orders
  const handleOrdersPageChange = (page: number) => {
    fetchRecentOrders(page);
  };

  return (
    <ShopperLayout>
      <div className={`container mx-auto px-4 py-8 ${
        theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
      }`}>
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
          }`}>
            Earnings & Performance
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Track your earnings, performance metrics, and payment history
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <SelectPicker
            data={[
              { label: "This Week", value: "this-week" },
              { label: "Last Week", value: "last-week" },
              { label: "This Month", value: "this-month" },
              { label: "Last Month", value: "last-month" },
              { label: "Last 3 Months", value: "last-3-months" },
            ]}
            value={period}
            onChange={handlePeriodChange}
            cleanable={false}
            searchable={false}
            className={`w-48 ${
              theme === 'dark' 
                ? 'rs-picker-dark' // Add custom dark theme class for rsuite components
                : ''
            }`}
          />
        </div>

        <Tabs
          appearance="subtle"
          activeKey={activeTab}
          onSelect={handleTabChange}
          className={`mb-8 ${
            theme === 'dark' ? 'rs-tabs-dark' : ''
          }`}
        >
          <Tabs.Tab eventKey="earnings" title="Earnings">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className={`col-span-full flex justify-center py-12 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Loader content="Loading earnings data..." />
                </div>
              ) : (
                <>
                  <EarningsSummaryCard 
                    totalEarnings={earningsStats.totalEarnings}
                    completedOrders={earningsStats.completedOrders}
                    activeHours={earningsStats.activeHours}
                    rating={earningsStats.rating}
                  />
                  <DailyEarningsChart 
                    data={dailyEarnings} 
                    isLoading={dailyEarningsLoading} 
                  />
                  <RecentOrdersList 
                    orders={recentOrders} 
                    isLoading={recentOrdersLoading}
                    currentPage={currentPage}
                    totalOrders={totalOrders}
                    onPageChange={handleOrdersPageChange}
                  />
                  <EarningsBreakdown 
                    storeBreakdown={earningsStats.storeBreakdown || []}
                    earningsComponents={earningsStats.earningsComponents || []}
                  />
                  <ActivityHeatmap />
                  <PerformanceMetrics 
                    metrics={getPerformanceMetrics()}
                    deliveryStats={formattedDeliveryStats}
                  />
                  <EarningsGoals goals={getEarningsGoals()} />
                </>
              )}
            </div>
          </Tabs.Tab>

          <Tabs.Tab eventKey="payouts" title="Payouts & History">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {walletLoading ? (
                <div className={`col-span-full flex justify-center py-12 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <Loader content="Loading payment data..." />
                </div>
              ) : (
                <>
                  <PaymentHistory 
                    wallet={wallet} 
                    transactions={transactions}
                    onViewAllPayments={() => console.log("View all payments clicked")}
                  />
                </>
              )}
            </div>
          </Tabs.Tab>
        </Tabs>
      </div>
    </ShopperLayout>
  );
};

export default EarningsPage;
