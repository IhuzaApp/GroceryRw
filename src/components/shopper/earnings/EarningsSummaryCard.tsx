import React from "react";
import { Panel } from "rsuite";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface EarningsSummaryCardProps {
  title: string;
  amount: string | number;
  trend?: string | number;
  trendText?: string;
  icon: React.ReactNode;
  iconColor?: string;
  useCurrency?: boolean;
}

const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  title,
  amount,
  trend,
  trendText = "from last week",
  icon,
  iconColor = "text-green-500",
  useCurrency = false,
}) => {
  // Format currency in RWF if needed
  const formatRwfCurrency = (value: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: formatCurrencySync("RWF"),
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format the amount as currency if it's a number and useCurrency is true
  const displayAmount =
    useCurrency && typeof amount === "number"
      ? formatRwfCurrency(amount)
      : amount;

  return (
    <Panel shaded bordered bodyFill className="p-4 sm:p-6">
      <div className="pb-3">
        <div className="text-sm text-gray-500 sm:text-base">{title}</div>
        <div className="flex items-center text-xl font-bold sm:text-3xl">
          <span className={`mr-2 h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`}>
            {icon}
          </span>
          {displayAmount}
        </div>
      </div>
      <div>
        {trend && (
          <div className="flex items-center text-sm text-gray-500">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1 h-4 w-4 text-green-500"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span className="mr-1 font-medium text-green-500">{trend}</span>{" "}
            <span className="hidden sm:inline">{trendText}</span>
            <span className="sm:hidden">vs last week</span>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default EarningsSummaryCard;
