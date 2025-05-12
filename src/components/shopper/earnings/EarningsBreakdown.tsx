import React from "react";
import { Panel } from "rsuite";

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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Store Type Breakdown */}
      <div>
        <h3 className="mb-4 font-medium">By Store</h3>
        <div className="space-y-4">
          {storeBreakdown.map((item, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm">{item.store}</span>
                <span className="text-sm font-medium">${item.amount}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-xs text-gray-500">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Components */}
      <div>
        <h3 className="mb-4 font-medium">Earnings Components</h3>
        <div className="space-y-4">
          {earningsComponents.map((item, index) => (
            <div key={index}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm">{item.type}</span>
                <span className="text-sm font-medium">${item.amount}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full ${
                    item.type === "Base Pay"
                      ? "bg-blue-500"
                      : item.type === "Tips"
                      ? "bg-purple-500"
                      : item.type === "Batch Pay"
                      ? "bg-yellow-500"
                      : "bg-orange-500"
                  }`}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-right text-xs text-gray-500">
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
