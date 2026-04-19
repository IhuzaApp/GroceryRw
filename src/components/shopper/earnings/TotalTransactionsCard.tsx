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
  const isDark = theme === "dark";

  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(
    (t) => t.status.toLowerCase() === "completed"
  ).length;
  const pendingTransactions = transactions.filter(
    (t) => t.status.toLowerCase() === "pending"
  ).length;

  return (
    <div
      className={`group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark
          ? "border border-white/10 bg-white/5 hover:bg-white/[0.08]"
          : "border border-black/5 bg-white shadow-xl hover:shadow-indigo-500/10"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/10 opacity-50 blur-3xl transition-opacity group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                isDark
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
              Total Transactions
            </h3>
          </div>
          <button
            className={`${
              isDark
                ? "text-white/20 hover:text-white/60"
                : "text-black/20 hover:text-black/60"
            } transition-colors`}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="bg-gradient-to-br from-indigo-400 to-purple-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                {completedOrders !== undefined
                  ? completedOrders
                  : totalTransactions}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tight ${
                    isDark
                      ? "bg-amber-500/20 text-amber-500"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {pendingTransactions} Pending
                </span>
                <p className="text-xs font-bold opacity-40">
                  Across all periods
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div
                className={`rounded-xl p-3 ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Completed
                </p>
                <p className="text-xl font-black text-emerald-500">
                  {completedTransactions}
                </p>
              </div>
              <div
                className={`rounded-xl p-3 ${
                  isDark ? "bg-white/5" : "bg-black/5"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  Pending
                </p>
                <p className="text-xl font-black text-amber-500">
                  {pendingTransactions}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalTransactionsCard;
