import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface EarningsComponent {
  type: string;
  amount: number;
  percentage: number;
}

interface EarningsComponentsCardProps {
  earningsComponents?: EarningsComponent[];
  totalEarnings: number;
  isLoading?: boolean;
}

const EarningsComponentsCard: React.FC<EarningsComponentsCardProps> = ({
  earningsComponents = [],
  totalEarnings,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const getComponentColor = (type: string) => {
    switch (type) {
      case "Delivery Fee":
        return "bg-green-500";
      case "Service Fee":
        return "bg-blue-500";
      case "Tips":
        return "bg-purple-500";
      case "Bonus":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold">Earnings Components</h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      ) : earningsComponents.length > 0 ? (
        <>
          <div className="space-y-3 sm:space-y-4">
            {earningsComponents.map((component, index) => (
              <div key={index}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded-full ${getComponentColor(
                        component.type
                      )}`}
                    />
                    <span className="text-sm font-medium">{component.type}</span>
                  </div>
                  <span className="text-sm font-bold">
                    {formatCurrencySync(component.amount)}
                  </span>
                </div>
                <div
                  className={`h-2 w-full rounded-full ${
                    theme === "dark" ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`h-2 rounded-full ${getComponentColor(
                      component.type
                    )}`}
                    style={{ width: `${component.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            className={`mt-4 sm:mt-6 border-t pt-3 sm:pt-4 ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base font-bold">Total Earnings</span>
              <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                {formatCurrencySync(totalEarnings)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-sm opacity-60">
          <p>No earnings components data available</p>
        </div>
      )}
    </div>
  );
};

export default EarningsComponentsCard;
