import React from 'react';

const LoadingOverlay: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75">
    <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-16 h-16 animate-spin"></div>
  </div>
);

export default LoadingOverlay; 