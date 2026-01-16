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
      className={`rounded-xl p-4 shadow-lg sm:rounded-2xl sm:p-6 lg:col-span-2 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:mb-6 sm:flex-row sm:items-center sm:gap-0">
        <h3 className="text-base font-bold sm:text-lg">Earning Overview</h3>
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
        <p className="text-xs opacity-60 sm:text-sm">Total Earning</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold sm:text-2xl">
            {formatCurrencySync(totalEarnings)}
          </p>
          <span className="text-xs font-medium text-green-500 sm:text-sm">
            +67%
          </span>
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
