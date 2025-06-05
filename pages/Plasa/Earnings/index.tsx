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
import { logger } from '../../../src/utils/logger';

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
        logger.error("Error fetching earnings stats", "EarningsPage", error);
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
      logger.error("Error fetching wallet data", "EarningsPage", error);
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
      logger.error("Error fetching delivery stats", "EarningsPage", error);
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
      logger.error("Error fetching recent orders", "EarningsPage", error);
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
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Earnings Period Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Your Earnings</h2>
              <SelectPicker
                data={[
                  { label: "Today", value: "today" },
                  { label: "This Week", value: "this-week" },
                  { label: "Last Week", value: "last-week" },
                  { label: "This Month", value: "this-month" },
                  { label: "Last Month", value: "last-month" },
                  { label: "Custom Range", value: "custom" },
                ]}
                defaultValue="this-week"
                cleanable={false}
                onChange={handlePeriodChange}
                style={{ width: 180 }}
                className={`${theme === 'dark' ? 'rs-picker-dark !text-white [&_.rs-picker-toggle]:!text-white [&_.rs-picker-toggle-value]:!text-white [&_.rs-picker-toggle-placeholder]:!text-white [&_.rs-picker-select-menu-item]:!text-white' : ''}`}
              />
            </div>
            <Button appearance="primary" className={`flex items-center gap-2 ${theme === 'dark' ? '!text-white' : ''}`}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <span>Download Report</span>
            </Button>
          </div>

          {/* Earnings Summary Cards */}
          <div className={`mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 ${theme === 'dark' ? '!text-white' : 'text-gray-800'}`}>
            {loading ? (
              <div className={`col-span-4 flex justify-center py-8 ${theme === 'dark' ? '!text-white' : ''}`}>
                <Loader size="lg" content="Loading earnings data..." />
              </div>
            ) : (
              <>
                <EarningsSummaryCard
                  title="Total Earnings"
                  amount={formatCurrency(earningsStats.totalEarnings)}
                  icon={
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                    </svg>
                  }
                  iconColor="text-yellow-500"
                />
                <EarningsSummaryCard
                  title="Completed Orders"
                  amount={formatNumber(earningsStats.completedOrders)}
                  icon={
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  }
                  iconColor="text-blue-500"
                />
                <EarningsSummaryCard
                  title="Active Hours"
                  amount={formatNumber(earningsStats.activeHours)}
                  icon={
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                  }
                  iconColor="text-purple-500"
                />
                <EarningsSummaryCard
                  title="Customer Rating"
                  amount={earningsStats.rating.toFixed(1)}
                  icon={
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  }
                  iconColor="text-yellow-500"
                />
              </>
            )}
          </div>

          {/* Earnings Tabs */}
          <Tabs
            className={`mb-6 ${theme === 'dark' ? 'rs-tabs-dark !text-white [&_.rs-nav-item]:!text-white [&_.rs-nav-item-active]:!text-white [&_.rs-nav-item-content]:!text-white' : ''}`}
            activeKey={activeTab}
            onSelect={handleTabChange}
            appearance="subtle"
          >
            <Tabs.Tab eventKey="earnings" title="Earnings">
              <Panel shaded bordered className={`mt-4 ${theme === 'dark' ? 'rs-panel-dark !text-white [&_*]:!text-white' : ''}`}>
                <h3 className={`mb-2 text-lg font-bold ${theme === 'dark' ? '!text-white' : 'text-gray-800'}`}>Daily Earnings</h3>
                <p className={`mb-4 text-sm ${theme === 'dark' ? '!text-white' : 'text-gray-500'}`}>
                  Your earnings for each day this week
                </p>

                <DailyEarningsChart
                  data={dailyEarnings}
                  isLoading={dailyEarningsLoading}
                  period={period}
                />
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="recent-orders" title="Recent Orders">
              <Panel shaded bordered className={`mt-4 ${theme === 'dark' ? 'rs-panel-dark !text-white [&_*]:!text-white' : ''}`}>
                <h3 className={`mb-2 text-lg font-bold ${theme === 'dark' ? '!text-white' : 'text-gray-800'}`}>Recent Orders</h3>
                <p className={`mb-4 text-sm ${theme === 'dark' ? '!text-white' : 'text-gray-500'}`}>
                  Your recently completed orders and earnings
                </p>

                <RecentOrdersList
                  orders={recentOrders}
                  isLoading={recentOrdersLoading}
                  pageSize={ordersPerPage}
                  currentPage={currentPage}
                  totalOrders={totalOrders}
                  onPageChange={handleOrdersPageChange}
                  serverPagination={true}
                />
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="breakdown" title="Breakdown">
              <Panel shaded bordered className={`mt-4 p-4 ${theme === 'dark' ? 'rs-panel-dark !text-white [&_*]:!text-white' : ''}`}>
                <h3 className={`mb-2 text-lg font-bold ${theme === 'dark' ? '!text-white' : 'text-gray-800'}`}>Earnings Breakdown</h3>
                <p className={`mb-4 text-sm ${theme === 'dark' ? '!text-white' : 'text-gray-500'}`}>
                  How your earnings are distributed
                </p>

                {loading ? (
                  <div className={`flex justify-center py-8 ${theme === 'dark' ? '!text-white' : ''}`}>
                    <Loader size="md" content="Loading earnings data..." />
                  </div>
                ) : !earningsStats.storeBreakdown ||
                  !earningsStats.earningsComponents ? (
                  <div className={`py-8 text-center ${theme === 'dark' ? '!text-white' : 'text-gray-600'}`}>
                    <p>No earnings breakdown data available.</p>
                  </div>
                ) : (
                  <>
                    <EarningsBreakdown
                      storeBreakdown={earningsStats.storeBreakdown.map(
                        (store) => ({
                          ...store,
                          amount: parseFloat(store.amount.toFixed(2)),
                        })
                      )}
                      earningsComponents={earningsStats.earningsComponents.map(
                        (component) => ({
                          ...component,
                          amount: parseFloat(component.amount.toFixed(2)),
                        })
                      )}
                    />

                    <ActivityHeatmap />
                  </>
                )}
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="payouts" title="Payouts">
              <Panel shaded bordered className={`mt-4 p-4 ${theme === 'dark' ? 'rs-panel-dark !text-white [&_*]:!text-white' : ''}`}>
                <h3 className={`mb-2 text-lg font-bold ${theme === 'dark' ? '!text-white' : 'text-gray-800'}`}>Payment History</h3>
                <p className={`mb-4 text-sm ${theme === 'dark' ? '!text-white' : 'text-gray-500'}`}>
                  Your recent payouts and upcoming payments
                </p>

                {walletLoading ? (
                  <div className={`flex justify-center py-8 ${theme === 'dark' ? '!text-white' : ''}`}>
                    <Loader size="md" content="Loading wallet data..." />
                  </div>
                ) : (
                  <PaymentHistory
                    wallet={wallet}
                    transactions={transactions}
                    onViewAllPayments={() =>
                      console.log("View all payments clicked")
                    }
                    isLoading={walletLoading}
                  />
                )}
              </Panel>
            </Tabs.Tab>
          </Tabs>

          {/* Performance Metrics and Goals */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {deliveryStatsLoading ? (
              <div className="flex h-96 items-center justify-center rounded-lg border">
                <Loader size="md" content="Loading delivery stats..." />
              </div>
            ) : (
              <PerformanceMetrics
                metrics={getPerformanceMetrics()}
                deliveryStats={formattedDeliveryStats}
              />
            )}

            <EarningsGoals goals={getEarningsGoals()} />
          </div>
        </div>
      </div>
    </ShopperLayout>
  );
};

export default EarningsPage;
