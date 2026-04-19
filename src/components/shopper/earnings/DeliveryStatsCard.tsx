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
  const isDark = theme === "dark";

  const deliveryMetrics = [
    {
      label: "Pulse Distance",
      value: `${stats.totalKilometers.toFixed(1)}`,
      unit: "km",
      icon: Navigation,
      color: "text-blue-500",
      accent: "blue",
    },
    {
      label: "Items Shared",
      value: stats.totalItems.toString(),
      unit: "",
      icon: Package,
      color: "text-emerald-500",
      accent: "emerald",
    },
    {
      label: "Execution Avg",
      value: `${stats.avgTimePerOrder}`,
      unit: "min",
      icon: Clock,
      color: "text-orange-500",
      accent: "orange",
    },
    {
      label: "Nexus Points",
      value: stats.storesVisited.toString(),
      unit: "",
      icon: MapPin,
      color: "text-purple-500",
      accent: "purple",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
      <div className="mb-8">
        <h3 className="text-xl font-black tracking-tight">Logistics DNA</h3>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Delivery Stats</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-left">
        {deliveryMetrics.map((metric, index) => {
          const Icon = metric.icon;

          // Map accents to static classes to ensure Tailwind JIT inclusion
          const accentConfig = {
            blue: isDark ? "bg-blue-500/10 text-blue-500 shadow-blue-500" : "bg-blue-50 text-blue-600 shadow-blue-500",
            emerald: isDark ? "bg-emerald-500/10 text-emerald-500 shadow-emerald-500" : "bg-emerald-50 text-emerald-600 shadow-emerald-500",
            orange: isDark ? "bg-orange-500/10 text-orange-500 shadow-orange-500" : "bg-orange-50 text-orange-600 shadow-orange-500",
            purple: isDark ? "bg-purple-500/10 text-purple-500 shadow-purple-500" : "bg-purple-50 text-purple-600 shadow-purple-500"
          }[metric.accent as 'blue' | 'emerald' | 'orange' | 'purple'] || (isDark ? "bg-gray-500/10 text-gray-400 shadow-gray-400" : "bg-gray-50 text-gray-600 shadow-gray-400");

          return (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-3xl p-5 border transition-all duration-500 ${
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-transparent hover:bg-black/[0.08]"
              }`}
            >
              <div className="mb-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${accentConfig.split(' shadow-')[0]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black tracking-tight">
                  {metric.value}
                  <span className="text-xs font-bold opacity-40 ml-1">{metric.unit}</span>
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                  {metric.label}
                </p>
              </div>

              {/* Individual Glow Decor */}
              <div className={`absolute -right-4 -bottom-4 h-16 w-16 rounded-full blur-[30px] opacity-10 transition-all duration-500 group-hover:opacity-20 ${accentConfig.split('shadow-')[1] === 'blue-500' ? 'bg-blue-500' : accentConfig.split('shadow-')[1] === 'emerald-500' ? 'bg-emerald-500' : accentConfig.split('shadow-')[1] === 'orange-500' ? 'bg-orange-500' : 'bg-purple-500'}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DeliveryStatsCard;
