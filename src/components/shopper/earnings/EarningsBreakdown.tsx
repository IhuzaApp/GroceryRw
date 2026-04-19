import React from "react";
import { Panel } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";
import { formatCurrencySync } from "../../../utils/formatCurrency";

interface StoreBreakdown {
  store: string;
  amount: number;
  percentage: number;
}

interface EarningsComponent {
  type: string;
  amount: number;
  percentage: number;
}

interface EarningsBreakdownProps {
  storeBreakdown: StoreBreakdown[];
  earningsComponents: EarningsComponent[];
  hideEarningsComponents?: boolean;
}

const EarningsBreakdown: React.FC<EarningsBreakdownProps> = ({
  storeBreakdown,
  earningsComponents,
  hideEarningsComponents = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const getAccentColor = (index: number) => {
    const colors = ["emerald", "blue", "purple", "indigo", "teal", "amber"];
    return colors[index % colors.length];
  };

  return (
    <div className={`space-y-8`}>
      {/* Store Type Breakdown */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black tracking-tight">
              Income by Source
            </h3>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest opacity-40">
              Store Distribution
            </p>
          </div>
          <div
            className={`rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              isDark ? "bg-white/5 text-white/40" : "bg-black/5 text-black/40"
            }`}
          >
            {storeBreakdown.length} Outlets
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {storeBreakdown.map((item, index) => {
            const accent = getAccentColor(index);
            const accentBg = isDark ? `bg-${accent}-500/10` : `bg-${accent}-50`;
            const accentText = `text-${accent}-500`;
            const accentBar = `bg-${accent}-500`;

            return (
              <div
                key={index}
                className={`relative overflow-hidden rounded-[2rem] p-5 transition-all duration-300 hover:scale-[1.02] ${
                  isDark
                    ? "border border-white/10 bg-white/5"
                    : "border border-black/5 bg-white shadow-sm"
                }`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-black tracking-tight opacity-70">
                    {item.store}
                  </span>
                  <span
                    className={`text-sm font-black ${
                      isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    {formatCurrencySync(item.amount)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                    <span>Revenue Share</span>
                    <span>{Math.round(item.percentage)}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                    <div
                      className={`h-full rounded-full ${accentBar} shadow-[0_0_8px_rgba(0,0,0,0.1)] transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Decorative Accent Glow */}
                <div
                  className={`absolute -right-4 -top-4 h-12 w-12 rounded-full ${accentBg} opacity-50 blur-2xl`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Earnings Components - Only shown if not hidden */}
      {!hideEarningsComponents && (
        <div
          className={`rounded-[2.5rem] p-8 ${
            isDark
              ? "border border-white/10 bg-white/5 shadow-inner"
              : "border border-black/5 bg-black/5"
          }`}
        >
          <div className="mb-6">
            <h3 className="text-xl font-black tracking-tight">
              Earnings Components
            </h3>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest opacity-40">
              Fee Structure Breakdown
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {earningsComponents.map((item, index) => {
              const componentColor =
                item.type === "Delivery Fee"
                  ? "emerald"
                  : item.type === "Service Fee"
                  ? "blue"
                  : "purple";

              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-2.5 w-2.5 rounded-full bg-${componentColor}-500 shadow-[0_0_8px_rgba(0,0,0,0.2)]`}
                      />
                      <span className="text-sm font-black uppercase tracking-widest opacity-80">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-sm font-black opacity-90">
                      {formatCurrencySync(item.amount)}
                    </span>
                  </div>

                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full bg-${componentColor}-500 transition-all duration-1000`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="text-right text-[10px] font-black uppercase tracking-widest opacity-40">
                    {item.percentage}% of net
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsBreakdown;
