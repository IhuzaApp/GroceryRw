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
      label: "Customer Rating",
      value: customerRating,
      max: 5,
      displayValue: `${customerRating.toFixed(1)}/5`,
      percentage: (customerRating / 5) * 100,
      color: "from-emerald-400 to-emerald-600",
    },
    {
      label: "On-Time Delivery",
      value: onTimeDelivery,
      max: 100,
      displayValue: `${onTimeDelivery}%`,
      percentage: onTimeDelivery,
      color: "from-blue-400 to-blue-600",
    },
    {
      label: "Order Accuracy",
      value: orderAccuracy,
      max: 100,
      displayValue: `${orderAccuracy}%`,
      percentage: orderAccuracy,
      color: "from-purple-400 to-purple-600",
    },
    {
      label: "Acceptance Rate",
      value: acceptanceRate,
      max: 100,
      displayValue: `${acceptanceRate}%`,
      percentage: acceptanceRate,
      color: "from-amber-400 to-amber-600",
    },
  ];

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark 
          ? "bg-white/5 border border-white/10" 
          : "bg-white border border-black/5 shadow-xl"
      }`}
    >
      <div className="absolute -right-12 -bottom-12 h-32 w-32 rounded-full bg-purple-500/5 blur-3xl opacity-50" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Performance</h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">Quality Metrics</p>
          </div>
          <button className={`${isDark ? "text-white/20 hover:text-white/60" : "text-black/20 hover:text-black/60"} transition-colors`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-widest opacity-40 whitespace-nowrap">
                    {metric.label}
                  </span>
                  <span className="text-sm font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent dark:from-white dark:to-white/40">
                    {metric.displayValue}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${metric.color} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
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
