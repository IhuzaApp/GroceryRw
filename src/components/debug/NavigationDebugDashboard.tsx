import React, { useState, useEffect } from 'react';
import { getNavigationDebugInfo } from '../../lib/navigationDebug';

interface NavigationDebugDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavigationDebugDashboard({ isOpen, onClose }: NavigationDebugDashboardProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const updateDebugInfo = () => {
      const info = getNavigationDebugInfo();
      setDebugInfo(info);
    };

    updateDebugInfo();

    if (autoRefresh) {
      const interval = setInterval(updateDebugInfo, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, autoRefresh]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Navigation Debug Dashboard</h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto-refresh</span>
            </label>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {debugInfo?.history?.length || 0}
              </div>
              <div className="text-sm text-blue-800">Total Navigations</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {debugInfo?.recentNavigations?.length || 0}
              </div>
              <div className="text-sm text-green-800">Recent Navigations</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {debugInfo?.history?.filter((h: any) => h.isAuthenticated).length || 0}
              </div>
              <div className="text-sm text-purple-800">Authenticated</div>
            </div>
          </div>

          {/* Recent Navigations */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Recent Navigations</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {debugInfo?.recentNavigations?.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent navigations</p>
              ) : (
                debugInfo?.recentNavigations?.map((event: any, index: number) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50 rounded">
                    <div className="text-sm font-semibold">
                      {event.from} → {event.to}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Reason:</strong> {event.reason} | 
                      <strong> Time:</strong> {new Date(event.timestamp).toLocaleTimeString()} |
                      <strong> Auth:</strong> {event.isAuthenticated ? '✅' : '❌'} |
                      <strong> Role:</strong> {event.userRole || 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* All Navigation History */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">All Navigation History</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {debugInfo?.history?.length === 0 ? (
                <p className="text-gray-500 text-sm">No navigation history</p>
              ) : (
                debugInfo?.history?.map((event: any, index: number) => (
                  <div key={index} className="border-l-4 border-gray-400 pl-4 py-2 bg-gray-50 rounded">
                    <div className="text-sm font-semibold">
                      {event.from} → {event.to}
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>Reason:</strong> {event.reason} | 
                      <strong> Time:</strong> {new Date(event.timestamp).toLocaleTimeString()} |
                      <strong> Auth:</strong> {event.isAuthenticated ? '✅' : '❌'} |
                      <strong> Role:</strong> {event.userRole || 'N/A'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Export Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Export Data</h3>
            <div className="space-x-2">
              <button
                onClick={() => {
                  const exportData = debugInfo?.exportLogs || '{}';
                  const blob = new Blob([exportData], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `navigation-debug-${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              >
                Export JSON
              </button>
              <button
                onClick={() => {
                  console.log('Navigation Debug Info:', debugInfo);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600"
              >
                Log to Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
