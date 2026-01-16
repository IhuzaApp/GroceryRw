import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface EarningsStats {
  totalEarnings: number;
  completedOrders: number;
}

interface TotalSpendCardProps {
  earningsStats: EarningsStats;
  isLoading?: boolean;
}

const TotalSpendCard: React.FC<TotalSpendCardProps> = ({
  earningsStats,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-medium opacity-70">Total Earnings</h3>
        <button className="text-gray-400 hover:text-gray-600 hidden sm:block">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="mb-3 sm:mb-4">
            <p className="text-2xl sm:text-3xl font-bold">
              {formatCurrencySync(earningsStats.totalEarnings || 0)}
            </p>
            <p className="mt-1 text-xs sm:text-sm opacity-60">
              From {earningsStats.completedOrders || 0} completed orders
            </p>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <button className="rounded-full bg-green-500 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-white">
              All Time
            </button>
            <button
              className={`rounded-full border px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium ${
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }`}
            >
              This Month
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TotalSpendCard;
