import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Navigation, Package, Clock, MapPin } from "lucide-react";

interface DeliveryStats {
  totalKilometers: number;
  totalItems: number;
  avgTimePerOrder: number;
  storesVisited: number;
}

interface DeliveryStatsCardProps {
  stats: DeliveryStats;
  isLoading?: boolean;
}

const DeliveryStatsCard: React.FC<DeliveryStatsCardProps> = ({
  stats,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const deliveryMetrics = [
    {
      label: "Total Distance",
      value: `${stats.totalKilometers.toFixed(1)} km`,
      icon: Navigation,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Items Delivered",
      value: stats.totalItems.toString(),
      icon: Package,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Avg. Time/Order",
      value: `${stats.avgTimePerOrder} min`,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      label: "Stores Visited",
      value: stats.storesVisited.toString(),
      icon: MapPin,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h3 className="mb-4 text-lg font-bold">Delivery Stats</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {deliveryMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className={`rounded-xl p-4 ${metric.bgColor} border border-gray-200 dark:border-gray-700`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveryStatsCard;
