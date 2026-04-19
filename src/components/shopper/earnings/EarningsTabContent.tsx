import React from "react";
import { Loader } from "rsuite";
import TotalBalanceCard from "./TotalBalanceCard";
import TotalTransactionsCard from "./TotalTransactionsCard";
import TotalSpendCard from "./TotalSpendCard";
import ScheduleCard from "./ScheduleCard";
import EarningOverviewChart from "./EarningOverviewChart";
import TopStoresCard from "./TopStoresCard";
import EarningsComponentsCard from "./EarningsComponentsCard";
import PerformanceMetricsCard from "./PerformanceMetricsCard";
import BusiestTimesCard from "./BusiestTimesCard";
import EarningsBreakdown from "./EarningsBreakdown";
import ActivityHeatmap from "./ActivityHeatmap";
import RecentOrdersList from "./RecentOrdersList";
import TransactionTable from "./TransactionTable";
import TransactionCardsMobile from "./TransactionCardsMobile";
import AchievementBadges from "./AchievementBadges";
import AchievementBadgesMobile from "./AchievementBadgesMobile";
import PerformanceInsights from "./PerformanceInsights";
import DeliveryStatsCard from "./DeliveryStatsCard";
import EarningsGoalsProgress from "./EarningsGoalsProgress";
import EarningsTipsCard from "./EarningsTipsCard";

interface EarningsTabContentProps {
  activeTab: string;
  earningsStats: any;
  wallet: any;
  walletLoading: boolean;
  transactions: any[];
  dailyEarnings: any[];
  dailyEarningsLoading: boolean;
  activitySummary: any;
  shopperSchedule: any[];
  period: string;
  loading: boolean;
  isDark: boolean;
  handlePeriodChange: (v: string) => void;
  handleWithdrawal: (p: any) => Promise<void>;
}

const EarningsTabContent: React.FC<EarningsTabContentProps> = ({
  activeTab,
  earningsStats,
  wallet,
  walletLoading,
  transactions,
  dailyEarnings,
  dailyEarningsLoading,
  activitySummary,
  shopperSchedule,
  period,
  loading,
  isDark,
  handlePeriodChange,
  handleWithdrawal,
}) => {
  if (activeTab === "overview") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 items-start gap-3 sm:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
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
          <TotalSpendCard earningsStats={earningsStats} isLoading={loading} />
          <ScheduleCard shopperSchedule={shopperSchedule} isLoading={loading} />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
          <EarningOverviewChart
            totalEarnings={earningsStats.totalEarnings}
            period={period}
            onPeriodChange={handlePeriodChange}
            dailyEarnings={dailyEarnings}
            isLoading={dailyEarningsLoading}
          />
          <TopStoresCard
            storeBreakdown={earningsStats.storeBreakdown}
            isLoading={loading}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
          <EarningsComponentsCard
            earningsComponents={earningsStats.earningsComponents}
            totalEarnings={earningsStats.totalEarnings}
            isLoading={loading}
          />
          <PerformanceMetricsCard
            performance={earningsStats.performance}
            rating={earningsStats.rating}
            isLoading={loading}
          />
          <BusiestTimesCard activitySummary={activitySummary} isLoading={loading} />
        </div>
      </div>
    );
  }

  if (activeTab === "breakdown") {
    return (
      <div className="space-y-6">
        {loading ? (
          <div className={`flex justify-center py-20 rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
            <Loader size="md" content="Syncing Breakdown..." />
          </div>
        ) : !earningsStats.storeBreakdown || !earningsStats.earningsComponents ? (
          <div className={`py-20 text-center rounded-[2.5rem] border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
            <p className="text-sm font-bold opacity-20 uppercase tracking-widest">No detailed breakdown found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <EarningsBreakdown
              storeBreakdown={earningsStats.storeBreakdown.map((store: any) => ({
                ...store,
                amount: parseFloat(store.amount.toFixed(2)),
              }))}
              earningsComponents={earningsStats.earningsComponents.map((component: any) => ({
                ...component,
                amount: parseFloat(component.amount.toFixed(2)),
              }))}
              hideEarningsComponents={false}
            />
            <ActivityHeatmap hideSummary={true} />
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "recent-orders") {
    return (
      <div className="space-y-6">
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
    );
  }

  if (activeTab === "payments") {
    return (
      <div className="space-y-6">
        <div className="hidden lg:block">
          <TransactionTable transactions={transactions} isLoading={walletLoading} />
        </div>
        <div className="block lg:hidden">
          <TransactionCardsMobile transactions={transactions} isLoading={walletLoading} />
        </div>
      </div>
    );
  }

  if (activeTab === "achievements") {
    return (
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="hidden lg:block">
              <AchievementBadges />
            </div>
            <div className="block lg:hidden">
              <AchievementBadgesMobile />
            </div>
          </div>
          {earningsStats.performance && (
            <PerformanceInsights
              performance={earningsStats.performance}
              isLoading={loading}
            />
          )}
        </div>

        <div className="space-y-10">
          <DeliveryStatsCard
            stats={{
              totalKilometers: 0,
              totalItems: 0,
              avgTimePerOrder: 0,
              storesVisited: earningsStats.storeBreakdown?.length || 0,
            }}
            isLoading={loading}
          />
          {earningsStats.goals && (
            <EarningsGoalsProgress
              goals={earningsStats.goals}
              isLoading={loading}
            />
          )}
          <EarningsTipsCard
            performance={earningsStats.performance}
            completedOrders={earningsStats.completedOrders}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default EarningsTabContent;
