import React, { useState, SyntheticEvent, useEffect } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { Panel, Button, SelectPicker, Nav, Tabs, Loader } from "rsuite";
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
}

const EarningsPage: React.FC = () => {
  const [period, setPeriod] = useState("this-week");
  const [activeTab, setActiveTab] = useState("earnings");
  const [loading, setLoading] = useState(true);
  const [earningsStats, setEarningsStats] = useState<EarningsStats>({
    totalEarnings: 0,
    completedOrders: 0,
    activeHours: 0,
    rating: 0,
  });

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

  // Mock data for daily earnings chart
  const dailyEarnings = [
    { day: "Mon", amount: 180, height: "60%" },
    { day: "Tue", amount: 220, height: "73%" },
    { day: "Wed", amount: 165, height: "55%" },
    { day: "Thu", amount: 195, height: "65%" },
    { day: "Fri", amount: 300, height: "100%" },
    { day: "Sat", amount: 120, height: "40%" },
    { day: "Sun", amount: 68.5, height: "23%" },
  ];

  // Mock data for recent orders
  const recentOrders = [
    {
      date: "May 12, 2025",
      store: "Whole Foods",
      items: 32,
      amount: 28.5,
      tip: 15,
    },
    {
      date: "May 12, 2025",
      store: "Target",
      items: 18,
      amount: 22.75,
      tip: 10,
    },
    {
      date: "May 11, 2025",
      store: "Costco",
      items: 45,
      amount: 35.25,
      tip: 20,
    },
    {
      date: "May 11, 2025",
      store: "Safeway",
      items: 24,
      amount: 24.5,
      tip: 12,
    },
    {
      date: "May 10, 2025",
      store: "Walmart",
      items: 28,
      amount: 26.75,
      tip: 15,
    },
  ];

  // Mock data for store breakdown
  const storeBreakdown = [
    { store: "Whole Foods", amount: 475, percentage: 38 },
    { store: "Target", amount: 340, percentage: 27 },
    { store: "Costco", amount: 220, percentage: 18 },
    { store: "Safeway", amount: 180, percentage: 14 },
    { store: "Other Stores", amount: 33.5, percentage: 3 },
  ];

  // Mock data for earnings components
  const earningsComponents = [
    { type: "Base Pay", amount: 620, percentage: 50 },
    { type: "Tips", amount: 398.5, percentage: 32 },
    { type: "Batch Pay", amount: 180, percentage: 14 },
    { type: "Peak Boost", amount: 50, percentage: 4 },
  ];

  // Mock data for performance metrics
  const performanceMetrics = [
    { metric: "Customer Rating", value: 4.92, max: 5, percentage: 98 },
    { metric: "On-time Delivery", value: 97, max: 100, percentage: 97 },
    { metric: "Order Accuracy", value: 99, max: 100, percentage: 99 },
    { metric: "Acceptance Rate", value: 82, max: 100, percentage: 82 },
  ];

  // Mock data for delivery stats
  const deliveryStats = [
    {
      title: "Total Miles",
      value: 428,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      ),
      iconColor: "text-red-500",
    },
    {
      title: "Total Items",
      value: "1,245",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      ),
      iconColor: "text-blue-500",
    },
    {
      title: "Avg. Time per Order",
      value: "42 min",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
        </svg>
      ),
      iconColor: "text-purple-500",
    },
    {
      title: "Stores Visited",
      value: 12,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z" />
        </svg>
      ),
      iconColor: "text-green-500",
    },
  ];

  // Mock data for earnings goals
  const earningsGoals = [
    { goal: "Weekly Target", current: 1248.5, target: 1500, percentage: 83 },
    { goal: "Monthly Target", current: 3820.75, target: 6000, percentage: 64 },
    { goal: "Quarterly Bonus", current: 8500, target: 15000, percentage: 57 },
  ];

  // Mock data for payment history
  const nextPayout = { amount: 748.5, date: "May 15, 2025" };
  const paymentHistory = [
    { date: "May 1, 2025", amount: 820.75, status: "Completed" },
    { date: "April 15, 2025", amount: 945.25, status: "Completed" },
    { date: "April 1, 2025", amount: 780.5, status: "Completed" },
    { date: "March 15, 2025", amount: 890.0, status: "Completed" },
    { date: "March 1, 2025", amount: 810.25, status: "Completed" },
  ];

  const handlePeriodChange = (value: string | null, event: SyntheticEvent) => {
    if (value) {
      setPeriod(value);
      // In a real app, you would fetch data for the selected period here
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
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <ShopperLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Earnings Period Selector */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold">Your Earnings</h2>
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
              />
            </div>
            <Button appearance="primary" className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              <span>Download Report</span>
            </Button>
          </div>

          {/* Earnings Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              <div className="col-span-4 flex justify-center py-8">
                <Loader size="lg" content="Loading earnings data..." />
              </div>
            ) : (
              <>
                <EarningsSummaryCard
                  title="Total Earnings"
                  amount={formatNumber(earningsStats.totalEarnings)}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-full w-full"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                    </svg>
                  }
                  iconColor="text-yellow-500"
                />
                <EarningsSummaryCard
                  title="Completed Orders"
                  amount={earningsStats.completedOrders.toString()}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-full w-full"
                    >
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" />
                    </svg>
                  }
                  iconColor="text-blue-500"
                />
                <EarningsSummaryCard
                  title="Active Hours"
                  amount={earningsStats.activeHours.toString()}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-full w-full"
                    >
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                  }
                  iconColor="text-purple-500"
                />
                <EarningsSummaryCard
                  title="Customer Rating"
                  amount={earningsStats.rating.toString()}
                  icon={
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-full w-full"
                    >
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
            className="mb-6"
            activeKey={activeTab}
            onSelect={handleTabChange}
            appearance="subtle"
          >
            <Tabs.Tab eventKey="earnings" title="Earnings">
              <Panel shaded bordered className="mt-4">
                <h3 className="mb-2 text-lg font-bold">Daily Earnings</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Your earnings for each day this week
                </p>

                <DailyEarningsChart data={dailyEarnings} />

                <RecentOrdersList
                  orders={recentOrders}
                  onViewAllOrders={() => console.log("View all orders clicked")}
                />
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="breakdown" title="Breakdown">
              <Panel shaded bordered className="mt-4 p-4">
                <h3 className="mb-2 text-lg font-bold">Earnings Breakdown</h3>
                <p className="mb-4 text-sm text-gray-500">
                  How your earnings are distributed
                </p>

                <EarningsBreakdown
                  storeBreakdown={storeBreakdown}
                  earningsComponents={earningsComponents}
                />

                <ActivityHeatmap />
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="payouts" title="Payouts">
              <Panel shaded bordered className="mt-4 p-4">
                <h3 className="mb-2 text-lg font-bold">Payment History</h3>
                <p className="mb-4 text-sm text-gray-500">
                  Your recent payouts and upcoming payments
                </p>

                <PaymentHistory
                  nextPayout={nextPayout}
                  payments={paymentHistory}
                  onViewAllPayments={() =>
                    console.log("View all payments clicked")
                  }
                />
              </Panel>
            </Tabs.Tab>
          </Tabs>

          {/* Performance Metrics and Goals */}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PerformanceMetrics
              metrics={performanceMetrics}
              deliveryStats={deliveryStats}
            />

            <EarningsGoals goals={earningsGoals} />
          </div>
        </div>
      </div>
    </ShopperLayout>
  );
};

export default EarningsPage;
