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
    },
    {
      label: "On-Time Delivery",
      value: onTimeDelivery,
      max: 100,
      displayValue: `${onTimeDelivery}%`,
      percentage: onTimeDelivery,
    },
    {
      label: "Order Accuracy",
      value: orderAccuracy,
      max: 100,
      displayValue: `${orderAccuracy}%`,
      percentage: orderAccuracy,
    },
    {
      label: "Acceptance Rate",
      value: acceptanceRate,
      max: 100,
      displayValue: `${acceptanceRate}%`,
      percentage: acceptanceRate,
    },
  ];

  return (
    <div
      className={`rounded-xl p-4 shadow-lg sm:rounded-2xl sm:p-6 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 flex items-center justify-between sm:mb-6">
        <h3 className="text-base font-bold sm:text-lg">Performance</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {metrics.map((metric, index) => (
            <div key={index}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="opacity-60">{metric.label}</span>
                <span className="font-bold">{metric.displayValue}</span>
              </div>
              <div
                className={`h-2 rounded-full ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              >
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${metric.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceMetricsCard;
