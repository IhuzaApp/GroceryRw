import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { 
  getNavigationDebugInfo, 
  logNavigation, 
  logPageAccess, 
  logRedirect,
  logAuthenticationCheck,
  navigationDebugger 
} from '../../src/lib/navigationDebug';
import { logAuth } from '../../src/lib/debugAuth';

export default function NavigationDebugTest() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);

  // Update debug info when component mounts or session changes
  useEffect(() => {
    const updateDebugInfo = () => {
      const info = getNavigationDebugInfo();
      setDebugInfo(info);
    };

    updateDebugInfo();
    
    // Update every 2 seconds to show real-time changes
    const interval = setInterval(updateDebugInfo, 2000);
    
    return () => clearInterval(interval);
  }, [session, status]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testNavigationLogging = () => {
    try {
      logNavigation('/test', '/debug/navigation-test', 'Manual test navigation', true, 'user', session);
      addTestResult('✅ Navigation logging test passed');
    } catch (error) {
      addTestResult(`❌ Navigation logging test failed: ${error}`);
    }
  };

  const testPageAccessLogging = () => {
    try {
      logPageAccess('NavigationDebugTest', true, 'user', session);
      addTestResult('✅ Page access logging test passed');
    } catch (error) {
      addTestResult(`❌ Page access logging test failed: ${error}`);
    }
  };

  const testRedirectLogging = () => {
    try {
      logRedirect('/debug/navigation-test', '/test-redirect', 'Manual test redirect', true, 'user');
      addTestResult('✅ Redirect logging test passed');
    } catch (error) {
      addTestResult(`❌ Redirect logging test failed: ${error}`);
    }
  };

  const testAuthCheckLogging = () => {
    try {
      logAuthenticationCheck('NavigationDebugTest', true, 'user', session);
      addTestResult('✅ Auth check logging test passed');
    } catch (error) {
      addTestResult(`❌ Auth check logging test failed: ${error}`);
    }
  };

  const simulatePageVisibilityChange = () => {
    try {
      // Simulate visibility change
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: !document.hidden
      });
      
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
      
      addTestResult('✅ Page visibility change simulation triggered');
    } catch (error) {
      addTestResult(`❌ Page visibility simulation failed: ${error}`);
    }
  };

  const simulateWindowFocus = () => {
    try {
      const event = new Event('focus');
      window.dispatchEvent(event);
      addTestResult('✅ Window focus simulation triggered');
    } catch (error) {
      addTestResult(`❌ Window focus simulation failed: ${error}`);
    }
  };

  const simulateWindowBlur = () => {
    try {
      const event = new Event('blur');
      window.dispatchEvent(event);
      addTestResult('✅ Window blur simulation triggered');
    } catch (error) {
      addTestResult(`❌ Window blur simulation failed: ${error}`);
    }
  };

  const clearNavigationHistory = () => {
    try {
      navigationDebugger.clearHistory();
      setDebugInfo(getNavigationDebugInfo());
      addTestResult('✅ Navigation history cleared');
    } catch (error) {
      addTestResult(`❌ Clear history failed: ${error}`);
    }
  };

  const exportNavigationHistory = () => {
    try {
      const exportData = navigationDebugger.exportHistory();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `navigation-debug-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addTestResult('✅ Navigation history exported');
    } catch (error) {
      addTestResult(`❌ Export failed: ${error}`);
    }
  };

  const runAllTests = () => {
    setTestResults([]);
    addTestResult('🚀 Starting navigation debug tests...');
    
    setTimeout(() => testNavigationLogging(), 100);
    setTimeout(() => testPageAccessLogging(), 200);
    setTimeout(() => testRedirectLogging(), 300);
    setTimeout(() => testAuthCheckLogging(), 400);
    setTimeout(() => simulatePageVisibilityChange(), 500);
    setTimeout(() => simulateWindowFocus(), 600);
    setTimeout(() => simulateWindowBlur(), 700);
    setTimeout(() => addTestResult('✅ All tests completed!'), 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Navigation Debug Test Suite</h1>
        
        {/* Current Session Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Status:</strong> {status}
            </div>
            <div>
              <strong>Authenticated:</strong> {status === 'authenticated' ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>User ID:</strong> {session?.user?.id || 'N/A'}
            </div>
            <div>
              <strong>User Role:</strong> {session?.user?.role || 'N/A'}
            </div>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testNavigationLogging}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Navigation
            </button>
            <button
              onClick={testPageAccessLogging}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Page Access
            </button>
            <button
              onClick={testRedirectLogging}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Test Redirect
            </button>
            <button
              onClick={testAuthCheckLogging}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test Auth Check
            </button>
            <button
              onClick={simulatePageVisibilityChange}
              className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
            >
              Simulate Visibility
            </button>
            <button
              onClick={simulateWindowFocus}
              className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
            >
              Simulate Focus
            </button>
            <button
              onClick={simulateWindowBlur}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Simulate Blur
            </button>
            <button
              onClick={runAllTests}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
            >
              Run All Tests
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click a test button above.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Navigation History */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Navigation History</h2>
            <div className="space-x-2">
              <button
                onClick={clearNavigationHistory}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
              >
                Clear History
              </button>
              <button
                onClick={exportNavigationHistory}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Export JSON
              </button>
            </div>
          </div>
          
          {debugInfo?.history?.length === 0 ? (
            <p className="text-gray-500">No navigation history yet.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {debugInfo?.history?.map((event: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-gray-50">
                  <div className="text-sm font-semibold">
                    {event.from} → {event.to}
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Reason:</strong> {event.reason} | 
                    <strong> Time:</strong> {new Date(event.timestamp).toLocaleTimeString()} |
                    <strong> Auth:</strong> {event.isAuthenticated ? 'Yes' : 'No'} |
                    <strong> Role:</strong> {event.userRole || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Navigations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Navigations (Last 10)</h2>
          {debugInfo?.recentNavigations?.length === 0 ? (
            <p className="text-gray-500">No recent navigations.</p>
          ) : (
            <div className="space-y-2">
              {debugInfo?.recentNavigations?.map((event: any, index: number) => (
                <div key={index} className="border-l-4 border-green-500 pl-4 py-2 bg-gray-50">
                  <div className="text-sm font-semibold">
                    {event.from} → {event.to}
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Reason:</strong> {event.reason} | 
                    <strong> Time:</strong> {new Date(event.timestamp).toLocaleTimeString()} |
                    <strong> Auth:</strong> {event.isAuthenticated ? 'Yes' : 'No'} |
                    <strong> Role:</strong> {event.userRole || 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Console Commands */}
        <div className="bg-gray-900 text-green-400 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 text-white">Console Commands</h2>
          <p className="text-sm mb-4 text-gray-300">
            You can also test the navigation debug utility directly in the browser console:
          </p>
          <div className="space-y-2 text-sm font-mono">
            <div>
              <span className="text-yellow-400">// Get navigation debug info</span>
            </div>
            <div className="text-blue-400">
              window.navigationDebugger = require('../../src/lib/navigationDebug').navigationDebugger;
            </div>
            <div className="text-blue-400">
              window.navigationDebugger.getNavigationHistory();
            </div>
            <div className="mt-4">
              <span className="text-yellow-400">// Test navigation logging</span>
            </div>
            <div className="text-blue-400">
              window.navigationDebugger.logNavigation('/test', '/debug', 'Console test', true, 'user');
            </div>
            <div className="mt-4">
              <span className="text-yellow-400">// Export history</span>
            </div>
            <div className="text-blue-400">
              console.log(window.navigationDebugger.exportHistory());
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
