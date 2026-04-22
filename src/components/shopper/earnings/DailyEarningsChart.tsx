import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from "recharts";
import { Loader } from "rsuite";
import {
  formatCurrencySync,
  getCurrencySymbol,
} from "../../../utils/formatCurrency";

interface DailyEarning {
  day: string;
  earnings: number;
}

interface DailyEarningsChartProps {
  data?: DailyEarning[];
  isLoading?: boolean;
  period?: string;
  height?: string | number;
  mobileHeight?: string | number;
}

const DailyEarningsChart: React.FC<DailyEarningsChartProps> = ({
  data = [],
  isLoading = false,
  period = "this-week",
  height = "100%",
  mobileHeight = "220px",
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Calculate average earnings
  const calculateAverage = () => {
    if (!data || !Array.isArray(data) || data.length === 0) return 0;
    const total = data.reduce((sum, item) => {
      const earnings = typeof item.earnings === "number" ? item.earnings : 0;
      return sum + earnings;
    }, 0);
    return total / data.length;
  };

  const averageEarnings = calculateAverage();

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`rounded-2xl p-4 shadow-2xl backdrop-blur-2xl ring-1 transition-all duration-300 ${
          isDark ? "bg-gray-900/90 border-white/10 ring-white/10" : "bg-white/90 border-gray-100 ring-gray-100"
        }`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-40 ${isDark ? "text-white" : "text-gray-900"}`}>
            {label}
          </p>
          <p className="text-xl font-black tracking-tighter text-emerald-500">
            {formatCurrencySync(payload[0].value)}
          </p>
          {averageEarnings > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${payload[0].value >= averageEarnings ? "bg-emerald-500" : "bg-amber-500"}`} />
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-gray-400"}`}>
                {payload[0].value >= averageEarnings ? "Peak Efficiency" : "Standard Flow"}
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Compiling Ledger Data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`flex h-[300px] items-center justify-center rounded-[2.5rem] border-2 border-dashed ${isDark ? "border-white/5" : "border-gray-100"}`}>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">No throughput records available</p>
      </div>
    );
  }

  return (
    <div className="relative h-56 w-full sm:h-64" style={{ minHeight: "220px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 10 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity={1} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.9} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
            dy={10}
          />
          <YAxis
            tickFormatter={(value) => formatCurrencySync(value).replace(/[^\d]/g, "")}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 900, fill: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)" }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)", radius: 10 }} />
          <ReferenceLine
            y={averageEarnings}
            stroke="#10B981"
            strokeDasharray="5 5"
            strokeOpacity={0.3}
            label={{
              value: "AVG",
              position: "insideBottomRight",
              fill: "#10B981",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 2,
              opacity: 0.4
            }}
          />
          <Bar dataKey="earnings" name="Earnings" radius={[8, 8, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill="url(#barGradient)"
                className="transition-all duration-500 hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyEarningsChart;
