import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface ShopperSchedule {
  day_of_week: number;
  is_available: boolean;
}

interface ScheduleCardProps {
  shopperSchedule: ShopperSchedule[];
  isLoading?: boolean;
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  shopperSchedule,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isWorkingDay = (dayNumber: number) => {
    if (shopperSchedule.length === 0) return true;
    const today = new Date();
    const date = new Date(today.getFullYear(), today.getMonth(), dayNumber);
    const dayOfWeek = date.getDay();
    const scheduleForDay = shopperSchedule.find((s) => s.day_of_week === dayOfWeek);
    return scheduleForDay ? scheduleForDay.is_available : false;
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(245,158,11,0.05)] ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-amber-500/10 group-hover:bg-amber-500/20" : "bg-amber-500/5 group-hover:bg-amber-500/10"
      }`} />

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-inner transition-transform duration-500 group-hover:-rotate-6 ${
                isDark
                  ? "bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 ring-1 ring-white/10"
                  : "bg-gradient-to-br from-amber-50 to-orange-50 text-amber-600 ring-1 ring-amber-100"
              }`}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Weekly Roster
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60">
                Shift Availability
              </p>
            </div>
          </div>
          
          <button className={`p-2 rounded-xl transition-all duration-300 ${isDark ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"}`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent shadow-[0_0_15px_rgba(245,158,11,0.3)]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black uppercase tracking-widest text-amber-500/40 pb-4 border-b border-white/5 dark:border-white/5">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {(() => {
                const today = new Date();
                const currentDay = today.getDate();
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const cells = [];

                for (let i = 0; i < firstDay; i++) {
                  cells.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
                }

                for (let day = 1; day <= daysInMonth; day++) {
                  const isToday = day === currentDay;
                  const isWorking = isWorkingDay(day);

                  cells.push(
                    <div
                      key={day}
                      className={`relative flex h-8 w-8 items-center justify-center rounded-xl text-[11px] font-black transition-all duration-300 active:scale-90 ${
                        isToday
                          ? "bg-emerald-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.4)] z-10"
                          : !isWorking
                          ? "bg-red-500/10 text-red-500/40"
                          : isDark
                          ? "bg-white/[0.03] text-white/40 hover:bg-white/10 hover:text-white"
                          : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {day}
                      {isToday && (
                        <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-900 shadow-lg" />
                      )}
                    </div>
                  );
                }
                return cells;
              })()}
            </div>

            {/* Status Legend */}
            <div className="mt-8 flex items-center justify-between px-2 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500/30"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Resting</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
