import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface PerformanceMetrics {
  customerRating?: number;
  onTimeDelivery?: number;
  orderAccuracy?: number;
  acceptanceRate?: number;
}

interface PerformanceMetricsCardProps {
  performance?: PerformanceMetrics;
  rating?: number;
  isLoading?: boolean;
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  performance,
  rating,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const customerRating = performance?.customerRating || rating || 4.8;
  const onTimeDelivery = performance?.onTimeDelivery || 95;
  const orderAccuracy = performance?.orderAccuracy || 98;
  const acceptanceRate = performance?.acceptanceRate || 92;

  const metrics = [
    {
      label: "Customer Satisfaction",
      value: customerRating,
      max: 5,
      displayValue: `${customerRating.toFixed(1)}/5`,
      percentage: (customerRating / 5) * 100,
      color: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
      accent: "emerald",
    },
    {
      label: "Punctuality Index",
      value: onTimeDelivery,
      max: 100,
      displayValue: `${onTimeDelivery}%`,
      percentage: onTimeDelivery,
      color: "from-blue-400 to-indigo-500 shadow-blue-500/20",
      accent: "blue",
    },
    {
      label: "Order Precision",
      value: orderAccuracy,
      max: 100,
      displayValue: `${orderAccuracy}%`,
      percentage: orderAccuracy,
      color: "from-purple-400 to-pink-500 shadow-purple-500/20",
      accent: "purple",
    },
    {
      label: "Engagement Rate",
      value: acceptanceRate,
      max: 100,
      displayValue: `${acceptanceRate}%`,
      percentage: acceptanceRate,
      color: "from-amber-400 to-orange-500 shadow-amber-500/20",
      accent: "amber",
    },
  ];

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(139,92,246,0.05)] ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      <div className={`absolute -bottom-20 -right-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-purple-500/10" : "bg-purple-500/5"
      }`} />

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6 dark:border-white/5">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Service Quality
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-purple-500/60">
              Operational KPIs & Metrics
            </p>
          </div>
          <div className={`rounded-2xl p-2.5 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <svg className={`h-6 w-6 ${isDark ? "text-white/40" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent shadow-[0_0_15px_rgba(139,92,246,0.3)]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] bg-${metric.accent}-500`} />
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"}`}>
                      {metric.label}
                    </span>
                  </div>
                  <span className={`text-sm font-black tabular-nums tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                    {metric.displayValue}
                  </span>
                </div>
                <div className={`h-2.5 w-full overflow-hidden rounded-full p-0.5 ${isDark ? "bg-white/5 shadow-inner" : "bg-gray-100 shadow-inner"}`}>
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${metric.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMetricsCard;
