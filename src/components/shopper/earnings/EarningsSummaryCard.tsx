import { useTheme } from "../../../context/ThemeContext";

interface EarningsSummaryCardProps {
  title: string;
  amount: string | number;
  trend?: string | number;
  trendText?: string;
  icon: React.ReactNode;
  iconColor?: string;
  useCurrency?: boolean;
}

const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  title,
  amount,
  trend,
  trendText = "from last week",
  icon,
  iconColor = "text-emerald-500",
  useCurrency = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Format the amount as currency if it's a number and useCurrency is true
  const displayAmount =
    useCurrency && typeof amount === "number"
      ? formatCurrencySync(amount)
      : amount;

  return (
    <div
      className={`group relative overflow-hidden rounded-[2.5rem] p-6 transition-all duration-500 hover:shadow-2xl ${
        isDark
          ? "border border-white/5 bg-gray-900/40 backdrop-blur-2xl shadow-xl shadow-black/20"
          : "border border-gray-100 bg-white shadow-xl shadow-gray-200/50 hover:border-emerald-200"
      }`}
    >
      {/* Background Decorative Glow */}
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-3xl transition-all duration-500 group-hover:scale-110 ${
        isDark ? "bg-emerald-500/10" : "bg-emerald-500/5"
      }`} />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ring-1 transition-transform group-hover:-rotate-6 ${
            isDark ? "bg-white/5 ring-white/10" : "bg-gray-50 ring-gray-100"
          }`}>
            <span className={`h-6 w-6 ${iconColor}`}>
              {icon}
            </span>
          </div>
          {trend && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3 text-emerald-500"
              >
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase">{trend}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? "text-white/30" : "text-gray-400"}`}>
            {title}
          </h4>
          <div className={`text-2xl font-black tracking-tighter ${isDark ? "text-white" : "text-gray-900"}`}>
            {displayAmount}
          </div>
        </div>

        {trend && (
          <div className="pt-2 border-t border-white/5 dark:border-white/5">
            <p className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${isDark ? "text-white" : "text-black"}`}>
              {trendText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EarningsSummaryCard;
