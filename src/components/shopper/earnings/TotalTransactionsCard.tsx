import React from "react";
import { useTheme } from "../../../context/ThemeContext";

interface Transaction {
  id: string;
  status: string;
}

interface TotalTransactionsCardProps {
  transactions: Transaction[];
  completedOrders?: number;
  isLoading?: boolean;
}

const TotalTransactionsCard: React.FC<TotalTransactionsCardProps> = ({
  transactions,
  completedOrders,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.status.toLowerCase() === "completed"
  ).length;
  const pendingTransactions = transactions.filter(
    (t) => t.status.toLowerCase() === "pending"
  ).length;

  return (
    <div
      className={`rounded-xl p-4 shadow-lg sm:rounded-2xl sm:p-6 ${
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-medium opacity-70 sm:text-sm">
          Total Transactions
        </h3>
        <button className="hidden text-gray-400 hover:text-gray-600 sm:block">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 sm:py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-green-500 border-t-transparent sm:h-8 sm:w-8"></div>
        </div>
      ) : (
        <>
          <div className="mb-3 sm:mb-4">
            <p className="text-2xl font-bold sm:text-3xl">
              {completedOrders !== undefined
                ? completedOrders
                : totalTransactions}
            </p>
            <p className="mt-1 text-xs opacity-60 sm:text-sm">
              Pending: {pendingTransactions} transactions
            </p>
          </div>

          <div className="flex gap-2">
            <button className="rounded-full bg-green-500 px-4 py-2 text-xs font-medium text-white">
              Completed: {completedTransactions}
            </button>
            <button
              className={`rounded-full border px-4 py-2 text-xs font-medium ${
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }`}
            >
              Pending: {pendingTransactions}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TotalTransactionsCard;
