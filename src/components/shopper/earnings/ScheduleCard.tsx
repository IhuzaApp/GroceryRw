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
      className={`rounded-xl p-4 shadow-lg sm:rounded-2xl sm:p-6 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium opacity-70 sm:text-sm">Schedule</h3>
        <button className="hidden text-gray-400 hover:text-gray-600 sm:block">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-green-500 border-t-transparent sm:h-8 sm:w-8"></div>
        </div>
      ) : (
        <div className="text-[10px] sm:text-xs">
          <div className="mb-2 grid grid-cols-7 gap-1 text-center font-medium opacity-60">
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
                    className={`rounded-full p-1 transition-colors ${
                      isToday
                        ? "bg-green-500 font-bold text-white"
                        : !isWorking
                        ? "bg-red-500 text-white"
                        : theme === "dark"
                        ? "hover:bg-gray-700"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </div>
                );
              }

              return cells;
            })()}
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="opacity-60">Today</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span className="opacity-60">Off Day</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
