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
      className={`group relative overflow-hidden rounded-[3rem] p-8 transition-all duration-500 lg:col-span-2 ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-3xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      <div className="relative z-10">
        <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center sm:gap-0">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Revenue Performance
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Interactive Activity Analysis
            </p>
          </div>
          <div className="w-full sm:w-64">
            <SelectPicker
              data={periodOptions}
              value={period}
              cleanable={false}
              searchable={false}
              onChange={(value) => onPeriodChange(value as string)}
              style={{ width: "100%" }}
              className="custom-select-premium"
              size="lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Chart Stats */}
          <div className="md:col-span-1 space-y-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                Net Period Revenue
              </p>
              <p className="bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 bg-clip-text text-4xl font-black text-transparent tracking-tighter">
                {formatCurrencySync(totalEarnings)}
              </p>
            </div>

            <div className="space-y-4">
              <div
                className={`group/metric rounded-3xl p-5 transition-all duration-300 ${
                  isDark ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]" : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2">Growth</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-emerald-500 tracking-tight">
                    +67%
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20 group-hover/metric:scale-110 transition-transform">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>

              <div
                className={`group/metric rounded-3xl p-5 transition-all duration-300 ${
                  isDark ? "bg-white/[0.03] border border-white/5 hover:bg-white/[0.06]" : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Target</p>
                  <span className={`text-xs font-black ${isDark ? "text-white/60" : "text-gray-900"}`}>82%</span>
                </div>
                <div className={`h-2 w-full overflow-hidden rounded-full ${isDark ? "bg-white/5 shadow-inner" : "bg-gray-200 shadow-inner"}`}>
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    style={{ width: "82%" }}
                  />
                </div>
                <p className="mt-3 text-[10px] font-black uppercase tracking-widest text-emerald-500/60">
                  On Track for Milestone
                </p>
              </div>
            </div>
          </div>

          {/* Real Daily Earnings Chart */}
          <div className="h-64 min-h-[320px] md:col-span-3 md:h-full relative">
            <div className={`absolute inset-0 rounded-[2rem] ${isDark ? "bg-white/[0.02]" : "bg-gray-50/50"} border border-dashed border-white/5`} />
            <div className="relative h-full">
              <DailyEarningsChart
                data={dailyEarnings}
                isLoading={isLoading}
                period={period}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningOverviewChart;
