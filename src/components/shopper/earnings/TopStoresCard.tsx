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
    { name: "Store 1", amount: 0, percentage: 0 },
    { name: "Store 2", amount: 0, percentage: 0 },
    { name: "Store 3", amount: 0, percentage: 0 },
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
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark 
          ? "bg-white/5 border border-white/10" 
          : "bg-white border border-black/5 shadow-xl"
      }`}
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/5 blur-3xl" />

      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">Top Stores</h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5">Revenue Sources</p>
          </div>
          <button className={`${isDark ? "text-white/20 hover:text-white/60" : "text-black/20 hover:text-black/60"} transition-colors`}>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {stores.map((item, index) => {
              const storeName = item.store || item.name || `Store ${index + 1}`;
              const amount = item.amount;
              const percentage = item.percentage || item.points || 0;
              const accent = getAccentColor(index);

              const accentClasses = {
                emerald: "bg-emerald-500 text-emerald-500",
                blue: "bg-blue-500 text-blue-500",
                purple: "bg-purple-500 text-purple-500",
                gray: "bg-gray-500 text-gray-500",
              }[accent];

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                        isDark ? `bg-${accent}-500/10` : `bg-${accent}-100`
                      } transition-transform group-hover:scale-105`}>
                        <ShoppingCart className={`h-5 w-5 text-${accent}-500`} />
                      </div>
                      <div>
                        <p className="text-sm font-black tracking-tight">{storeName}</p>
                        <p className="text-xs font-bold opacity-40">
                          {amount ? formatCurrencySync(amount) : `${percentage} Points`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black text-${accent}-500`}>
                        {percentage ? `${Math.round(percentage)}%` : "0%"}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${accentClasses.split(" ")[0]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {storeBreakdown.length === 0 && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-sm font-bold opacity-20 uppercase tracking-widest">No active sources</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopStoresCard;
