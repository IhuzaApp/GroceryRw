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

  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold">Busiest Times</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <Loader size="sm" content="Loading activity data..." />
        </div>
      ) : activitySummary ? (
        <div className="space-y-3 sm:space-y-4">
          {/* Busiest Day */}
          <div
            className={`rounded-lg p-3 sm:p-4 ${
              theme === "dark" ? "bg-gray-700/50" : "bg-green-50"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <div className="text-xs sm:text-sm font-medium opacity-70">Busiest Day</div>
            </div>
            <div className="ml-6 sm:ml-7">
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                {activitySummary.busiestDay}
              </div>
              <div className="text-sm opacity-60">
                {activitySummary.busiestDayCount} orders (
                {Math.round(
                  (activitySummary.busiestDayCount / activitySummary.totalOrders) *
                    100
                )}
                % of total)
              </div>
            </div>
          </div>

          {/* Busiest Hour */}
          <div
            className={`rounded-lg p-3 sm:p-4 ${
              theme === "dark" ? "bg-gray-700/50" : "bg-green-50"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <div className="text-xs sm:text-sm font-medium opacity-70">Busiest Hour</div>
            </div>
            <div className="ml-6 sm:ml-7">
              <div className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                {activitySummary.busiestHour}
              </div>
              <div className="text-sm opacity-60">
                {activitySummary.busiestHourCount} orders (
                {Math.round(
                  (activitySummary.busiestHourCount / activitySummary.totalOrders) *
                    100
                )}
                % of total)
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-sm opacity-60">
          <p>No activity data available yet</p>
        </div>
      )}
    </div>
  );
};

export default BusiestTimesCard;
