import React from "react";
import { Panel } from "rsuite";

interface Metric {
  metric: string;
  value: number;
  max?: number;
  percentage: number;
}

interface DeliveryStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
}

interface PerformanceMetricsProps {
  metrics: Metric[] | null;
  deliveryStats: DeliveryStat[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  deliveryStats,
}) => {
  // Format rating with stars
  const formatRating = (metric: Metric) => {
    if (metric.metric === "Customer Rating") {
      return (
        <div className="flex items-center">
          <span className="mr-1">{metric.value}</span>
          <span className="text-yellow-500">/5</span>
          <div className="ml-2 flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                viewBox="0 0 24 24"
                fill={i < Math.floor(metric.value) ? "currentColor" : "none"}
                strokeWidth={i < Math.floor(metric.value) ? "0" : "1.5"}
                stroke="currentColor"
                className={`h-4 w-4 ${
                  i < Math.floor(metric.value)
                    ? "text-yellow-500"
                    : "text-gray-300"
                }`}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                />
              </svg>
            ))}
          </div>
        </div>
      );
    }

    if (metric.max) {
      return (
        <span>
          {metric.value}
          <span className="text-gray-500">/{metric.max}</span>
        </span>
      );
    }

    return metric.value;
  };

  return (
    <Panel shaded bordered bodyFill className="p-4">
      <h3 className="mb-4 text-lg font-semibold">Performance Metrics</h3>
      
      {!metrics ? (
        <div className="py-8 text-center">
          <div className="mb-4 text-red-500">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h4 className="mb-2 text-lg font-semibold text-gray-900">Something went wrong</h4>
          <p className="mb-4 text-gray-600">We couldn't load your performance metrics.</p>
          <p className="text-sm text-gray-500">Please try again after 1 hour or contact support if the issue persists.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {metrics.map((item, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{item.metric}</span>
                <span className="text-sm">{formatRating(item)}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${
                    item.percentage >= 90
                      ? "bg-green-500"
                      : item.percentage >= 70
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <h3 className="mb-3 font-medium">Delivery Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          {deliveryStats.map((stat, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="text-sm text-gray-500">{stat.title}</div>
              <div className="flex items-center text-xl font-bold">
                <span className={`mr-1 ${stat.iconColor}`}>{stat.icon}</span>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};

export default PerformanceMetrics;
