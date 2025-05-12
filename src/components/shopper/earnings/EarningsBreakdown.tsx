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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Store Type Breakdown */}
      <div>
        <h3 className="font-medium mb-4">By Store</h3>
        <div className="space-y-4">
          {storeBreakdown.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{item.store}</span>
                <span className="text-sm font-medium">${item.amount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
              <div className="text-xs text-right mt-1 text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Components */}
      <div>
        <h3 className="font-medium mb-4">Earnings Components</h3>
        <div className="space-y-4">
          {earningsComponents.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm">{item.type}</span>
                <span className="text-sm font-medium">${item.amount}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
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
              <div className="text-xs text-right mt-1 text-gray-500">{item.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EarningsBreakdown; 