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

  // Generate personalized tips based on performance
  const generateTips = () => {
    const tips = [];

    // Always show general tips
    tips.push({
      icon: Zap,
      title: "Accept Orders Quickly",
      description: "Fast acceptance increases your priority for future orders",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    });

    tips.push({
      icon: MapPin,
      title: "Work During Peak Hours",
      description: "Lunch (12-2pm) and dinner (6-8pm) have higher demand",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    });

    // Add performance-based tips
    if (performance) {
      if (performance.customerRating < 4.5) {
        tips.push({
          icon: Star,
          title: "Improve Customer Rating",
          description:
            "Be friendly, communicate updates, and handle items carefully",
          color: "text-purple-500",
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
        });
      }

      if (performance.onTimeDelivery < 90) {
        tips.push({
          icon: Clock,
          title: "Boost On-Time Delivery",
          description: "Plan routes efficiently and start deliveries promptly",
          color: "text-orange-500",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
        });
      }

      if (performance.acceptanceRate < 80) {
        tips.push({
          icon: TrendingUp,
          title: "Increase Acceptance Rate",
          description: "Higher acceptance rate = more order opportunities",
          color: "text-green-500",
          bgColor: "bg-green-50 dark:bg-green-900/20",
        });
      }
    }

    // Show different tip if they're new
    if (completedOrders < 10) {
      tips.push({
        icon: Lightbulb,
        title: "Complete Your First 10 Orders",
        description: "Build your reputation to unlock better order assignments",
        color: "text-indigo-500",
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      });
    }

    // Return max 4 tips
    return tips.slice(0, 4);
  };

  const tips = generateTips();

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-yellow-500" />
        <h3 className="text-lg font-bold">Tips to Boost Earnings</h3>
      </div>

      <div className="space-y-3">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className={`rounded-xl p-4 transition-all hover:scale-[1.02] ${tip.bgColor} border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg bg-white p-2 dark:bg-gray-800`}>
                  <Icon className={`h-4 w-4 ${tip.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                    {tip.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tip.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional tip at the bottom */}
      <div className="mt-4 rounded-lg border-2 border-dashed border-green-300 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
        <p className="text-center text-sm font-medium text-green-700 dark:text-green-400">
          💡 Pro Tip: Maintain excellent service to earn bonuses and tips!
        </p>
      </div>
    </div>
  );
};

export default EarningsTipsCard;
