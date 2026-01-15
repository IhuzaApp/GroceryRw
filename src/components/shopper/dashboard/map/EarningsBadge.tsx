import React from "react";
import { getCurrencySymbol } from "../../../../utils/formatCurrency";

interface EarningsBadgeProps {
  dailyEarnings: number;
  completedOrdersCount: number;
  loadingEarnings: boolean;
  theme: "light" | "dark";
}

const EarningsBadge: React.FC<EarningsBadgeProps> = ({
  dailyEarnings,
  completedOrdersCount,
  loadingEarnings,
  theme,
}) => {
  return (
    <div
      className={`absolute left-1/2 top-4 z-[1001] -translate-x-1/2 transform rounded-full px-4 py-2 shadow-lg ${
        theme === "dark"
          ? "bg-gray-800 bg-opacity-90 text-white backdrop-blur-lg"
          : "bg-white bg-opacity-90 text-gray-900 backdrop-blur-lg"
      }`}
    >
      <div className="flex items-center gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`h-5 w-5 ${
            theme === "dark" ? "text-green-400" : "text-green-500"
          }`}
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Today&apos;s earnings
            </span>
            {loadingEarnings ? (
              <div
                className={`h-4 w-6 animate-pulse rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
              ></div>
            ) : (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  theme === "dark"
                    ? "bg-green-900/30 text-green-300"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {completedOrdersCount}
              </span>
            )}
          </div>
          {loadingEarnings ? (
            <div
              className={`h-6 w-20 animate-pulse rounded ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-200"
              }`}
            />
          ) : (
            <span
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {new Intl.NumberFormat("en-RW", {
                style: "currency",
                currency: getCurrencySymbol(),
                maximumFractionDigits: 0,
              }).format(dailyEarnings)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsBadge;
