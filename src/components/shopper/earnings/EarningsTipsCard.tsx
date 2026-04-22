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
      accent: "amber",
    });

    tips.push({
      icon: MapPin,
      title: "Prime Cycles",
      description: "Demand peaks: 12-2pm & 6-8pm",
      accent: "blue",
    });

    if (performance) {
      if (performance.customerRating < 4.5) {
        tips.push({
          icon: Star,
          title: "Rating Boost",
          description: "Friendly service yields 5-star reviews",
          accent: "orange",
        });
      }

      if (performance.onTimeDelivery < 90) {
        tips.push({
          icon: Clock,
          title: "Time Sync",
          description: "Optimized routes save fuel and time",
          accent: "rose",
        });
      }
    }

    if (completedOrders < 10) {
      tips.push({
        icon: Lightbulb,
        title: "Growth Phase",
        description: "Complete 10 orders to unlock elite batches",
        accent: "indigo",
      });
    }

    return tips.slice(0, 4);
  };

  const tips = generateTips();

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
          <div className="flex items-center gap-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ring-1 ${
                isDark
                  ? "bg-amber-500/10 text-amber-500 ring-amber-500/20"
                  : "bg-amber-50 text-amber-600 ring-amber-100"
              }`}
            >
              <Lightbulb className="h-6 w-6" />
            </div>
            <div>
              <h3
                className={`text-2xl font-black tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Growth OS
              </h3>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/60">
                Strategy & Intelligence
              </p>
            </div>
          </div>
          <div
            className={`rounded-xl p-2.5 ${
              isDark ? "bg-white/5" : "bg-gray-50"
            }`}
          >
            <TrendingUp
              className={`h-5 w-5 ${
                isDark ? "text-white/20" : "text-gray-400"
              }`}
            />
          </div>
        </div>

        <div className="space-y-4">
          {tips.map((tip, index) => {
            const Icon = tip.icon;

            const accentStyles = {
              amber: isDark
                ? "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                : "bg-amber-50 text-amber-600 ring-amber-100",
              blue: isDark
                ? "bg-blue-500/10 text-blue-400 ring-blue-500/20"
                : "bg-blue-50 text-blue-600 ring-blue-100",
              orange: isDark
                ? "bg-orange-500/10 text-orange-400 ring-orange-500/20"
                : "bg-orange-50 text-orange-600 ring-orange-100",
              rose: isDark
                ? "bg-rose-500/10 text-rose-400 ring-rose-500/20"
                : "bg-rose-50 text-rose-600 ring-rose-100",
              indigo: isDark
                ? "bg-indigo-500/10 text-indigo-400 ring-indigo-500/20"
                : "bg-indigo-50 text-indigo-600 ring-indigo-100",
            }[tip.accent as "amber" | "blue" | "orange" | "rose" | "indigo"];

            return (
              <div
                key={index}
                className={`group/item flex items-center gap-5 rounded-[2rem] p-4 transition-all duration-500 ${
                  isDark
                    ? "border border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                    : "border border-gray-50 bg-gray-50/50 hover:bg-gray-100/50"
                }`}
              >
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ring-1 transition-transform group-hover/item:-rotate-6 ${accentStyles}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-[13px] font-black tracking-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {tip.title}
                  </h4>
                  <p
                    className={`mt-1 text-[9px] font-black uppercase tracking-[0.15em] opacity-40 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {tip.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pro Milestone Banner */}
        <div
          className={`mt-10 overflow-hidden rounded-[2.5rem] border-2 border-dashed p-6 text-center transition-all duration-500 hover:border-emerald-500/40 ${
            isDark
              ? "border-emerald-500/20 bg-emerald-500/5"
              : "border-emerald-500/20 bg-emerald-50/30"
          }`}
        >
          <p className="text-[10px] font-black uppercase leading-relaxed tracking-[0.2em] text-emerald-500/80">
            <span className="mr-2">💡</span> Nexus intelligence: Premium service
            unlocks{" "}
            <span
              className={`mx-1 rounded-lg px-2 py-0.5 font-black text-white ${
                isDark
                  ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-emerald-600"
              }`}
            >
              Elite Multipliers
            </span>{" "}
            & Priority Access!
          </p>
        </div>
      </div>

      {/* Decorative Glow Elements */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-amber-500/5 blur-[100px]" />
    </div>
  );
};

export default EarningsTipsCard;
