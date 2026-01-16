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
      className={`rounded-xl p-4 shadow-lg sm:rounded-2xl sm:p-6 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium opacity-70 sm:text-sm">
          Total Earnings
        </h3>
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
        <>
          <div className="mb-3 sm:mb-4">
            <p className="text-2xl font-bold sm:text-3xl">
              {formatCurrencySync(earningsStats.totalEarnings || 0)}
            </p>
            <p className="mt-1 text-xs opacity-60 sm:text-sm">
              From {earningsStats.completedOrders || 0} completed orders
            </p>
          </div>

          <div className="flex gap-1.5 sm:gap-2">
            <button className="rounded-full bg-green-500 px-3 py-1.5 text-[10px] font-medium text-white sm:px-4 sm:py-2 sm:text-xs">
              All Time
            </button>
            <button
              className={`rounded-full border px-3 py-1.5 text-[10px] font-medium sm:px-4 sm:py-2 sm:text-xs ${
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
