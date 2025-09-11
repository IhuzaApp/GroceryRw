import React, { useState, useEffect } from "react";
import { useAuth } from "../src/context/AuthContext";
import { useSession } from "next-auth/react";
import { getAuthDebugInfo, authDebugger } from "../src/lib/debugAuth";

/**
 * Authentication Debug Page
 * 
 * This page provides comprehensive debugging information for authentication issues.
 * It shows real-time logs, session state, and allows testing of authentication flows.
 */

function DebugAuthPage() {
  const { isLoggedIn, user, role, authReady, isLoading, session } = useAuth();
  const { data: nextAuthSession, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = getAuthDebugInfo();
      setDebugInfo(info);
    };

    updateDebugInfo();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(updateDebugInfo, 2000); // Update every 2 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const clearLogs = () => {
    authDebugger.clearLogs();
    setDebugInfo(getAuthDebugInfo());
  };

  const exportLogs = () => {
    const logs = authDebugger.exportLogs();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-debug-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const testApiCall = async () => {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Test API call result:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });
    } catch (error) {
      console.error('Test API call error:', error);
    }
  };

  const testAuthenticatedApiCall = async () => {
    try {
      const { authenticatedFetch } = await import('../src/lib/authenticatedFetch');
      const response = await authenticatedFetch('/api/user');
      
      console.log('Test authenticated API call result:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
      });
    } catch (error) {
      console.error('Test authenticated API call error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            🔍 Authentication Debug Console
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded ${
                autoRefresh ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
              }`}
            >
              {autoRefresh ? '🔄 Auto Refresh ON' : '⏸️ Auto Refresh OFF'}
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              🗑️ Clear Logs
            </button>
            <button
              onClick={exportLogs}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              📥 Export Logs
            </button>
          </div>
        </div>

        {/* Current State */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Current Authentication State
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">AuthContext Ready:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  authReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {authReady ? '✅ Ready' : '❌ Not Ready'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Loading:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isLoading ? '⏳ Loading' : '✅ Not Loading'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Logged In:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Role:</span>
                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  {role || 'None'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">NextAuth Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  status === 'authenticated' ? 'bg-green-100 text-green-800' : 
                  status === 'loading' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              User Information
            </h2>
            {user ? (
              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {user.id || 'N/A'}</p>
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Profile Picture:</strong> {user.profilePicture ? '✅ Set' : '❌ Not Set'}</p>
              </div>
            ) : (
              <p className="text-gray-500">No user data available</p>
            )}
          </div>
        </div>

        {/* Test Buttons */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Test Authentication
          </h2>
          <div className="flex space-x-4">
            <button
              onClick={testApiCall}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Test Regular API Call
            </button>
            <button
              onClick={testAuthenticatedApiCall}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Test Authenticated API Call
            </button>
            <a
              href="/auth-test"
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Go to Auth Test Page
            </a>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Debug Logs ({debugInfo?.logs?.length || 0} entries)
          </h2>
          <div className="max-h-96 overflow-y-auto">
            {debugInfo?.recentLogs?.length > 0 ? (
              <div className="space-y-2">
                {debugInfo.recentLogs.map((log: any, index: number) => (
                  <div
                    key={index}
                    className={`rounded p-3 text-sm ${
                      log.action.includes('error') || log.action.includes('failed')
                        ? 'bg-red-50 border-l-4 border-red-400'
                        : log.action.includes('warn') || log.action.includes('redirect')
                        ? 'bg-yellow-50 border-l-4 border-yellow-400'
                        : log.action.includes('success') || log.action.includes('authenticated')
                        ? 'bg-green-50 border-l-4 border-green-400'
                        : 'bg-gray-50 border-l-4 border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        [{log.timestamp}] {log.location}: {log.action}
                      </span>
                      <span className="text-xs text-gray-500">
                        {log.url?.includes('localhost') ? 'Local' : 'Production'}
                      </span>
                    </div>
                    {log.data && (
                      <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No debug logs available</p>
            )}
          </div>
        </div>

        {/* Session Data */}
        {nextAuthSession && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              NextAuth Session Data
            </h2>
            <pre className="max-h-64 overflow-auto rounded bg-gray-100 p-4 text-sm">
              {JSON.stringify(nextAuthSession, null, 2)}
            </pre>
          </div>
        )}

        {/* System Information */}
        <div className="rounded-lg bg-gray-100 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            System Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 100) + '...' : 'N/A'}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
              <p><strong>Local Storage:</strong> {typeof window !== 'undefined' ? Object.keys(localStorage).length + ' items' : 'N/A'}</p>
              <p><strong>Session Storage:</strong> {typeof window !== 'undefined' ? Object.keys(sessionStorage).length + ' items' : 'N/A'}</p>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Cookies:</strong> {typeof window !== 'undefined' ? document.cookie.split(';').length + ' cookies' : 'N/A'}</p>
              <p><strong>Screen Size:</strong> {typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : 'N/A'}</p>
              <p><strong>Viewport:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</p>
              <p><strong>Online:</strong> {typeof window !== 'undefined' ? (navigator.onLine ? '✅ Yes' : '❌ No') : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DebugAuthPage;
