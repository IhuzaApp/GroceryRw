import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Lightbulb, TrendingUp, Clock, Star, Zap, MapPin } from "lucide-react";

interface PerformanceMetrics {
  customerRating: number;
  onTimeDelivery: number;
  orderAccuracy: number;
  acceptanceRate: number;
}

interface EarningsTipsCardProps {
  performance?: PerformanceMetrics;
  completedOrders?: number;
}

const EarningsTipsCard: React.FC<EarningsTipsCardProps> = ({
  performance,
  completedOrders = 0,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const generateTips = () => {
    const tips = [];
    tips.push({
      icon: Zap,
      title: "Fast Lane",
      description: "Quick acceptance boosts your priority score",
      color: "text-amber-500",
      accent: "amber",
    });

    tips.push({
      icon: MapPin,
      title: "Prime Cycles",
      description: "Demand peaks: 12-2pm & 6-8pm",
      color: "text-blue-500",
      accent: "blue",
    });

    if (performance) {
      if (performance.customerRating < 4.5) {
        tips.push({
          icon: Star,
          title: "Rating Boost",
          description: "Friendly service yields 5-star reviews",
          color: "text-orange-500",
          accent: "orange",
        });
      }

      if (performance.onTimeDelivery < 90) {
        tips.push({
          icon: Clock,
          title: "Time Sync",
          description: "Optimized routes save fuel and time",
          color: "text-rose-500",
          accent: "rose",
        });
      }
    }

    if (completedOrders < 10) {
      tips.push({
        icon: Lightbulb,
        title: "Growth Phase",
        description: "Complete 10 orders to unlock elite batches",
        color: "text-indigo-500",
        accent: "indigo",
      });
    }

    return tips.slice(0, 4);
  };

  const tips = generateTips();

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 ${
        isDark
          ? "border-white/10 bg-white/5"
          : "border-black/5 bg-white shadow-sm"
      }`}
    >
      <div className="mb-8 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500`}
        >
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight">Growth OS</h3>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Earnings Strategies
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => {
          const Icon = tip.icon;

          // Map accents to static classes to ensure Tailwind JIT inclusion
          const accentConfig =
            {
              amber: isDark
                ? "bg-amber-500/10 text-amber-500"
                : "bg-amber-50 text-amber-600",
              blue: isDark
                ? "bg-blue-500/10 text-blue-500"
                : "bg-blue-50 text-blue-600",
              orange: isDark
                ? "bg-orange-500/10 text-orange-500"
                : "bg-orange-50 text-orange-600",
              rose: isDark
                ? "bg-rose-500/10 text-rose-500"
                : "bg-rose-50 text-rose-600",
              indigo: isDark
                ? "bg-indigo-500/10 text-indigo-500"
                : "bg-indigo-50 text-indigo-600",
            }[tip.accent as "amber" | "blue" | "orange" | "rose" | "indigo"] ||
            (isDark
              ? "bg-gray-500/10 text-gray-400"
              : "bg-gray-50 text-gray-600");

          return (
            <div
              key={index}
              className={`group flex items-center gap-4 rounded-3xl border p-4 transition-all duration-500 ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-transparent bg-black/5 hover:bg-black/[0.08]"
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${accentConfig}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-[13px] font-black tracking-tight">
                  {tip.title}
                </h4>
                <p className="truncate text-[10px] font-bold uppercase tracking-widest opacity-40">
                  {tip.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Milestone Banner */}
      <div className="mt-6 rounded-3xl border-2 border-dashed border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <p className="text-[10px] font-black uppercase leading-relaxed tracking-widest text-emerald-500/60">
          💡 Nexus Tip: Premium service unlocks{" "}
          <span className="text-emerald-500">Elite Multipliers</span> & Priority
          Access!
        </p>
      </div>
    </div>
  );
};

export default EarningsTipsCard;
