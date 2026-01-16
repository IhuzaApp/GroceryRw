import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { Target, TrendingUp, Calendar } from "lucide-react";

interface GoalProgress {
  current: number;
  target: number;
  percentage: number;
}

interface EarningsGoals {
  weekly: GoalProgress;
  monthly: GoalProgress;
  quarterly: GoalProgress;
}

interface EarningsGoalsProgressProps {
  goals: EarningsGoals;
  isLoading?: boolean;
}

const EarningsGoalsProgress: React.FC<EarningsGoalsProgressProps> = ({
  goals,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const goalPeriods = [
    {
      label: "Weekly Goal",
      data: goals.weekly,
      icon: Calendar,
      color: "text-blue-500",
      barColor: "bg-blue-500",
    },
    {
      label: "Monthly Goal",
      data: goals.monthly,
      icon: Target,
      color: "text-green-500",
      barColor: "bg-green-500",
    },
    {
      label: "Quarterly Goal",
      data: goals.quarterly,
      icon: TrendingUp,
      color: "text-purple-500",
      barColor: "bg-purple-500",
    },
  ];

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <h3 className="mb-4 text-lg font-bold">Earnings Goals</h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {goalPeriods.map((goal, index) => {
            const Icon = goal.icon;
            const percentage = Math.min(goal.data.percentage, 100);
            const isComplete = percentage >= 100;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${goal.color}`} />
                    <span className="text-sm font-medium">{goal.label}</span>
                  </div>
                  {isComplete && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      Completed
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold">
                    {formatCurrencySync(goal.data.current)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    of {formatCurrencySync(goal.data.target)}
                  </span>
                </div>

                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${goal.barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">
                    {percentage.toFixed(0)}% complete
                  </span>
                  {!isComplete && (
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrencySync(goal.data.target - goal.data.current)}{" "}
                      to go
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EarningsGoalsProgress;
