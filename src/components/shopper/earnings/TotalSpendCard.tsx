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
      className={`group relative overflow-hidden rounded-[2rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark 
          ? "bg-white/5 border border-white/10 hover:bg-white/[0.08]" 
          : "bg-white border border-black/5 shadow-xl hover:shadow-teal-500/10"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-teal-500/10 blur-3xl transition-opacity group-hover:opacity-100 opacity-50" />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
              isDark ? "bg-teal-500/10 text-teal-400" : "bg-teal-100 text-teal-600"
            }`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest opacity-60">
              Total Earnings
            </h3>
          </div>
          <button className={`${isDark ? "text-white/20 hover:text-white/60" : "text-black/20 hover:text-black/60"} transition-colors`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="bg-gradient-to-br from-teal-400 to-emerald-500 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                {formatCurrencySync(earningsStats.totalEarnings || 0)}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tight ${
                  isDark ? "bg-emerald-500/20 text-emerald-500" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {earningsStats.completedOrders || 0} Orders
                </span>
                <p className="text-xs font-bold opacity-40">
                  Total lifetime
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-teal-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-teal-500/20 transition-all hover:bg-teal-400">
                All Time
              </button>
              <button
                className={`flex-1 rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  isDark 
                    ? "border-white/10 text-white/60 hover:bg-white/5 hover:text-white" 
                    : "border-black/5 text-black/60 hover:bg-black/5 hover:text-black"
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
