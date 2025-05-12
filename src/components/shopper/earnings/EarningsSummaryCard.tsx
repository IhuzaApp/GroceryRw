import React from "react";
import { Panel } from "rsuite";

interface EarningsSummaryCardProps {
  title: string;
  amount: string | number;
  trend?: string | number;
  trendText?: string;
  icon: React.ReactNode;
  iconColor?: string;
}

const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  title,
  amount,
  trend,
  trendText = "from last week",
  icon,
  iconColor = "text-green-500",
}) => {
  return (
    <Panel shaded bordered bodyFill className="p-4">
      <div className="pb-2">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold flex items-center">
          <span className={`h-5 w-5 mr-1 ${iconColor}`}>{icon}</span>
          {amount}
        </div>
      </div>
      <div>
        {trend && (
          <div className="text-xs text-gray-500 flex items-center">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-3 w-3 text-green-500 mr-1"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span className="text-green-500 font-medium mr-1">{trend}</span> {trendText}
          </div>
        )}
      </div>
    </Panel>
  );
};

export default EarningsSummaryCard; 