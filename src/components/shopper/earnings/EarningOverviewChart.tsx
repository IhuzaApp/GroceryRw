import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { SelectPicker } from "rsuite";
import DailyEarningsChart from "./DailyEarningsChart";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface DailyEarning {
  date: string;
  amount: number;
}

interface EarningOverviewChartProps {
  totalEarnings: number;
  period: string;
  onPeriodChange: (value: string) => void;
  dailyEarnings: DailyEarning[];
  isLoading?: boolean;
}

const EarningOverviewChart: React.FC<EarningOverviewChartProps> = ({
  totalEarnings,
  period,
  onPeriodChange,
  dailyEarnings,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const periodOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "this-week" },
    { label: "Last Week", value: "last-week" },
    { label: "This Month", value: "this-month" },
    { label: "Last Month", value: "last-month" },
  ];

  return (
    <div
      className={`lg:col-span-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-bold">Earning Overview</h3>
        <SelectPicker
          data={periodOptions}
          value={period}
          cleanable={false}
          onChange={(value) => onPeriodChange(value as string)}
          style={{ width: 150 }}
          size="sm"
        />
      </div>

      {/* Chart Stats */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm opacity-60">Total Earning</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl sm:text-2xl font-bold">
            {formatCurrencySync(totalEarnings)}
          </p>
          <span className="text-xs sm:text-sm font-medium text-green-500">+67%</span>
        </div>
      </div>

      {/* Real Daily Earnings Chart */}
      <div className="h-48 sm:h-56 md:h-64">
        <DailyEarningsChart
          data={dailyEarnings}
          isLoading={isLoading}
          period={period}
        />
      </div>
    </div>
  );
};

export default EarningOverviewChart;
