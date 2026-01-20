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
      <div className="mt-8">
        <h3
          className={`mb-4 font-medium ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Busiest Times
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader size="md" content="Loading activity data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h3
          className={`mb-4 font-medium ${
            theme === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Busiest Times
        </h3>
        <div className="py-4 text-center text-red-500">
          Error loading activity data
        </div>
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
      <h3
        className={`mb-4 font-medium ${
          theme === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Busiest Times
      </h3>

      {/* Summary Stats */}
      {summary && !hideSummary && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div
            className={`rounded-lg p-3 ${
              theme === "dark" ? "bg-gray-800" : "bg-green-50"
            }`}
          >
            <div
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Busiest Day
            </div>
            <div
              className={`mt-1 text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {summary.busiestDay}
            </div>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {summary.busiestDayCount} orders (
              {Math.round(
                (summary.busiestDayCount / summary.totalOrders) * 100
              )}
              % of total)
            </div>
          </div>
          <div
            className={`rounded-lg p-3 ${
              theme === "dark" ? "bg-gray-800" : "bg-green-50"
            }`}
          >
            <div
              className={`text-sm ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Busiest Hour
            </div>
            <div
              className={`mt-1 text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {summary.busiestHour}
            </div>
            <div
              className={`text-xs ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {summary.busiestHourCount} orders (
              {Math.round(
                (summary.busiestHourCount / summary.totalOrders) * 100
              )}
              % of total)
            </div>
          </div>
        </div>
      )}

      {/* Time labels (hours) */}
      <div className="mb-2 flex">
        <div className="w-10 pr-2 text-right text-xs"></div>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div
              key={i}
              className={`text-center text-xs font-medium ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap grid with hour labels */}
      {hours.map((hour, hourIndex) => (
        <div key={hourIndex} className="mb-1 flex items-center">
          {/* Hour label */}
          <div
            className={`w-10 pr-2 text-right text-xs ${
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {hour}:00
          </div>

          {/* Day cells for this hour */}
          <div className="grid flex-1 grid-cols-7 gap-1">
            {days.map((_, dayIndex) => {
              const activityLevel = finalActivityData[hourIndex][dayIndex];
              let bgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-100";
              if (activityLevel === 1) bgColor = "bg-green-100";
              if (activityLevel === 2) bgColor = "bg-green-300";
              if (activityLevel === 3) bgColor = "bg-green-500";

              return (
                <div
                  key={`${hourIndex}-${dayIndex}`}
                  className={`h-4 ${bgColor} rounded-sm`}
                  title={`${days[dayIndex]} ${hour}:00`}
                ></div>
              );
            })}
          </div>
        </div>
      ))}

      <div
        className={`mt-2 flex items-center justify-between ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        }`}
      >
        <div className="text-xs">Less active</div>
        <div className="flex items-center gap-1">
          <div
            className={`h-3 w-3 rounded-sm ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-100"
            }`}
          ></div>
          <div className="h-3 w-3 rounded-sm bg-green-100"></div>
          <div className="h-3 w-3 rounded-sm bg-green-300"></div>
          <div className="h-3 w-3 rounded-sm bg-green-500"></div>
        </div>
        <div className="text-xs">More active</div>
      </div>

      {summary && (
        <div
          className={`mt-4 text-center text-xs ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Based on analysis of {summary.totalOrders} total orders
        </div>
      )}
    </div>
  );
};

export default ActivityHeatmap;
