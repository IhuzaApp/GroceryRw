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
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.05)] ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-emerald-500/10" : "bg-emerald-500/5"
      }`} />

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Active Hours
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Peak Intensity Analysis
            </p>
          </div>
          <div className={`rounded-2xl p-2.5 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <Clock className={`h-6 w-6 ${isDark ? "text-white/40" : "text-gray-400"}`} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
          </div>
        ) : activitySummary ? (
          <div className="space-y-5">
            {/* Busiest Day */}
            <div
              className={`group/item relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
                  : "bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform duration-500 group-hover/item:-rotate-3 ${
                    isDark
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-white/10"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  <Calendar className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Top Peak Day</p>
                  <p className={`text-2xl font-black tracking-tighter truncate ${isDark ? "text-white" : "text-emerald-600"}`}>
                    {activitySummary.busiestDay}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-black tabular-nums">{activitySummary.busiestDayCount} Orders</span>
                    <span className={`h-1 w-1 rounded-full ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                    <span className="text-xs font-black text-emerald-500">
                      {Math.round((activitySummary.busiestDayCount / activitySummary.totalOrders) * 100)}% Volume
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Busiest Hour */}
            <div
              className={`group/item relative overflow-hidden rounded-[2rem] p-6 transition-all duration-300 ${
                isDark
                  ? "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
                  : "bg-blue-50/50 border border-blue-100 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-inner transition-transform duration-500 group-hover/item:rotate-3 ${
                    isDark
                      ? "bg-blue-500/10 text-blue-400 ring-1 ring-white/10"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  <Clock className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Peak Intensity</p>
                  <p className={`text-2xl font-black tracking-tighter truncate ${isDark ? "text-white" : "text-blue-600"}`}>
                    {activitySummary.busiestHour}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-black tabular-nums">{activitySummary.busiestHourCount} Orders</span>
                    <span className={`h-1 w-1 rounded-full ${isDark ? "bg-white/20" : "bg-black/20"}`} />
                    <span className="text-xs font-black text-blue-500">
                      {Math.round((activitySummary.busiestHourCount / activitySummary.totalOrders) * 100)}% Traffic
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <Clock className="h-8 w-8 text-gray-400 opacity-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-20">
              Analyzing historical data...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusiestTimesCard;
