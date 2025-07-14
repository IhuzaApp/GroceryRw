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
}

const DailyEarningsChart: React.FC<DailyEarningsChartProps> = ({
  data = [],
  isLoading = false,
  period = "this-week",
}) => {
  // Format currency in RWF
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: getCurrencySymbol(),
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
        <div className="rounded bg-gray-800 p-3 text-white shadow-lg">
          <p className="mb-1 text-sm font-medium">{label}</p>
          <p className="text-base font-bold text-green-300">
            {formatCurrency(payload[0].value)}
          </p>
          {averageEarnings > 0 && (
            <p className="mt-1 text-xs text-gray-300">
              {payload[0].value > averageEarnings
                ? `${Math.round(
                    (payload[0].value / averageEarnings - 1) * 100
                  )}% above average`
                : payload[0].value < averageEarnings
                ? `${Math.round(
                    (1 - payload[0].value / averageEarnings) * 100
                  )}% below average`
                : "At average"}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // If loading, show a loader
  if (isLoading) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <Loader size="md" content="Loading earnings data..." />
      </div>
    );
  }

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <p className="text-gray-500">
          No earnings data available for this period
        </p>
      </div>
    );
  }

  // Determine chart title based on period
  const getChartTitle = () => {
    switch (period) {
      case "today":
        return "Hourly Earnings Today";
      case "this-week":
        return "Daily Earnings This Week";
      case "last-week":
        return "Daily Earnings Last Week";
      case "this-month":
        return "Weekly Earnings This Month";
      case "last-month":
        return "Weekly Earnings Last Month";
      default:
        return "Earnings";
    }
  };

  // Colors for the bars - gradient from light to dark green
  const barColors = [
    "#10B981",
    "#059669",
    "#047857",
    "#065F46",
    "#064E3B",
    "#022C22",
    "#064E3B",
  ];

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "2/1", minHeight: "300px" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) =>
              formatCurrency(value).replace(getCurrencySymbol(), "")
            }
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={() => getChartTitle()} />
          <ReferenceLine
            y={averageEarnings}
            stroke="#4B5563"
            strokeDasharray="3 3"
            label={{
              value: "Average",
              position: "insideBottomRight",
              fill: "#4B5563",
              fontSize: 10,
            }}
          />
          <Bar dataKey="earnings" name="Earnings" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.earnings > averageEarnings ? "#059669" : "#10B981"}
                stroke={
                  entry.earnings > averageEarnings ? "#047857" : "#059669"
                }
                strokeWidth={1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyEarningsChart;
