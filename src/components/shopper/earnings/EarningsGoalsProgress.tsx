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
    <div className={`relative overflow-hidden rounded-[2.5rem] border p-8 transition-all duration-300 ${isDark ? "bg-white/5 border-white/10" : "bg-white border-black/5 shadow-sm"}`}>
      <div className="mb-8">
        <h3 className="text-xl font-black tracking-tight">Milestones</h3>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Earnings Goals</p>
      </div>

      <div className="space-y-8">
        {goalPeriods.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = Math.min(goal.data.percentage, 100);
          const isComplete = percentage >= 100;

          return (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? `bg-${goal.accent}-500/10 text-${goal.accent}-400` : `bg-${goal.accent}-50 text-${goal.accent}-600`}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{goal.label}</span>
                </div>
                {isComplete && (
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                    Achieved
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between -mb-1">
                <p className="text-2xl font-black tracking-tight">{formatCurrencySync(goal.data.current)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
                  Target: {formatCurrencySync(goal.data.target)}
                </p>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.3)] 
                    ${goal.accent === 'blue' ? 'bg-blue-500' : goal.accent === 'emerald' ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em]">
                <span className="opacity-40">{Math.round(percentage)}% Track</span>
                {!isComplete && (
                  <span className="opacity-60 text-emerald-500">
                    {formatCurrencySync(goal.data.target - goal.data.current)} Balance
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
