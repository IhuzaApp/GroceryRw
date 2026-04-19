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
    },
    {
      label: "On-Time Delivery",
      value: performance.onTimeDelivery,
      icon: Clock,
      color: "text-blue-500",
      accent: "blue",
      max: 100,
      suffix: "%",
    },
    {
      label: "Order Accuracy",
      value: performance.orderAccuracy,
      icon: CheckCircle,
      color: "text-emerald-500",
      accent: "emerald",
      max: 100,
      suffix: "%",
    },
    {
      label: "Acceptance Rate",
      value: performance.acceptanceRate,
      icon: TrendingUp,
      color: "text-indigo-500",
      accent: "indigo",
      max: 100,
      suffix: "%",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black tracking-tight">System Pulse</h3>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Performance Insights</p>
        </div>
        {performance.performanceScore && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-2 border border-emerald-500/20">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Score</span>
            <span className="text-sm font-black text-emerald-500">{performance.performanceScore}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const percentage = metric.max === 5 ? (metric.value / metric.max) * 100 : metric.value;
          
          // Map accents to static classes to ensure Tailwind JIT inclusion
          const accentConfig = {
            amber: isDark ? "bg-amber-500/10 text-amber-500" : "bg-amber-50 text-amber-600",
            blue: isDark ? "bg-blue-500/10 text-blue-500" : "bg-blue-50 text-blue-600",
            emerald: isDark ? "bg-emerald-500/10 text-emerald-500" : "bg-emerald-50 text-emerald-600",
            indigo: isDark ? "bg-indigo-500/10 text-indigo-500" : "bg-indigo-50 text-indigo-600"
          }[metric.accent as 'amber' | 'blue' | 'emerald' | 'indigo'] || (isDark ? "bg-gray-500/10 text-gray-400" : "bg-gray-50 text-gray-600");

          return (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${accentConfig}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest opacity-40">{metric.label}</h4>
                    <p className="text-lg font-black tracking-tight">
                      {metric.value.toFixed(metric.max === 5 ? 1 : 0)}
                      <span className="text-xs opacity-50 ml-0.5">{metric.suffix}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)] ${
                    percentage >= 85 ? "bg-emerald-500" : percentage >= 70 ? "bg-amber-500" : "bg-rose-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Background Decor */}
      <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />
    </div>
  );
};

export default PerformanceInsights;
