import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { Loader } from "rsuite";
import { Calendar, Clock } from "lucide-react";

interface ActivitySummary {
  busiestDay: string;
  busiestDayCount: number;
  busiestHour: string;
  busiestHourCount: number;
  totalOrders: number;
}

interface BusiestTimesCardProps {
  activitySummary: ActivitySummary | null;
  isLoading?: boolean;
}

const BusiestTimesCard: React.FC<BusiestTimesCardProps> = ({
  activitySummary,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark
          ? "border border-white/10 bg-white/5"
          : "border border-black/5 bg-white shadow-xl"
      }`}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/5 opacity-50 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Active Hours</h3>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest opacity-40">
              Peak Activity
            </p>
          </div>
          <button
            className={`${
              isDark
                ? "text-white/20 hover:text-white/60"
                : "text-black/20 hover:text-black/60"
            } transition-colors`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : activitySummary ? (
          <div className="space-y-4">
            {/* Busiest Day */}
            <div
              className={`group/item relative overflow-hidden rounded-3xl p-5 transition-all duration-300 ${
                isDark
                  ? "border border-white/5 bg-white/5"
                  : "border border-emerald-100 bg-emerald-50/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Top Peak Day
                  </p>
                  <p className="text-xl font-black tracking-tight text-emerald-500">
                    {activitySummary.busiestDay}
                  </p>
                  <p className="text-xs font-bold opacity-40">
                    {activitySummary.busiestDayCount} orders (
                    {Math.round(
                      (activitySummary.busiestDayCount /
                        activitySummary.totalOrders) *
                        100
                    )}
                    %)
                  </p>
                </div>
              </div>
            </div>

            {/* Busiest Hour */}
            <div
              className={`group/item relative overflow-hidden rounded-3xl p-5 transition-all duration-300 ${
                isDark
                  ? "border border-white/5 bg-white/5"
                  : "border border-blue-100 bg-blue-50/50"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Peak Hour
                  </p>
                  <p className="text-xl font-black tracking-tight text-blue-500">
                    {activitySummary.busiestHour}
                  </p>
                  <p className="text-xs font-bold opacity-40">
                    {activitySummary.busiestHourCount} orders (
                    {Math.round(
                      (activitySummary.busiestHourCount /
                        activitySummary.totalOrders) *
                        100
                    )}
                    %)
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-sm font-bold uppercase tracking-widest opacity-60">
            <p>Gathering Insights...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusiestTimesCard;
