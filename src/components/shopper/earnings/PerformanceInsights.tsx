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
  const isDark = theme === "dark";

  const metrics = [
    {
      label: "Customer Rating",
      value: performance.customerRating,
      icon: Star,
      color: "text-amber-500",
      accent: "amber",
      max: 5,
      suffix: "/5",
      description: "User satisfaction index",
    },
    {
      label: "Dispatch Speed",
      value: performance.onTimeDelivery,
      icon: Clock,
      color: "text-blue-500",
      accent: "blue",
      max: 100,
      suffix: "%",
      description: "Punctuality precision",
    },
    {
      label: "Order Accuracy",
      value: performance.orderAccuracy,
      icon: CheckCircle,
      color: "text-emerald-500",
      accent: "emerald",
      max: 100,
      suffix: "%",
      description: "Error-free fulfillment",
    },
    {
      label: "Acceptance Rate",
      value: performance.acceptanceRate,
      icon: TrendingUp,
      color: "text-indigo-500",
      accent: "indigo",
      max: 100,
      suffix: "%",
      description: "Engagement intensity",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          Syncing System Pulse...
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
              System Pulse
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Real-time Performance Monitoring
            </p>
          </div>
          {performance.performanceScore && (
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">
                Pulse Score
              </span>
              <span className="text-lg font-black tracking-tighter text-emerald-500">
                {performance.performanceScore}
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const percentage =
              metric.max === 5
                ? (metric.value / metric.max) * 100
                : metric.value;

            const accentConfig = {
              amber: isDark
                ? "bg-amber-500/10 text-amber-500 ring-amber-500/20"
                : "bg-amber-50 text-amber-600 ring-amber-100",
              blue: isDark
                ? "bg-blue-500/10 text-blue-500 ring-blue-500/20"
                : "bg-blue-50 text-blue-600 ring-blue-100",
              emerald: isDark
                ? "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20"
                : "bg-emerald-50 text-emerald-600 ring-emerald-100",
              indigo: isDark
                ? "bg-indigo-500/10 text-indigo-500 ring-indigo-500/20"
                : "bg-indigo-50 text-indigo-600 ring-indigo-100",
            }[metric.accent as "amber" | "blue" | "emerald" | "indigo"];

            const barColor =
              percentage >= 85
                ? "from-emerald-400 to-teal-500"
                : percentage >= 70
                ? "from-amber-400 to-orange-500"
                : "from-rose-400 to-red-500";

            return (
              <div
                key={index}
                className="group/item space-y-4 rounded-[2rem] p-4 transition-all hover:bg-gray-50/50 hover:bg-white/[0.02] dark:hover:bg-white/[0.02]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[1.25rem] ring-1 transition-transform group-hover/item:scale-110 ${accentConfig}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h4
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isDark ? "text-white/40" : "text-gray-500"
                        }`}
                      >
                        {metric.label}
                      </h4>
                      <p
                        className={`text-xl font-black tracking-tighter ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {metric.value.toFixed(metric.max === 5 ? 1 : 0)}
                        <span className="ml-1 text-xs font-bold opacity-30">
                          {metric.suffix}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div
                    className={`h-2 w-full overflow-hidden rounded-full p-0.5 ${
                      isDark
                        ? "bg-white/5 shadow-inner"
                        : "bg-gray-100 shadow-inner"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${barColor} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
                    <span>Performance index</span>
                    <span>{metric.description}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/5 blur-[100px]" />
    </div>
  );
};

export default PerformanceInsights;
