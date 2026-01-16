import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { ShoppingCart } from "lucide-react";

interface StoreBreakdown {
  store?: string;
  name?: string;
  amount: number;
  percentage?: number;
  points?: number;
}

interface TopStoresCardProps {
  storeBreakdown?: StoreBreakdown[];
  isLoading?: boolean;
}

const TopStoresCard: React.FC<TopStoresCardProps> = ({
  storeBreakdown = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();

  // Default data if no store breakdown
  const defaultStores = [
    { name: "Store 1", amount: 0, percentage: 0 },
    { name: "Store 2", amount: 0, percentage: 0 },
    { name: "Store 3", amount: 0, percentage: 0 },
  ];

  const stores = storeBreakdown.length > 0 ? storeBreakdown.slice(0, 3) : defaultStores;

  const getColorClasses = (index: number) => {
    switch (index) {
      case 0:
        return "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400";
      case 1:
        return "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400";
      case 2:
        return "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div
      className={`rounded-2xl p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold">Top Stores</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {stores.map((item, index) => {
            const storeName = item.store || item.name || `Store ${index + 1}`;
            const amount = item.amount;
            const percentage = item.percentage || item.points || 0;

            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${getColorClasses(
                      index
                    )}`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{storeName}</p>
                    <p className="text-sm opacity-60">
                      {amount ? formatCurrencySync(amount) : `${percentage} Points`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-500">
                    {percentage ? `${Math.round(percentage)}%` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {storeBreakdown.length === 0 && !isLoading && (
        <div className="py-8 text-center text-sm opacity-60">
          <p>No store data available yet</p>
        </div>
      )}
    </div>
  );
};

export default TopStoresCard;
