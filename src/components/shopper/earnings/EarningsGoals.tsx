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
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{item.goal}</span>
              <span className="text-sm">
                ${item.current.toFixed(2)} / ${item.target.toFixed(2)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${item.percentage}%` }}></div>
            </div>
            <div className="text-xs text-right mt-1 text-gray-500">{item.percentage}% of goal</div>
          </div>
        ))}

        <div className="pt-4 border-t mt-6">
          <h3 className="font-medium mb-3">Tips to Increase Earnings</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5">
                1
              </div>
              <span>Shop during peak hours (Fri 4-8pm, Sat 10am-2pm, Sun 11am-3pm)</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5">
                2
              </div>
              <span>Accept batch orders with multiple deliveries for higher earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-600 mt-0.5">
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