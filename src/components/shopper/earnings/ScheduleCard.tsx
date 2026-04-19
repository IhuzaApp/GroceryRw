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

  // Helper function to check if a day is a working day
  const isWorkingDay = (dayNumber: number) => {
    if (shopperSchedule.length === 0) return true;

    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const date = new Date(year, month, dayNumber);
    const dayOfWeek = date.getDay();

    const scheduleForDay = shopperSchedule.find(
      (s) => s.day_of_week === dayOfWeek
    );
    return scheduleForDay ? scheduleForDay.is_available : false;
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark 
          ? "bg-white/5 border border-white/10 hover:bg-white/[0.08]" 
          : "bg-white border border-black/5 shadow-xl hover:shadow-amber-500/10"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-amber-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-600"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
              Schedule
            </h3>
          </div>
          <button className={`${isDark ? "text-white/20 hover:text-white/60" : "text-black/20 hover:text-black/60"} transition-colors`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="text-[10px] sm:text-xs">
            <div className="mb-4 grid grid-cols-7 gap-1 text-center font-black uppercase tracking-tighter opacity-30">
              <div>Su</div>
              <div>Mo</div>
              <div>Tu</div>
              <div>We</div>
              <div>Th</div>
              <div>Fr</div>
              <div>Sa</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {(() => {
                const today = new Date();
                const currentDay = today.getDate();
                const year = today.getFullYear();
                const month = today.getMonth();
                const firstDay = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const cells = [];

                // Add empty cells for days before the month starts
                for (let i = 0; i < firstDay; i++) {
                  cells.push(<div key={`empty-${i}`} className="p-1"></div>);
                }

                // Add cells for each day of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const isToday = day === currentDay;
                  const isWorking = isWorkingDay(day);

                  cells.push(
                    <div
                      key={day}
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black transition-all ${
                        isToday
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110"
                          : !isWorking
                          ? "bg-red-500/10 text-red-500/60"
                          : isDark
                          ? "text-white/40 hover:bg-white/10 hover:text-white"
                          : "text-black/40 hover:bg-black/5 hover:text-black"
                      }`}
                    >
                      {day}
                      {isToday && (
                        <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  );
                }

                return cells;
              })()}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="opacity-40">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500/30"></div>
                <span className="opacity-40">Off Day</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleCard;
