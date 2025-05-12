import React from "react";

interface DailyEarning {
  day: string;
  amount: number;
  height: string;
}

interface DailyEarningsChartProps {
  data: DailyEarning[];
}

const DailyEarningsChart: React.FC<DailyEarningsChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] flex items-end justify-between gap-2 pt-6">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-full bg-green-500 rounded-t-md relative group"
            style={{ height: item.height }}
          >
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              ${item.amount.toFixed(2)}
            </div>
          </div>
          <div className="text-xs font-medium mt-2">{item.day}</div>
        </div>
      ))}
    </div>
  );
};

export default DailyEarningsChart; 