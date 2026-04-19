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
  const isDark = theme === "dark";

  const goalPeriods = [
    {
      label: "Weekly Sprint",
      data: goals.weekly,
      icon: Calendar,
      accent: "blue",
    },
    {
      label: "Monthly Quest",
      data: goals.monthly,
      icon: Target,
      accent: "emerald",
    },
    {
      label: "Quarterly Nexus",
      data: goals.quarterly,
      icon: TrendingUp,
      accent: "indigo",
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
    <div
      className={`relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 ${
        isDark
          ? "border-white/10 bg-white/5"
          : "border-black/5 bg-white shadow-sm"
      }`}
    >
      <div className="mb-8">
        <h3 className="text-xl font-black tracking-tight">Milestones</h3>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
          Earnings Goals
        </p>
      </div>

      <div className="space-y-8">
        {goalPeriods.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = Math.min(goal.data.percentage, 100);
          const isComplete = percentage >= 100;

          // Map accents to static classes to ensure Tailwind JIT inclusion
          const accentConfig =
            {
              blue: isDark
                ? "bg-blue-500/10 text-blue-400 bar-blue-500"
                : "bg-blue-50 text-blue-600 bar-blue-500",
              emerald: isDark
                ? "bg-emerald-500/10 text-emerald-400 bar-emerald-500"
                : "bg-emerald-50 text-emerald-600 bar-emerald-500",
              indigo: isDark
                ? "bg-indigo-500/10 text-indigo-400 bar-indigo-500"
                : "bg-indigo-50 text-indigo-600 bar-indigo-500",
            }[goal.accent as "blue" | "emerald" | "indigo"] ||
            (isDark
              ? "bg-gray-500/10 text-gray-400 bar-gray-500"
              : "bg-gray-50 text-gray-600 bar-gray-500");

          const barColor = accentConfig.includes("bar-blue-500")
            ? "bg-blue-500"
            : accentConfig.includes("bar-emerald-500")
            ? "bg-emerald-500"
            : "bg-indigo-500";

          return (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      accentConfig.split(" bar-")[0]
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                    {goal.label}
                  </span>
                </div>
                {isComplete && (
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                    Achieved
                  </span>
                )}
              </div>

              <div className="-mb-1 flex items-baseline justify-between">
                <p className="text-2xl font-black tracking-tight">
                  {formatCurrencySync(goal.data.current)}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
                  Target: {formatCurrencySync(goal.data.target)}
                </p>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                <div
                  className={`h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out ${barColor}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
                <span className="opacity-40">
                  {Math.round(percentage)}% Track
                </span>
                {!isComplete && (
                  <span className="text-emerald-500 opacity-60">
                    {formatCurrencySync(goal.data.target - goal.data.current)}{" "}
                    Balance
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EarningsGoalsProgress;
