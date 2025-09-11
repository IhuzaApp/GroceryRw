import React from "react";
import { useAuth } from "../src/context/AuthContext";
import { useSession } from "next-auth/react";
import { withAuth } from "../src/components/auth/withAuth";

/**
 * Authentication Test Page
 * 
 * This page helps verify that authentication is working correctly.
 * It shows the current authentication state and allows testing navigation.
 */

function AuthTestPage() {
  const { isLoggedIn, user, role, authReady, isLoading, session } = useAuth();
  const { data: nextAuthSession, status } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          🔐 Authentication Test Page
        </h1>

        {/* Authentication Status */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Authentication Status
          </h2>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">AuthContext Ready:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  authReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {authReady ? '✅ Ready' : '❌ Not Ready'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Loading:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isLoading ? '⏳ Loading' : '✅ Not Loading'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Logged In:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Role:</span>
                <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                  {role || 'None'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">NextAuth Status:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  status === 'authenticated' ? 'bg-green-100 text-green-800' : 
                  status === 'loading' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {status}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="font-medium">Session Exists:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  !!nextAuthSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {nextAuthSession ? '✅ Yes' : '❌ No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              User Information
            </h2>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p><strong>ID:</strong> {user.id || 'N/A'}</p>
                <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Profile Picture:</strong> {user.profilePicture ? '✅ Set' : '❌ Not Set'}</p>
                <p><strong>Role:</strong> {role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Session Data */}
        {nextAuthSession && (
          <div className="mb-8 rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              NextAuth Session Data
            </h2>
            
            <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
              {JSON.stringify(nextAuthSession, null, 2)}
            </pre>
          </div>
        )}

        {/* Navigation Test */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Navigation Test
          </h2>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <a
              href="/Myprofile"
              className="rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600"
            >
              My Profile
            </a>
            <a
              href="/Plasa/Earnings"
              className="rounded bg-green-500 px-4 py-2 text-center text-white hover:bg-green-600"
            >
              Plasa Earnings
            </a>
            <a
              href="/CurrentPendingOrders"
              className="rounded bg-purple-500 px-4 py-2 text-center text-white hover:bg-purple-600"
            >
              Pending Orders
            </a>
            <a
              href="/Cart"
              className="rounded bg-orange-500 px-4 py-2 text-center text-white hover:bg-orange-600"
            >
              Cart
            </a>
          </div>
        </div>

        {/* Debug Information */}
        <div className="rounded-lg bg-gray-100 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Debug Information
          </h2>
          
          <div className="space-y-2 text-sm">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</p>
            <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Protect this page with authentication
export default withAuth(AuthTestPage, {
  requireAuth: true,
  allowedRoles: ['user', 'shopper']
});
