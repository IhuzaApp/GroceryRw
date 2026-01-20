import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { TrendingUp, Star, CheckCircle, Clock } from "lucide-react";

interface PerformanceMetrics {
  customerRating: number;
  onTimeDelivery: number;
  orderAccuracy: number;
  acceptanceRate: number;
  performanceScore?: number;
}

interface PerformanceInsightsProps {
  performance: PerformanceMetrics;
  isLoading?: boolean;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({
  performance,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const metrics = [
    {
      label: "Customer Rating",
      value: performance.customerRating,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      max: 5,
      suffix: "/5",
    },
    {
      label: "On-Time Delivery",
      value: performance.onTimeDelivery,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      max: 100,
      suffix: "%",
    },
    {
      label: "Order Accuracy",
      value: performance.orderAccuracy,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      max: 100,
      suffix: "%",
    },
    {
      label: "Acceptance Rate",
      value: performance.acceptanceRate,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      max: 100,
      suffix: "%",
    },
  ];

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Performance Insights</h3>
        {performance.performanceScore && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
            Score: {performance.performanceScore}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const percentage =
              metric.max === 5
                ? (metric.value / metric.max) * 100
                : metric.value;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-lg p-2 ${metric.bgColor}`}>
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                    </div>
                    <span className="text-sm font-medium">{metric.label}</span>
                  </div>
                  <span className="text-sm font-bold">
                    {metric.value.toFixed(metric.max === 5 ? 1 : 0)}
                    {metric.suffix}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80
                        ? "bg-green-500"
                        : percentage >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PerformanceInsights;
