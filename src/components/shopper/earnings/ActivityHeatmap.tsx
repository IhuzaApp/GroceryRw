import React from "react";

interface ActivityHeatmapProps {
  data?: number[][]; // Optional 2D array of activity levels (0-3)
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ data }) => {
  // If no data provided, generate random activity data
  const activityData = data || Array.from({ length: 24 }).map(() => 
    Array.from({ length: 7 }).map(() => Math.floor(Math.random() * 4))
  );

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="mt-8">
      <h3 className="font-medium mb-4">Busiest Times</h3>
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
      
      <div className="flex justify-between items-center mt-2">
        <div className="text-xs">Less active</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-100 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-300 rounded-sm"></div>
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
        </div>
        <div className="text-xs">More active</div>
      </div>
    </div>
  );
};

export default ActivityHeatmap; 