import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface EarningsComponent {
  type: string;
  amount: number;
  percentage: number;
}

interface EarningsComponentsCardProps {
  earningsComponents?: EarningsComponent[];
  totalEarnings: number;
  isLoading?: boolean;
}

const EarningsComponentsCard: React.FC<EarningsComponentsCardProps> = ({
  earningsComponents = [],
  totalEarnings,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getComponentColor = (type: string) => {
    switch (type) {
      case "Delivery Fee":
        return "from-emerald-400 to-teal-500 shadow-emerald-500/20";
      case "Service Fee":
        return "from-blue-400 to-indigo-500 shadow-blue-500/20";
      case "Tips":
        return "from-purple-400 to-pink-500 shadow-purple-500/20";
      case "Bonus":
        return "from-amber-400 to-orange-500 shadow-amber-500/20";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getDotsColor = (type: string) => {
    switch (type) {
      case "Delivery Fee":
        return "bg-emerald-500 shadow-emerald-500/40";
      case "Service Fee":
        return "bg-blue-500 shadow-blue-500/40";
      case "Tips":
        return "bg-purple-500 shadow-purple-500/40";
      case "Bonus":
        return "bg-amber-500 shadow-amber-500/40";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.05)] ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-2xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-2xl shadow-gray-200/50"
      }`}
    >
      <div className={`absolute -bottom-20 -left-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-emerald-500/10" : "bg-emerald-500/5"
      }`} />

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6 dark:border-white/5">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Earnings Breakdown
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Structural Segment Analysis
            </p>
          </div>
          <div className={`rounded-2xl p-2.5 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <svg className={`h-6 w-6 ${isDark ? "text-white/40" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
          </div>
        ) : earningsComponents.length > 0 ? (
          <div className="space-y-8">
            <div className="space-y-6">
              {earningsComponents.map((component, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)] ${getDotsColor(component.type)}`} />
                      <span className={`text-xs font-black uppercase tracking-widest ${isDark ? "text-white/60" : "text-gray-500"}`}>
                        {component.type}
                      </span>
                    </div>
                    <span className={`text-sm font-black tabular-nums tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                      {formatCurrencySync(component.amount)}
                    </span>
                  </div>
                  <div className={`h-2.5 w-full overflow-hidden rounded-full p-0.5 ${isDark ? "bg-white/5 shadow-inner" : "bg-gray-100 shadow-inner"}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getComponentColor(component.type)} transition-all duration-1000 ease-out`}
                      style={{ width: `${component.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div
              className={`mt-10 overflow-hidden rounded-3xl transition-all duration-300 ${
                isDark
                  ? "bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-white/5"
                  : "bg-emerald-50/50 border border-emerald-100"
              }`}
            >
              <div className="relative p-6">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="h-12 w-12 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10v2a2 2 0 002 2V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/60">
                      Consolidated Revenue
                    </p>
                    <p className={`mt-1 text-lg font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
                      Net Performance
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                      {formatCurrencySync(totalEarnings)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <svg className="h-8 w-8 text-gray-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-20">
              No analytics available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsComponentsCard;
