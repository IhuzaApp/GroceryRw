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
  const isDark = theme === "dark";

  const periodOptions = [
    { label: "Today", value: "today" },
    { label: "This Week", value: "this-week" },
    { label: "Last Week", value: "last-week" },
    { label: "This Month", value: "this-month" },
    { label: "Last Month", value: "last-month" },
  ];

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 lg:col-span-2 ${
        isDark
          ? "border border-white/10 bg-white/5"
          : "border border-black/5 bg-white shadow-xl"
      }`}
    >
      <div className="relative z-10">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
          <div>
            <h3 className="text-xl font-black tracking-tight">
              Earning Overview
            </h3>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest opacity-40">
              Activity Analysis
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <SelectPicker
              data={periodOptions}
              value={period}
              cleanable={false}
              searchable={false}
              onChange={(value) => onPeriodChange(value as string)}
              style={{ width: "100%" }}
              className="custom-select-glass"
              size="md"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Chart Stats */}
          <div className="md:col-span-1">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                Net Earnings
              </p>
              <p className="bg-gradient-to-br from-emerald-400 to-teal-500 bg-clip-text text-3xl font-black text-transparent">
                {formatCurrencySync(totalEarnings)}
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div
                className={`rounded-2xl p-4 transition-colors ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Growth
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-500">
                    +67%
                  </span>
                  <div className="h-4 w-4 text-emerald-500">
                    <svg
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className={`rounded-2xl p-4 transition-colors ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Target
                </p>
                <p className="mt-1 text-lg font-black opacity-80">
                  82%{" "}
                  <span className="ml-1 text-xs font-bold opacity-40">
                    Reached
                  </span>
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
                    style={{ width: "82%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Real Daily Earnings Chart */}
          <div className="h-64 min-h-[280px] md:col-span-3 md:h-full">
            <DailyEarningsChart
              data={dailyEarnings}
              isLoading={isLoading}
              period={period}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningOverviewChart;
