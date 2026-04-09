import React from "react";
import { Store } from "lucide-react";

interface DashboardStatsProps {
  employeeId: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ employeeId }) => {
  return (
    <div className="flex items-center justify-between rounded-2xl border p-4 shadow-xl border-green-100 bg-green-50 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow-lg shadow-green-500/20">
          <Store className="h-5 w-5" />
          <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-800"></span>
          </span>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-500">
            Active Shift
          </p>
          <p className="font-semibold text-gray-900 dark:text-white">
            Employee #{employeeId}
          </p>
        </div>
      </div>
    </div>
  );
};
