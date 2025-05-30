import React from "react";

const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75">
    <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-purple-500 dark:border-gray-600 dark:border-t-purple-400"></div>
  </div>
);

export default LoadingOverlay;
