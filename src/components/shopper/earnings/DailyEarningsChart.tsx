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
    <div className="flex h-[300px] items-end justify-between gap-2 pt-6">
      {data.map((item, index) => (
        <div key={index} className="flex flex-1 flex-col items-center">
          <div
            className="group relative w-full rounded-t-md bg-green-500"
            style={{ height: item.height }}
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              ${item.amount.toFixed(2)}
            </div>
          </div>
          <div className="mt-2 text-xs font-medium">{item.day}</div>
        </div>
      ))}
    </div>
  );
};

export default DailyEarningsChart;
