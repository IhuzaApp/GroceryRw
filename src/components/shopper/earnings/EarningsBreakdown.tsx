import React from "react";
import { Panel } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";

interface StoreBreakdown {
  store: string;
  amount: number;
  percentage: number;
}

interface EarningsComponent {
  type: string;
  amount: number;
  percentage: number;
}

interface EarningsBreakdownProps {
  storeBreakdown: StoreBreakdown[];
  earningsComponents: EarningsComponent[];
}

const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({
  storeBreakdown,
  earningsComponents,
}) => {
  const { theme } = useTheme();
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Store Type Breakdown */}
      <div>
        <h3 className={`mb-4 font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>By Store</h3>
        <div className="space-y-4">
          {storeBreakdown.map((item, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{item.store}</span>
                <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className={`h-2 w-full rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className={`mt-1 text-right text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Components */}
      <div>
        <h3 className={`mb-4 font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Earnings Components</h3>
        <div className="space-y-4">
          {earningsComponents.map((item, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between">
                <span className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>{item.type}</span>
                <span className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                  {formatCurrency(item.amount)}
                </span>
              </div>
              <div className={`h-2 w-full rounded-full ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}>
                <div
                  className={`h-2 rounded-full ${
                    item.type === "Delivery Fee"
                      ? "bg-blue-500"
                      : item.type === "Service Fee"
                      ? "bg-purple-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className={`mt-1 text-right text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsBreakdown;
