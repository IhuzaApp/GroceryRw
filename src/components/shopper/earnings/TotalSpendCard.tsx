import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface EarningsStats {
  totalEarnings: number;
  completedOrders: number;
}

interface TotalSpendCardProps {
  earningsStats: EarningsStats;
  isLoading?: boolean;
}

const TotalSpendCard: React.FC<TotalSpendCardProps> = ({
  earningsStats,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(20,184,166,0.1)] ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-teal-500/10 group-hover:bg-teal-500/20" : "bg-teal-500/5 group-hover:bg-teal-500/10"
      }`} />

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-[1.25rem] shadow-inner transition-transform duration-500 group-hover:rotate-12 ${
                isDark
                  ? "bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-teal-400 ring-1 ring-white/10"
                  : "bg-gradient-to-br from-teal-50 to-emerald-50 text-teal-600 ring-1 ring-teal-100"
              }`}
            >
              <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h3 className={`text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                Total Returns
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500/60">
                Lifetime Revenue
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
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent shadow-[0_0_15px_rgba(20,184,166,0.3)]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="bg-gradient-to-br from-teal-400 via-emerald-500 to-cyan-500 bg-clip-text text-5xl font-black text-transparent tracking-tighter sm:text-6xl">
                  {formatCurrencySync(earningsStats.totalEarnings || 0)}
                </span>
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  isDark ? "bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
                }`}>
                  {earningsStats.completedOrders || 0} Orders
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/20" : "text-black/20"}`}>
                  Lifetime Aggregate
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 rounded-2xl bg-teal-500 px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_20px_rgba(20,184,166,0.2)] transition-all hover:bg-teal-400 hover:shadow-[0_15px_30px_rgba(20,184,166,0.3)] active:scale-95">
                All Time
              </button>
              <button
                className={`flex-1 rounded-2xl border px-4 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${
                  isDark
                    ? "border-white/10 text-white/40 hover:bg-white/5 hover:text-white"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Snapshot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalSpendCard;
