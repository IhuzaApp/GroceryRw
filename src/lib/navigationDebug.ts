/**
 * Navigation Debugging Utility
 * 
 * This utility provides comprehensive debugging for page navigation and redirects.
 * It helps identify why users are being redirected to login even when authenticated.
 */

import { logAuth, logRouteNavigation } from "./debugAuth";

interface NavigationEvent {
  from: string;
  to: string;
  timestamp: number;
  reason: string;
  isAuthenticated: boolean;
  userRole?: string;
  sessionData?: any;
}

class NavigationDebugger {
  private static instance: NavigationDebugger;
  private navigationHistory: NavigationEvent[] = [];
  private maxHistory = 50;

  static getInstance(): NavigationDebugger {
    if (!NavigationDebugger.instance) {
      NavigationDebugger.instance = new NavigationDebugger();
    }
    return NavigationDebugger.instance;
  }

  private constructor() {
    this.setupNavigationTracking();
  }

  private setupNavigationTracking() {
    if (typeof window === 'undefined') return;

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      logAuth('NavigationDebug', 'visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: Date.now(),
      });
    });

    // Track beforeunload events
    window.addEventListener('beforeunload', (event) => {
      logAuth('NavigationDebug', 'before_unload', {
        currentUrl: window.location.href,
        timestamp: Date.now(),
      });
    });

    // Track page load events
    window.addEventListener('load', () => {
      logAuth('NavigationDebug', 'page_loaded', {
        url: window.location.href,
        referrer: document.referrer,
        timestamp: Date.now(),
      });
    });

    // Track focus events
    window.addEventListener('focus', () => {
      logAuth('NavigationDebug', 'window_focused', {
        url: window.location.href,
        timestamp: Date.now(),
      });
    });

    // Track blur events
    window.addEventListener('blur', () => {
      logAuth('NavigationDebug', 'window_blurred', {
        url: window.location.href,
        timestamp: Date.now(),
      });
    });
  }

  logNavigation(from: string, to: string, reason: string, isAuthenticated: boolean, userRole?: string, sessionData?: any) {
    const event: NavigationEvent = {
      from,
      to,
      timestamp: Date.now(),
      reason,
      isAuthenticated,
      userRole,
      sessionData,
    };

    this.navigationHistory.push(event);
    
    // Keep only last maxHistory entries
    if (this.navigationHistory.length > this.maxHistory) {
      this.navigationHistory = this.navigationHistory.slice(-this.maxHistory);
    }

    logRouteNavigation(from, to, isAuthenticated, userRole);
    
    logAuth('NavigationDebug', 'navigation_event', {
      from,
      to,
      reason,
      isAuthenticated,
      userRole,
      sessionData: sessionData ? {
        hasSession: !!sessionData,
        userId: sessionData?.user?.id,
        userRole: sessionData?.user?.role,
        expires: sessionData?.expires,
      } : null,
      timestamp: Date.now(),
    });
  }

  logPageAccess(pageName: string, isAuthenticated: boolean, userRole?: string, sessionData?: any) {
    logAuth('NavigationDebug', 'page_access', {
      pageName,
      isAuthenticated,
      userRole,
      sessionData: sessionData ? {
        hasSession: !!sessionData,
        userId: sessionData?.user?.id,
        userRole: sessionData?.user?.role,
        expires: sessionData?.expires,
      } : null,
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: Date.now(),
    });
  }

  logRedirect(from: string, to: string, reason: string, isAuthenticated: boolean, userRole?: string) {
    logAuth('NavigationDebug', 'redirect_event', {
      from,
      to,
      reason,
      isAuthenticated,
      userRole,
      timestamp: Date.now(),
    });

    this.logNavigation(from, to, `REDIRECT: ${reason}`, isAuthenticated, userRole);
  }

  logAuthenticationCheck(pageName: string, isAuthenticated: boolean, userRole?: string, sessionData?: any) {
    logAuth('NavigationDebug', 'auth_check', {
      pageName,
      isAuthenticated,
      userRole,
      sessionData: sessionData ? {
        hasSession: !!sessionData,
        userId: sessionData?.user?.id,
        userRole: sessionData?.user?.role,
        expires: sessionData?.expires,
      } : null,
      timestamp: Date.now(),
    });
  }

  getNavigationHistory(): NavigationEvent[] {
    return [...this.navigationHistory];
  }

  getRecentNavigations(count: number = 10): NavigationEvent[] {
    return this.navigationHistory.slice(-count);
  }

  clearHistory() {
    this.navigationHistory = [];
    logAuth('NavigationDebug', 'history_cleared', { timestamp: Date.now() });
  }

  exportHistory(): string {
    return JSON.stringify(this.navigationHistory, null, 2);
  }
}

// Export singleton instance
export const navigationDebugger = NavigationDebugger.getInstance();

// Export individual logging functions
export const logNavigation = (from: string, to: string, reason: string, isAuthenticated: boolean, userRole?: string, sessionData?: any) => {
  navigationDebugger.logNavigation(from, to, reason, isAuthenticated, userRole, sessionData);
};

export const logPageAccess = (pageName: string, isAuthenticated: boolean, userRole?: string, sessionData?: any) => {
  navigationDebugger.logPageAccess(pageName, isAuthenticated, userRole, sessionData);
};

export const logRedirect = (from: string, to: string, reason: string, isAuthenticated: boolean, userRole?: string) => {
  navigationDebugger.logRedirect(from, to, reason, isAuthenticated, userRole);
};

export const logAuthenticationCheck = (pageName: string, isAuthenticated: boolean, userRole?: string, sessionData?: any) => {
  navigationDebugger.logAuthenticationCheck(pageName, isAuthenticated, userRole, sessionData);
};

// Debug info getter
export const getNavigationDebugInfo = () => {
  return {
    history: navigationDebugger.getNavigationHistory(),
    recentNavigations: navigationDebugger.getRecentNavigations(20),
    exportHistory: navigationDebugger.exportHistory(),
  };
};
