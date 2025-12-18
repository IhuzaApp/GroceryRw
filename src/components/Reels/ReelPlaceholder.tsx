import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ReelPlaceholder = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`relative w-full animate-pulse snap-start overflow-hidden ${
        theme === "dark" ? "bg-gray-900" : "bg-white"
      }`}
      style={{
        height: "100vh",
        minHeight: "100vh",
      }}
    >
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
            <div
              className={`h-4 w-24 rounded ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-6 w-20 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
            <div
              className={`h-6 w-20 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex items-end gap-4">
          {/* Main Info (Left) */}
          <div className="flex-1 space-y-3">
            <div
              className={`h-5 w-3/4 rounded ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
            <div className="space-y-2">
              <div
                className={`h-3 w-full rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`}
              />
              <div
                className={`h-3 w-5/6 rounded ${
                  theme === "dark" ? "bg-gray-700" : "bg-gray-300"
                }`}
              />
            </div>
            <div
              className={`h-12 w-full rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
          </div>

          {/* Side Actions (Right) */}
          <div className="flex flex-col items-center gap-5">
            <div
              className={`h-14 w-14 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
            <div
              className={`h-14 w-14 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
            <div
              className={`h-14 w-14 rounded-full ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelPlaceholder;
