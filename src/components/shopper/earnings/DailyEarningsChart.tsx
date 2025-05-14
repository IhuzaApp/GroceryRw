import React from "react";

interface DailyEarning {
  day: string;
  earnings: number;
}

interface DailyEarningsChartProps {
  data: DailyEarning[];
}

const DailyEarningsChart: React.FC<DailyEarningsChartProps> = ({ data }) => {
  // Find the max value to calculate relative heights
  const maxEarnings = Math.max(...data.map(item => item.earnings));
  
  // Format currency in RWF
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      maximumFractionDigits: 0 // RWF typically doesn't use decimal places
    }).format(amount);
  };
  
  return (
    <div className="flex h-[300px] items-end justify-between gap-2 pt-6">
      {data.map((item, index) => {
        // Calculate height as percentage of the max value
        const heightPercentage = (item.earnings / maxEarnings) * 100;
        
        return (
          <div key={index} className="flex flex-1 flex-col items-center">
            <div
              className="group relative w-full rounded-t-md bg-green-500"
              style={{ height: `${heightPercentage}%` }}
            >
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                {formatCurrency(item.earnings)}
              </div>
            </div>
            <div className="mt-2 text-xs font-medium">{item.day}</div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyEarningsChart;
