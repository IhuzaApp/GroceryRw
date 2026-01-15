import React from "react";

interface BusyAreasToggleProps {
  showBusyAreas: boolean;
  setShowBusyAreas: (show: boolean) => void;
  theme: "light" | "dark";
}

const BusyAreasToggle: React.FC<BusyAreasToggleProps> = ({
  showBusyAreas,
  setShowBusyAreas,
  theme,
}) => {
  return (
    <button
      onClick={() => setShowBusyAreas(!showBusyAreas)}
      className={`absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-lg px-4 py-2.5 font-semibold shadow-lg backdrop-blur-lg transition-all duration-200 hover:shadow-xl active:scale-95 ${
        showBusyAreas
          ? theme === "dark"
            ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-purple-500/30 hover:shadow-purple-500/40"
            : "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30 hover:shadow-purple-500/40"
          : theme === "dark"
          ? "border border-gray-700/50 bg-gray-800/90 text-gray-100 hover:bg-gray-700/90"
          : "border border-gray-200/50 bg-white/90 text-gray-900 hover:bg-gray-50/90"
      }`}
      title={showBusyAreas ? "Hide busy areas" : "Show busy areas"}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      </svg>
      <span className="hidden md:inline">
        {showBusyAreas ? "Hide" : "Show"} Busy Areas
      </span>
      {showBusyAreas && <span className="text-xs opacity-80">🔥</span>}
    </button>
  );
};

export default BusyAreasToggle;
