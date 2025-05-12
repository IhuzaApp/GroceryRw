import React from "react";
import { Panel } from "rsuite";

interface Goal {
  goal: string;
  current: number;
  target: number;
  percentage: number;
}

interface EarningsGoalsProps {
  goals: Goal[];
}

const EarningsGoals: React.FC<EarningsGoalsProps> = ({ goals }) => {
  return (
    <Panel shaded bordered bodyFill className="p-4">
      <div className="space-y-6">
        {goals.map((item, index) => (
          <div key={index}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">{item.goal}</span>
              <span className="text-sm">
                ${item.current.toFixed(2)} / ${item.target.toFixed(2)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
            <div className="mt-1 text-right text-xs text-gray-500">
              {item.percentage}% of goal
            </div>
          </div>
        ))}

        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 font-medium">Tips to Increase Earnings</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                1
              </div>
              <span>
                Shop during peak hours (Fri 4-8pm, Sat 10am-2pm, Sun 11am-3pm)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                2
              </div>
              <span>
                Accept batch orders with multiple deliveries for higher earnings
              </span>
            </li>
            <li className="flex items-start gap-2">
              <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                3
              </div>
              <span>Focus on stores you're familiar with to shop faster</span>
            </li>
          </ul>
        </div>
      </div>
    </Panel>
  );
};

export default EarningsGoals;
