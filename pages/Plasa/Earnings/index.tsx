import React, { useState, SyntheticEvent } from "react";
import ShopperLayout from "@components/shopper/ShopperLayout";
import { 
  Panel, 
  Button, 
  SelectPicker, 
  Nav, 
  Tabs
} from "rsuite";
import EarningsSummaryCard from "@components/shopper/earnings/EarningsSummaryCard";
import DailyEarningsChart from "@components/shopper/earnings/DailyEarningsChart";
import RecentOrdersList from "@components/shopper/earnings/RecentOrdersList";
import EarningsBreakdown from "@components/shopper/earnings/EarningsBreakdown";
import ActivityHeatmap from "@components/shopper/earnings/ActivityHeatmap";
import PerformanceMetrics from "@components/shopper/earnings/PerformanceMetrics";
import EarningsGoals from "@components/shopper/earnings/EarningsGoals";
import PaymentHistory from "@components/shopper/earnings/PaymentHistory";

const EarningsPage: React.FC = () => {
  const [period, setPeriod] = useState('this-week');
  const [activeTab, setActiveTab] = useState('earnings');

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
    { date: "May 12, 2025", store: "Whole Foods", items: 32, amount: 28.5, tip: 15 },
    { date: "May 12, 2025", store: "Target", items: 18, amount: 22.75, tip: 10 },
    { date: "May 11, 2025", store: "Costco", items: 45, amount: 35.25, tip: 20 },
    { date: "May 11, 2025", store: "Safeway", items: 24, amount: 24.5, tip: 12 },
    { date: "May 10, 2025", store: "Walmart", items: 28, amount: 26.75, tip: 15 },
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
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ), 
      iconColor: "text-red-500" 
    },
    { 
      title: "Total Items", 
      value: "1,245", 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      ), 
      iconColor: "text-blue-500" 
    },
    { 
      title: "Avg. Time per Order", 
      value: "42 min", 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
        </svg>
      ), 
      iconColor: "text-purple-500" 
    },
    { 
      title: "Stores Visited", 
      value: 12, 
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
          <path d="M20 4H4v2h16V4zm1 10v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1zm-9 4H6v-4h6v4z"/>
        </svg>
      ), 
      iconColor: "text-green-500" 
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

  const handleTabChange = (eventKey: string | number | undefined, event: SyntheticEvent) => {
    if (typeof eventKey === 'string') {
      setActiveTab(eventKey);
    }
  };

  return (
    <ShopperLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Earnings Period Selector */}
          <div className="flex justify-between items-center mb-6">
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
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              <span>Download Report</span>
            </Button>
          </div>

          {/* Earnings Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <EarningsSummaryCard
              title="Total Earnings"
              amount="$1,248.50"
              trend="+12%"
              icon={
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              }
            />
            <EarningsSummaryCard
              title="Completed Orders"
              amount="42"
              trend="+8"
              trendText="from last week"
              icon={
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                  <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 4h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h11c.55 0 1-.45 1-1s-.45-1-1-1H7l1.1-2h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.37-.66-.11-1.48-.87-1.48H5.21l-.67-1.43c-.16-.35-.52-.57-.9-.57H2c-.55 0-1 .45-1 1s.45 1 1 1zm16 14c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              }
              iconColor="text-blue-500"
            />
            <EarningsSummaryCard
              title="Active Hours"
              amount="28.5"
              trend="+3.5"
              trendText="from last week"
              icon={
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              }
              iconColor="text-purple-500"
            />
            <EarningsSummaryCard
              title="Customer Rating"
              amount="4.92"
              trend="+0.1"
              trendText="from last week"
              icon={
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              }
              iconColor="text-yellow-500"
            />
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
                <h3 className="text-lg font-bold mb-2">Daily Earnings</h3>
                <p className="text-sm text-gray-500 mb-4">Your earnings for each day this week</p>
                
                <DailyEarningsChart data={dailyEarnings} />
                
                <RecentOrdersList 
                  orders={recentOrders}
                  onViewAllOrders={() => console.log('View all orders clicked')}
                />
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="breakdown" title="Breakdown">
              <Panel shaded bordered className="mt-4 p-4">
                <h3 className="text-lg font-bold mb-2">Earnings Breakdown</h3>
                <p className="text-sm text-gray-500 mb-4">How your earnings are distributed</p>
                
                <EarningsBreakdown
                  storeBreakdown={storeBreakdown}
                  earningsComponents={earningsComponents}
                />
                
                <ActivityHeatmap />
              </Panel>
            </Tabs.Tab>

            <Tabs.Tab eventKey="payouts" title="Payouts">
              <Panel shaded bordered className="mt-4 p-4">
                <h3 className="text-lg font-bold mb-2">Payment History</h3>
                <p className="text-sm text-gray-500 mb-4">Your recent payouts and upcoming payments</p>
                
                <PaymentHistory
                  nextPayout={nextPayout}
                  payments={paymentHistory}
                  onViewAllPayments={() => console.log('View all payments clicked')}
                />
              </Panel>
            </Tabs.Tab>
          </Tabs>

          {/* Performance Metrics and Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
