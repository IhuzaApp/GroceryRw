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
    <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
      <div className="mb-8 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20`}>
          <Lightbulb className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-black tracking-tight">Growth OS</h3>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Earnings Strategies</p>
        </div>
      </div>

      <div className="space-y-4">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className={`group flex items-center gap-4 rounded-3xl p-4 border transition-all duration-500 ${
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-black/5 border-transparent hover:bg-black/[0.08]"
              }`}
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                isDark ? `bg-${tip.accent}-500/10 ${tip.color}` : `bg-${tip.accent}-50 ${tip.color}`
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[13px] font-black tracking-tight truncate">{tip.title}</h4>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest truncate">{tip.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pro Milestone Banner */}
      <div className="mt-6 rounded-3xl border-2 border-dashed border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 leading-relaxed">
          💡 Nexus Tip: Premium service unlocks <span className="text-emerald-500">Elite Multipliers</span> & Priority Access!
        </p>
      </div>
    </div>
  );
};

export default EarningsTipsCard;
