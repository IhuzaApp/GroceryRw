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
        return "from-emerald-400 to-emerald-600";
      case "Service Fee":
        return "from-blue-400 to-blue-600";
      case "Tips":
        return "from-purple-400 to-purple-600";
      case "Bonus":
        return "from-amber-400 to-amber-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getDotsColor = (type: string) => {
    switch (type) {
      case "Delivery Fee": return "bg-emerald-500";
      case "Service Fee": return "bg-blue-500";
      case "Tips": return "bg-purple-500";
      case "Bonus": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark 
          ? "bg-white/5 border border-white/10" 
          : "bg-white border border-black/5 shadow-xl"
      }`}
    >
      <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-blue-500/5 blur-3xl opacity-50" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Earnings Breakdown</h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">Component Analysis</p>
          </div>
          <button className={`${isDark ? "text-white/20 hover:text-white/60" : "text-black/20 hover:text-black/60"} transition-colors`}>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : earningsComponents.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-5">
              {earningsComponents.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-2 w-2 rounded-full ring-4 ring-opacity-20 ${getDotsColor(component.type).replace("bg-", "ring-") } ${getDotsColor(component.type)}`} />
                      <span className="text-sm font-black tracking-tight uppercase opacity-80 whitespace-nowrap">
                        {component.type}
                      </span>
                    </div>
                    <span className="text-sm font-black bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent dark:from-white dark:to-white/40">
                      {formatCurrencySync(component.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getComponentColor(component.type)} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                      style={{ width: `${component.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className={`mt-8 rounded-2xl p-4 transition-all duration-300 ${isDark ? "bg-white/5 border border-white/5" : "bg-black/5 border border-black/5"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Net Earnings</p>
                  <p className="text-lg font-black tracking-tight mt-0.5">Summary Total</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                    {formatCurrencySync(totalEarnings)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm font-bold opacity-20 uppercase tracking-widest">No segments found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsComponentsCard;
