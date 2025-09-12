import React from "react";
import { useAuth } from "../hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: "user" | "shopper";
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = false,
  requireRole,
  fallback = (
    <div className="flex h-screen w-screen items-center justify-center bg-white transition-colors duration-200 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  ),
}) => {
  const {
    isLoggedIn,
    isLoading,
    role,
    requireAuth: checkAuth,
    requireRole: checkRole,
  } = useAuth();

  // Show loading state
  if (isLoading) {
    return <>{fallback}</>;
  }

  // Check authentication requirement
  if (requireAuth && !isLoggedIn) {
    checkAuth();
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requireRole && isLoggedIn && role !== requireRole) {
    checkRole(requireRole);
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
