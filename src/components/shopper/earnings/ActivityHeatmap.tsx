import React, { useState, useEffect } from "react";
import { Loader } from "rsuite";
import { useTheme } from "../../../context/ThemeContext";

interface ActivityHeatmapProps {
  data?: number[][]; // Optional 2D array of activity levels (0-3)
  hideSummary?: boolean; // Option to hide the summary stats
}

interface ActivitySummary {
  totalOrders: number;
  busiestDay: string;
  busiestDayCount: number;
  busiestHour: string;
  busiestHourCount: number;
  ordersByDay: number[];
  ordersByHour: number[];
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  data,
  hideSummary = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activityData, setActivityData] = useState<number[][]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If data is provided as prop, use it
    if (data) {
      setActivityData(data);
      setLoading(false);
      return;
    }

    // Otherwise fetch the data from the API
    const fetchActivityData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/shopper/activityHeatmap");
        if (!response.ok) {
          throw new Error("Failed to fetch activity data");
        }
        const result = await response.json();
        if (result.success) {
          setActivityData(result.activityData);
          setSummary(result.summary);
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (err) {
        console.error("Error fetching activity data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [data]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center py-12">
        <Loader size="md" content="Syncing Heatmap..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/5 p-8 text-center text-red-500">
        <p className="text-xs font-black uppercase tracking-widest">
          Analysis Failed
        </p>
      </div>
    );
  }

  // Use random data if activityData is empty
  const finalActivityData =
    activityData.length > 0
      ? activityData
      : hours.map(() => days.map(() => Math.floor(Math.random() * 4)));

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-xl font-black tracking-tight">
            Activity Patterns
          </h3>
          <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest opacity-40">
            Heatmap Distribution
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isDark ? "bg-white/10" : "bg-black/5"
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Low
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Peak
            </span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <div
        className={`rounded-[2.5rem] p-6 lg:p-8 ${
          isDark
            ? "border border-white/10 bg-white/5"
            : "border border-black/5 bg-white shadow-sm"
        }`}
      >
        {/* Day labels */}
        <div className="mb-4 flex">
          <div className="w-12 pr-4" />
          <div className="grid flex-1 grid-cols-7 gap-2 lg:gap-3">
            {days.map((day, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-black uppercase tracking-widest opacity-30"
              >
                {day}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap Rows */}
        <div className="space-y-2 lg:space-y-3">
          {hours.map((hour, hourIndex) => (
            <div key={hourIndex} className="flex items-center">
              {/* Hour label */}
              <div className="w-12 pr-4 text-right text-[10px] font-black tabular-nums opacity-30">
                {hour}:00
              </div>

              {/* Intensity Pills */}
              <div className="grid flex-1 grid-cols-7 gap-2 lg:gap-3">
                {days.map((_, dayIndex) => {
                  const activityLevel = finalActivityData[hourIndex][dayIndex];

                  let cellClasses = "";
                  if (activityLevel === 0)
                    cellClasses = isDark
                      ? "bg-white/[0.03]"
                      : "bg-black/[0.03]";
                  if (activityLevel === 1) cellClasses = "bg-emerald-500/20";
                  if (activityLevel === 2)
                    cellClasses =
                      "bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]";
                  if (activityLevel === 3)
                    cellClasses =
                      "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";

                  return (
                    <div
                      key={`${hourIndex}-${dayIndex}`}
                      className={`h-4 rounded-full transition-all duration-500 hover:scale-125 lg:h-5 ${cellClasses}`}
                      title={`${days[dayIndex]} ${hour}:00 - Level ${activityLevel}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {summary && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <div
            className={`h-1 w-1 animate-pulse rounded-full bg-emerald-500`}
          />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-30">
            Insights based on {summary.totalOrders} total completed orders
          </p>
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;
