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
      description: "Short-term liquidity focus",
    },
    {
      label: "Monthly Quest",
      data: goals.monthly,
      icon: Target,
      accent: "emerald",
      description: "Core performance objective",
    },
    {
      label: "Quarterly Nexus",
      data: goals.quarterly,
      icon: TrendingUp,
      accent: "purple",
      description: "Macro-scale wealth building",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
          Calculating Milestones...
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
      {/* Background Decorative Glow */}
      <div
        className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
          isDark
            ? "bg-emerald-500/10 group-hover:bg-emerald-500/20"
            : "bg-emerald-500/5 group-hover:bg-emerald-500/10"
        }`}
      />

      <div className="relative z-10">
        <div className="mb-10 border-b border-white/5 pb-6 dark:border-white/5">
          <h3
            className={`text-2xl font-black tracking-tight ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Success Milestones
          </h3>
          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
            Performance & Earnings Objectives
          </p>
        </div>

        <div className="space-y-12">
          {goalPeriods.map((goal, index) => {
            const Icon = goal.icon;
            const percentage = Math.min(goal.data.percentage, 100);
            const isComplete = percentage >= 100;

            const colorMap: Record<string, string> = {
              blue: "from-blue-400 to-indigo-500 shadow-blue-500/20",
              emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
              purple: "from-purple-400 to-pink-500 shadow-purple-500/20",
            };

            const iconBgMap: Record<string, string> = {
              blue: isDark
                ? "bg-blue-500/10 ring-blue-500/20"
                : "bg-blue-50 ring-blue-100",
              emerald: isDark
                ? "bg-emerald-500/10 ring-emerald-500/20"
                : "bg-emerald-50 ring-emerald-100",
              purple: isDark
                ? "bg-purple-500/10 ring-purple-500/20"
                : "bg-purple-50 ring-purple-100",
            };

            const textColorMap: Record<string, string> = {
              blue: "text-blue-500",
              emerald: "text-emerald-500",
              purple: "text-purple-500",
            };

            return (
              <div key={index} className="group/item space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-[1.25rem] ring-1 transition-transform group-hover/item:rotate-6 ${
                        iconBgMap[goal.accent]
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${textColorMap[goal.accent]}`}
                      />
                    </div>
                    <div>
                      <span
                        className={`text-sm font-black tracking-tight ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {goal.label}
                      </span>
                      <p
                        className={`text-[10px] font-black uppercase tracking-widest ${
                          isDark ? "text-white/20" : "text-gray-400"
                        }`}
                      >
                        {goal.description}
                      </p>
                    </div>
                  </div>
                  {isComplete ? (
                    <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      Achieved
                    </div>
                  ) : (
                    <div
                      className={`text-right ${
                        isDark ? "text-white/40" : "text-gray-500"
                      }`}
                    >
                      <span className="text-xs font-black tabular-nums">
                        {Math.round(percentage)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <p
                      className={`text-3xl font-black tracking-tighter ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {formatCurrencySync(goal.data.current)}
                    </p>
                    <p
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                        isDark ? "text-white/20" : "text-gray-400"
                      }`}
                    >
                      Target: {formatCurrencySync(goal.data.target)}
                    </p>
                  </div>

                  <div
                    className={`h-3 w-full overflow-hidden rounded-full p-0.5 ${
                      isDark
                        ? "bg-white/5 shadow-inner"
                        : "bg-gray-100 shadow-inner"
                    }`}
                  >
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                        colorMap[goal.accent]
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.25em]">
                    <span className="opacity-40">Progress Status</span>
                    {!isComplete && (
                      <span className="text-emerald-500">
                        {formatCurrencySync(
                          goal.data.target - goal.data.current
                        )}{" "}
                        To Target
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EarningsGoalsProgress;
