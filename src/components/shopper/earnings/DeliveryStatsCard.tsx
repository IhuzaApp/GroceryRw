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
      unit: "KM",
      icon: Navigation,
      accent: "blue",
      description: "Lifetime coverage",
    },
    {
      label: "Items Shared",
      value: stats.totalItems.toString(),
      unit: "PCS",
      icon: Package,
      accent: "emerald",
      description: "Unit throughput",
    },
    {
      label: "Execution Avg",
      value: `${stats.avgTimePerOrder}`,
      unit: "MIN",
      icon: Clock,
      accent: "amber",
      description: "Speed efficiency",
    },
    {
      label: "Nexus Points",
      value: stats.storesVisited.toString(),
      unit: "LOC",
      icon: MapPin,
      accent: "purple",
      description: "Network density",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          Syncing Logistics...
        </p>
      </div>
    );
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-[3rem] p-8 transition-all duration-500 ${
        isDark
          ? "border border-white/5 bg-gray-900/40 shadow-2xl shadow-black/20 backdrop-blur-2xl"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      <div className="relative z-10">
        <div className="mb-10 flex items-center justify-between border-b border-white/5 pb-6 dark:border-white/5">
          <div>
            <h3
              className={`text-2xl font-black tracking-tight ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Logistics DNA
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Operational Footprint Archive
            </p>
          </div>
          <div
            className={`rounded-2xl p-2.5 ${
              isDark ? "bg-white/5" : "bg-gray-50"
            }`}
          >
            <svg
              className={`h-6 w-6 ${
                isDark ? "text-white/40" : "text-gray-400"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {deliveryMetrics.map((metric, index) => {
            const Icon = metric.icon;

            const accentStyles = {
              blue: isDark
                ? "bg-blue-500/10 text-blue-400 ring-blue-500/20 glow-blue"
                : "bg-blue-50 text-blue-600 ring-blue-100",
              emerald: isDark
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 glow-emerald"
                : "bg-emerald-50 text-emerald-600 ring-emerald-100",
              amber: isDark
                ? "bg-amber-500/10 text-amber-400 ring-amber-500/20 glow-amber"
                : "bg-amber-50 text-amber-600 ring-amber-100",
              purple: isDark
                ? "bg-purple-500/10 text-purple-400 ring-purple-500/20 glow-purple"
                : "bg-purple-50 text-purple-600 ring-purple-100",
            }[metric.accent as "blue" | "emerald" | "amber" | "purple"];

            return (
              <div
                key={index}
                className={`group/item relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500 ${
                  isDark
                    ? "border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                    : "border border-gray-50 bg-gray-50/50 hover:bg-gray-100/50"
                }`}
              >
                <div className="mb-6">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-[1.25rem] ring-1 transition-transform group-hover/item:-rotate-6 ${accentStyles}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <p
                      className={`text-3xl font-black tracking-tighter ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {metric.value}
                    </p>
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${
                        isDark ? "text-white/20" : "text-gray-400"
                      }`}
                    >
                      {metric.unit}
                    </span>
                  </div>
                  <p
                    className={`mt-2 text-[9px] font-black uppercase tracking-[0.2em] ${
                      isDark ? "text-white/40" : "text-gray-500"
                    }`}
                  >
                    {metric.label}
                  </p>
                </div>

                {/* Subtle Decorative Flow */}
                <div
                  className={`absolute -bottom-4 -right-4 h-16 w-16 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover/item:opacity-20 ${
                    metric.accent === "blue"
                      ? "bg-blue-500"
                      : metric.accent === "emerald"
                      ? "bg-emerald-500"
                      : metric.accent === "amber"
                      ? "bg-amber-500"
                      : "bg-purple-500"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative Glow Elements */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />
    </div>
  );
};

export default DeliveryStatsCard;
