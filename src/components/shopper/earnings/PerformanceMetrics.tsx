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
  metrics: Metric[];
  deliveryStats: DeliveryStat[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  metrics,
  deliveryStats,
}) => {
  return (
    <Panel shaded bordered bodyFill className="p-4">
      <div className="space-y-6">
        {metrics.map((item, index) => (
          <div key={index}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">{item.metric}</span>
              <span className="text-sm">
                {item.value}
                {item.max ? `/${item.max}` : ""}
              </span>
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

      <div className="mt-8 border-t pt-4">
        <h3 className="mb-3 font-medium">Delivery Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          {deliveryStats.map((stat, index) => (
            <div key={index} className="rounded-lg bg-gray-50 p-3">
              <div className="text-sm text-gray-500">{stat.title}</div>
              <div className="flex items-center text-xl font-bold">
                <span className={`h-4 w-4 ${stat.iconColor} mr-1`}>
                  {stat.icon}
                </span>
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
