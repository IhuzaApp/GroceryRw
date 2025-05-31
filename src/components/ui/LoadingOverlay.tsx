import React from "react";
import { useTheme } from "@context/ThemeContext";

const LoadingOverlay: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        theme === 'dark' 
          ? 'bg-gray-900/75 backdrop-blur-sm' 
          : 'bg-white/75 backdrop-blur-sm'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        <div 
          className={`h-16 w-16 animate-spin rounded-full border-4 ${
            theme === 'dark'
              ? 'border-gray-700 border-t-green-400'
              : 'border-gray-200 border-t-green-500'
          }`}
        />
        <span 
          className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          Loading...
        </span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
