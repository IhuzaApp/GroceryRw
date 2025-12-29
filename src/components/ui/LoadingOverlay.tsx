import React from "react";
import { useTheme } from "@context/ThemeContext";

const LoadingOverlay: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${
        theme === "dark"
          ? "bg-gray-900/90 backdrop-blur-sm"
          : "bg-white/90 backdrop-blur-sm"
      }`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
      }}
    >
      <div className="flex flex-col items-center gap-4 px-4">
        {/* Logo with Animation */}
        <div className="relative transform transition-all duration-500">
          <img
            src="/assets/logos/PlasIcon.png"
            alt="Plas Logo"
            className="h-16 w-16 animate-pulse drop-shadow-lg sm:h-20 sm:w-20 md:h-24 md:w-24"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent sm:h-10 sm:w-10 md:h-12 md:w-12"></div>
          </div>
        </div>

        {/* Loading Text */}
        <span
          className={`animate-pulse text-sm font-medium sm:text-base md:text-lg ${
            theme === "dark" ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Loading...
        </span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
