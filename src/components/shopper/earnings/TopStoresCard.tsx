import React from "react";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";
import { ShoppingCart } from "lucide-react";

interface StoreBreakdown {
  store?: string;
  name?: string;
  amount: number;
  percentage?: number;
  points?: number;
}

interface TopStoresCardProps {
  storeBreakdown?: StoreBreakdown[];
  isLoading?: boolean;
}

const TopStoresCard: React.FC<TopStoresCardProps> = ({
  storeBreakdown = [],
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Default data if no store breakdown
  const defaultStores = [
    { name: "Retail Hub", amount: 0, percentage: 0 },
    { name: "Grocery Core", amount: 0, percentage: 0 },
    { name: "Pharma Direct", amount: 0, percentage: 0 },
  ];

  const stores =
    storeBreakdown.length > 0 ? storeBreakdown.slice(0, 3) : defaultStores;

  const getAccentColor = (index: number) => {
    switch (index) {
      case 0: return "emerald";
      case 1: return "blue";
      case 2: return "purple";
      default: return "gray";
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
      <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full blur-[100px] transition-all duration-700 group-hover:scale-110 ${
        isDark ? "bg-emerald-500/10" : "bg-emerald-500/5"
      }`} />

      <div className="relative z-10">
        <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-6 dark:border-white/5">
          <div>
            <h3 className={`text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"}`}>
              Top Channels
            </h3>
            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-500/60">
              Primary Revenue Sources
            </p>
          </div>
          <div className={`rounded-2xl p-2.5 ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
            <ShoppingCart className={`h-6 w-6 ${isDark ? "text-white/40" : "text-gray-400"}`} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {stores.map((item, index) => {
              const storeName = item.store || item.name || `Channel ${index + 1}`;
              const amount = item.amount;
              const percentage = item.percentage || item.points || 0;
              const accent = getAccentColor(index);

              const colorMap: Record<string, string> = {
                emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
                blue: "from-blue-400 to-indigo-500 shadow-blue-500/20",
                purple: "from-purple-400 to-pink-500 shadow-purple-500/20",
              };

              const textColorMap: Record<string, string> = {
                emerald: "text-emerald-500",
                blue: "text-blue-500",
                purple: "text-purple-500",
              };

              const iconBgMap: Record<string, string> = {
                emerald: isDark ? "bg-emerald-500/10 ring-emerald-500/20" : "bg-emerald-50 ring-emerald-100",
                blue: isDark ? "bg-blue-500/10 ring-blue-500/20" : "bg-blue-50 ring-blue-100",
                purple: isDark ? "bg-purple-500/10 ring-purple-500/20" : "bg-purple-50 ring-purple-100",
              };

              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-[1.25rem] ring-1 transition-transform group-hover:scale-105 ${iconBgMap[accent]}`}>
                        <ShoppingCart className={`h-6 w-6 ${textColorMap[accent]}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-black tracking-tight truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                          {storeName}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/40" : "text-gray-500"}`}>
                          {amount ? formatCurrencySync(amount) : `${percentage}% Index`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black tabular-nums ${textColorMap[accent]}`}>
                        {percentage ? `${Math.round(percentage)}%` : "0%"}
                      </span>
                    </div>
                  </div>

                  <div className={`h-2.5 w-full overflow-hidden rounded-full p-0.5 ${isDark ? "bg-white/5 shadow-inner" : "bg-gray-100 shadow-inner"}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out ${colorMap[accent]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {storeBreakdown.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
              <ShoppingCart className="h-8 w-8 text-gray-400 opacity-20" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] opacity-20">
              Awaiting Analytics
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopStoresCard;
