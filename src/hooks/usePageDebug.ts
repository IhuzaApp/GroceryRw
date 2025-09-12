/**
 * Page Debugging Hook
 * 
 * This hook provides debugging capabilities for individual pages to track
 * navigation, authentication state, and redirect issues.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useAuth } from '../context/AuthContext';
import { logPageAccess, logAuthenticationCheck, logRedirect } from '../lib/navigationDebug';
import { logAuth } from '../lib/debugAuth';

interface PageDebugOptions {
  pageName: string;
  requireAuth?: boolean;
  allowedRoles?: string[];
  debugLevel?: 'minimal' | 'normal' | 'verbose';
}

export const usePageDebug = (options: PageDebugOptions) => {
  const { pageName, requireAuth = true, allowedRoles = [], debugLevel = 'normal' } = options;
  const router = useRouter();
  const { data: session, status } = useSession();
  const { isLoggedIn, user, role, authReady, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Log page access and authentication state
  useEffect(() => {
    const currentPath = router.asPath;
    const isAuthenticated = status === "authenticated";
    const userRole = (session?.user as any)?.role || "user";

    // Log page access
    logPageAccess(pageName, isAuthenticated, userRole, session);
    logAuthenticationCheck(pageName, isAuthenticated, userRole, session);

    // Log detailed debug info
    if (debugLevel === 'verbose') {
      logAuth('PageDebug', 'page_access_verbose', {
        pageName,
        currentPath,
        status,
        isAuthenticated,
        userRole,
        hasSession: !!session,
        isLoggedIn,
        authReady,
        isLoading,
        requireAuth,
        allowedRoles,
        timestamp: Date.now(),
      });
    }

    // Update debug info
    setDebugInfo({
      pageName,
      currentPath,
      status,
      isAuthenticated,
      userRole,
      hasSession: !!session,
      isLoggedIn,
      authReady,
      isLoading,
      requireAuth,
      allowedRoles,
      timestamp: Date.now(),
    });

    setIsInitialized(true);
  }, [pageName, status, session, isLoggedIn, user, role, authReady, isLoading, router.asPath, requireAuth, allowedRoles, debugLevel]);

  // Log authentication state changes
  useEffect(() => {
    if (!isInitialized) return;

    const currentPath = router.asPath;
    const isAuthenticated = status === "authenticated";
    const userRole = (session?.user as any)?.role || "user";

    logAuth('PageDebug', 'auth_state_change', {
      pageName,
      currentPath,
      status,
      isAuthenticated,
      userRole,
      hasSession: !!session,
      isLoggedIn,
      authReady,
      isLoading,
      timestamp: Date.now(),
    });

    // Check for authentication issues
    if (requireAuth && status === "unauthenticated" && isInitialized) {
      logRedirect(currentPath, '/Auth/Login', 'User not authenticated on page', false);
      
      logAuth('PageDebug', 'auth_issue_detected', {
        pageName,
        currentPath,
        issue: 'User not authenticated',
        status,
        isLoggedIn,
        authReady,
        timestamp: Date.now(),
      });
    }

    // Check for role issues
    if (requireAuth && isAuthenticated && allowedRoles.length > 0) {
      const hasAccess = allowedRoles.includes(userRole);
      
      if (!hasAccess) {
        logRedirect(currentPath, '/', 'Insufficient role permissions on page', true, userRole);
        
        logAuth('PageDebug', 'role_issue_detected', {
          pageName,
          currentPath,
          issue: 'Insufficient role permissions',
          userRole,
          allowedRoles,
          timestamp: Date.now(),
        });
      }
    }
  }, [status, session, isLoggedIn, authReady, isLoading, isInitialized, pageName, router.asPath, requireAuth, allowedRoles]);

  // Log navigation events
  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      logAuth('PageDebug', 'navigation_start', {
        pageName,
        from: router.asPath,
        to: url,
        timestamp: Date.now(),
      });
    };

    const handleRouteChangeComplete = (url: string) => {
      logAuth('PageDebug', 'navigation_complete', {
        pageName,
        from: router.asPath,
        to: url,
        timestamp: Date.now(),
      });
    };

    const handleRouteChangeError = (err: any, url: string) => {
      logAuth('PageDebug', 'navigation_error', {
        pageName,
        from: router.asPath,
        to: url,
        error: err.message || String(err),
        timestamp: Date.now(),
      });
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [pageName, router]);

  // Log page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      logAuth('PageDebug', 'visibility_change', {
        pageName,
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: Date.now(),
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pageName]);

  // Log page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      logAuth('PageDebug', 'page_unload', {
        pageName,
        currentPath: router.asPath,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [pageName, router.asPath]);

  return {
    debugInfo,
    isInitialized,
    // Helper functions
    logCustomEvent: (event: string, data: any) => {
      logAuth('PageDebug', `custom_event_${event}`, {
        pageName,
        ...data,
        timestamp: Date.now(),
      });
    },
    logError: (error: string, details: any) => {
      logAuth('PageDebug', 'page_error', {
        pageName,
        error,
        details,
        timestamp: Date.now(),
      });
    },
    logSuccess: (message: string, data: any) => {
      logAuth('PageDebug', 'page_success', {
        pageName,
        message,
        ...data,
        timestamp: Date.now(),
      });
    },
  };
};
