import React, { useState } from 'react';
import NavigationDebugDashboard from './NavigationDebugDashboard';

export default function DebugFloatingButton() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Floating Debug Button */}
      <button
        onClick={() => setIsDashboardOpen(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg hover:bg-red-600 z-40 transition-colors"
        title="Open Navigation Debug Dashboard"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Debug Dashboard */}
      <NavigationDebugDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
      />
    </>
  );
}
