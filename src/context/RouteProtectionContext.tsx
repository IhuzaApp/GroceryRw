import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

// Define route access levels
export type RouteAccessLevel = 'public' | 'protected' | 'shopper-only' | 'conditional';

// Define route protection rules
interface RouteProtectionRule {
  path: string;
  accessLevel: RouteAccessLevel;
  requiresAuth?: boolean;
  requiresRole?: 'user' | 'shopper';
  allowGuestView?: boolean; // For cart-like pages
  redirectTo?: string;
}

// Route protection configuration
const ROUTE_PROTECTION_RULES: RouteProtectionRule[] = [
  // Public routes - no authentication required
  { path: '/', accessLevel: 'public' },
  { path: '/Reels', accessLevel: 'public' },
  { path: '/shops', accessLevel: 'public' },
  { path: '/shops/[id]', accessLevel: 'public' },
  { path: '/Auth/Login', accessLevel: 'public' },
  { path: '/Auth/Register', accessLevel: 'public' },
  
  // Conditional routes - can view but need auth for actions
  { 
    path: '/Cart', 
    accessLevel: 'conditional',
    allowGuestView: true,
    requiresAuth: true // For adding items
  },
  
  // Shopper-only routes
  { 
    path: '/Plasa', 
    accessLevel: 'shopper-only',
    requiresRole: 'shopper',
    redirectTo: '/'
  },
  
  // Protected routes - require authentication
  { path: '/Myprofile', accessLevel: 'protected', requiresAuth: true },
  { path: '/Messages', accessLevel: 'protected', requiresAuth: true },
  { path: '/CurrentPendingOrders', accessLevel: 'protected', requiresAuth: true },
  { path: '/Recipes', accessLevel: 'protected', requiresAuth: true },
  { path: '/restaurant', accessLevel: 'protected', requiresAuth: true },
];

interface RouteProtectionContextType {
  canAccessRoute: (path: string) => boolean;
  canPerformAction: (path: string, action: string) => boolean;
  getRequiredAuth: (path: string) => boolean;
  getRequiredRole: (path: string) => 'user' | 'shopper' | null;
  isPublicRoute: (path: string) => boolean;
  isConditionalRoute: (path: string) => boolean;
  getRedirectPath: (path: string) => string | null;
}

const RouteProtectionContext = createContext<RouteProtectionContextType>({
  canAccessRoute: () => false,
  canPerformAction: () => false,
  getRequiredAuth: () => false,
  getRequiredRole: () => null,
  isPublicRoute: () => false,
  isConditionalRoute: () => false,
  getRedirectPath: () => null,
});

export const RouteProtectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isLoggedIn, role, authReady } = useAuth();
  const router = useRouter();

  // Helper function to match dynamic routes
  const matchRoute = (path: string, rule: RouteProtectionRule): boolean => {
    // Exact match
    if (path === rule.path) return true;
    
    // Dynamic route match (e.g., /shops/[id])
    if (rule.path.includes('[id]')) {
      const pattern = rule.path.replace('[id]', '[^/]+');
      const regex = new RegExp(`^${pattern}(/.*)?$`);
      return regex.test(path);
    }
    
    // Prefix match for nested routes
    if (rule.path.endsWith('/') && path.startsWith(rule.path)) {
      return true;
    }
    
    // Check if path starts with rule path (for nested routes)
    return path.startsWith(rule.path + '/');
  };

  // Find rule for a given path
  const findRule = (path: string): RouteProtectionRule | null => {
    return ROUTE_PROTECTION_RULES.find(rule => matchRoute(path, rule)) || null;
  };

  // Check if user can access a route
  const canAccessRoute = (path: string): boolean => {
    const rule = findRule(path);
    
    if (!rule) {
      // Default: require authentication for unknown routes
      return isLoggedIn;
    }

    switch (rule.accessLevel) {
      case 'public':
        return true;
      
      case 'protected':
        return isLoggedIn;
      
      case 'shopper-only':
        return isLoggedIn && role === 'shopper';
      
      case 'conditional':
        return true; // Can always view, but actions may require auth
      
      default:
        return isLoggedIn;
    }
  };

  // Check if user can perform a specific action on a route
  const canPerformAction = (path: string, action: string): boolean => {
    const rule = findRule(path);
    
    if (!rule) {
      return isLoggedIn;
    }

    // For conditional routes, check if action requires auth
    if (rule.accessLevel === 'conditional') {
      if (action === 'addToCart' || action === 'checkout' || action === 'placeOrder') {
        return isLoggedIn;
      }
      return true; // Other actions like 'view' are allowed
    }

    return canAccessRoute(path);
  };

  // Get required authentication for a route
  const getRequiredAuth = (path: string): boolean => {
    const rule = findRule(path);
    return rule?.requiresAuth || false;
  };

  // Get required role for a route
  const getRequiredRole = (path: string): 'user' | 'shopper' | null => {
    const rule = findRule(path);
    return rule?.requiresRole || null;
  };

  // Check if route is public
  const isPublicRoute = (path: string): boolean => {
    const rule = findRule(path);
    return rule?.accessLevel === 'public';
  };

  // Check if route is conditional
  const isConditionalRoute = (path: string): boolean => {
    const rule = findRule(path);
    return rule?.accessLevel === 'conditional';
  };

  // Get redirect path for unauthorized access
  const getRedirectPath = (path: string): string | null => {
    const rule = findRule(path);
    return rule?.redirectTo || null;
  };

  // Auto-redirect logic for unauthorized access
  useEffect(() => {
    if (!authReady) return;

    const currentPath = router.asPath.split('?')[0]; // Remove query params
    
    if (!canAccessRoute(currentPath)) {
      const redirectPath = getRedirectPath(currentPath);
      
      if (redirectPath) {
        router.push(redirectPath);
      } else if (!isLoggedIn) {
        // Redirect to login with callback URL
        const loginUrl = `/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`;
        router.push(loginUrl);
      } else {
        // Redirect to home for role-based restrictions
        router.push('/');
      }
    }
  }, [authReady, isLoggedIn, role, router.asPath]);

  const value: RouteProtectionContextType = {
    canAccessRoute,
    canPerformAction,
    getRequiredAuth,
    getRequiredRole,
    isPublicRoute,
    isConditionalRoute,
    getRedirectPath,
  };

  return (
    <RouteProtectionContext.Provider value={value}>
      {children}
    </RouteProtectionContext.Provider>
  );
};

export const useRouteProtection = () => {
  const context = useContext(RouteProtectionContext);
  if (!context) {
    throw new Error('useRouteProtection must be used within a RouteProtectionProvider');
  }
  return context;
};

// Higher-order component for protecting pages
export const withRouteProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    requireAuth?: boolean;
    requireRole?: 'user' | 'shopper';
    allowGuestView?: boolean;
  }
) => {
  return function ProtectedComponent(props: P) {
    const { isLoggedIn, role, authReady } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      if (!authReady) return;

      const { requireAuth = true, requireRole, allowGuestView = false } = options || {};

      if (requireAuth && !isLoggedIn) {
        if (allowGuestView) {
          setIsAuthorized(true);
        } else {
          router.push(`/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`);
        }
        return;
      }

      if (requireRole && role !== requireRole) {
        router.push('/');
        return;
      }

      setIsAuthorized(true);
    }, [authReady, isLoggedIn, role, router.asPath]);

    if (!authReady || !isAuthorized) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-white transition-colors duration-200 dark:bg-gray-900">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};
