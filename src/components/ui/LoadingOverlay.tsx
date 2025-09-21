import React from "react";
import { useTheme } from "@context/ThemeContext";

const LoadingOverlay: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === "dark"
          ? "bg-gray-900/75 backdrop-blur-sm"
          : "bg-white/75 backdrop-blur-sm"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Logo with Animation */}
        <div className="transform transition-all duration-500 hover:scale-105">
          <img 
            src="/assets/logos/PlasLogo.svg" 
            alt="Plasa Logo" 
            className="h-16 w-auto drop-shadow-lg"
          />
        </div>
        
        {/* Loading Text */}
        <span
          className={`text-sm font-medium animate-pulse ${
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
