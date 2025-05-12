import React from "react";

interface ActivityHeatmapProps {
  data?: number[][]; // Optional 2D array of activity levels (0-3)
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  // If no data provided, generate random activity data
  const activityData =
    data ||
    Array.from({ length: 24 }).map(() =>
      Array.from({ length: 7 }).map(() => Math.floor(Math.random() * 4))
    );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="mt-8">
      <h3 className="mb-4 font-medium">Busiest Times</h3>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <div key={i} className="text-center text-xs font-medium">
            {day}
          </div>
        ))}

        {activityData.map((hours, hourIndex) =>
          hours.map((activityLevel, dayIndex) => {
            let bgColor = "bg-gray-100";
            if (activityLevel === 1) bgColor = "bg-green-100";
            if (activityLevel === 2) bgColor = "bg-green-300";
            if (activityLevel === 3) bgColor = "bg-green-500";

            return (
              <div
                key={`${hourIndex}-${dayIndex}`}
                className={`h-3 ${bgColor} rounded-sm`}
                title={`${days[dayIndex]} ${hourIndex}:00`}
              ></div>
            );
          })
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-xs">Less active</div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-gray-100"></div>
          <div className="h-3 w-3 rounded-sm bg-green-100"></div>
          <div className="h-3 w-3 rounded-sm bg-green-300"></div>
          <div className="h-3 w-3 rounded-sm bg-green-500"></div>
        </div>
        <div className="text-xs">More active</div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
