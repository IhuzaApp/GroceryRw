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
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-indigo-500/10 group-hover:bg-indigo-500/20" : "bg-indigo-500/5 group-hover:bg-indigo-500/10"
      }`} />
      
      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-inner transition-transform duration-500 group-hover:rotate-6 ${
                isDark
                  ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-white/10"
                  : "bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 ring-1 ring-indigo-100"
              }`}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Volume Metrics
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500/60">
                Transaction Activity
              </p>
            </div>
          </div>
          
          <button className={`p-2 rounded-xl transition-all duration-300 ${isDark ? "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900"}`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative">
              <div className="flex items-baseline gap-1">
                <span className="bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-6xl font-black text-transparent tracking-tighter">
                  {completedOrders !== undefined ? completedOrders : totalTransactions}
                </span>
                <span className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-black/10"}`}>
                  Orders
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  isDark ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20" : "bg-amber-50 text-amber-600 ring-1 ring-amber-100"
                }`}>
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                  {pendingTransactions} Pending
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-black/20"}`}>
                  Lifetime Aggregate
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`group/card rounded-3xl p-5 transition-all duration-300 ${
                isDark ? "bg-white/[0.03] hover:bg-white/[0.05] border border-white/5" : "bg-gray-50 hover:bg-gray-100 border border-gray-100"
              }`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 mb-1">Finalized</p>
                <p className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  {completedTransactions}
                </p>
                <div className="mt-2 h-1 w-8 rounded-full bg-emerald-500/30 group-hover/card:w-full transition-all duration-500"></div>
              </div>
              
              <div className={`group/card rounded-3xl p-5 transition-all duration-300 ${
                isDark ? "bg-white/[0.03] hover:bg-white/[0.05] border border-white/5" : "bg-gray-50 hover:bg-gray-100 border border-gray-100"
              }`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60 mb-1">Queue</p>
                <p className={`text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                  {pendingTransactions}
                </p>
                <div className="mt-2 h-1 w-8 rounded-full bg-amber-500/30 group-hover/card:w-full transition-all duration-500"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalTransactionsCard;
