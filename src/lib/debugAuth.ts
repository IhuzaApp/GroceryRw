/**
 * Authentication Debugging Utility
 * 
 * This utility provides comprehensive debugging and logging for authentication issues.
 * It helps identify problems in production by logging detailed information about
 * authentication state, session data, and route navigation.
 */

interface DebugInfo {
  timestamp: string;
  location: string;
  action: string;
  data: any;
  url?: string;
  userAgent?: string;
  sessionId?: string;
}

class AuthDebugger {
  private static instance: AuthDebugger;
  private logs: DebugInfo[] = [];
  private maxLogs = 100; // Keep last 100 logs

  static getInstance(): AuthDebugger {
    if (!AuthDebugger.instance) {
      AuthDebugger.instance = new AuthDebugger();
    }
    return AuthDebugger.instance;
  }

  private constructor() {
    // Initialize debugger
    this.log('AuthDebugger', 'initialized', {});
  }

  log(location: string, action: string, data: any, url?: string) {
    const debugInfo: DebugInfo = {
      timestamp: new Date().toISOString(),
      location,
      action,
      data,
      url: url || (typeof window !== 'undefined' ? window.location.href : 'server'),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      sessionId: this.getSessionId(),
    };

    this.logs.push(debugInfo);
    
    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging with different levels
    const logLevel = this.getLogLevel(action);
    const message = `[AUTH DEBUG] ${location}: ${action}`;
    
    switch (logLevel) {
      case 'error':
        console.error(message, data);
        break;
      case 'warn':
        console.warn(message, data);
        break;
      case 'info':
        console.info(message, data);
        break;
      default:
        console.log(message, data);
    }
  }

  private getLogLevel(action: string): string {
    if (action.includes('error') || action.includes('failed') || action.includes('unauthorized')) {
      return 'error';
    }
    if (action.includes('warn') || action.includes('redirect') || action.includes('timeout')) {
      return 'warn';
    }
    if (action.includes('success') || action.includes('authenticated') || action.includes('loaded')) {
      return 'info';
    }
    return 'log';
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    // Try to get session ID from various sources
    const sessionId = 
      localStorage.getItem('sessionId') ||
      sessionStorage.getItem('sessionId') ||
      document.cookie.split(';').find(c => c.trim().startsWith('next-auth.session-token='))?.split('=')[1] ||
      'unknown';
    
    return sessionId.substring(0, 8) + '...';
  }

  getLogs(): DebugInfo[] {
    return [...this.logs];
  }

  getRecentLogs(count: number = 10): DebugInfo[] {
    return this.logs.slice(-count);
  }

  clearLogs() {
    this.logs = [];
    this.log('AuthDebugger', 'logs_cleared', {});
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Specific debugging methods
  logAuthState(session: any, status: string, location: string) {
    this.log(location, 'auth_state_changed', {
      status,
      hasSession: !!session,
      userId: session?.user?.id,
      userRole: session?.user?.role,
      sessionExpires: session?.expires,
      isAuthenticated: status === 'authenticated',
    });
  }

  logRouteNavigation(from: string, to: string, isAuthenticated: boolean, userRole?: string) {
    this.log('RouteNavigation', 'navigating', {
      from,
      to,
      isAuthenticated,
      userRole,
      timestamp: Date.now(),
    });
  }

  logApiCall(url: string, method: string, status: number, hasCredentials: boolean) {
    this.log('ApiCall', 'api_request', {
      url,
      method,
      status,
      hasCredentials,
      success: status >= 200 && status < 300,
    });
  }

  logMiddlewareDecision(pathname: string, decision: string, reason: string, userRole?: string) {
    this.log('Middleware', 'route_decision', {
      pathname,
      decision,
      reason,
      userRole,
      timestamp: Date.now(),
    });
  }

  logSessionRefresh(attempt: number, success: boolean, error?: string) {
    this.log('SessionRefresh', 'refresh_attempt', {
      attempt,
      success,
      error,
      timestamp: Date.now(),
    });
  }

  logRoleSwitch(fromRole: string, toRole: string, success: boolean, error?: string) {
    this.log('RoleSwitch', 'role_change', {
      fromRole,
      toRole,
      success,
      error,
      timestamp: Date.now(),
    });
  }
}

// Export singleton instance
export const authDebugger = AuthDebugger.getInstance();

// Export individual logging functions for convenience
export const logAuth = (location: string, action: string, data: any) => {
  authDebugger.log(location, action, data);
};

export const logAuthState = (session: any, status: string, location: string) => {
  authDebugger.logAuthState(session, status, location);
};

export const logRouteNavigation = (from: string, to: string, isAuthenticated: boolean, userRole?: string) => {
  authDebugger.logRouteNavigation(from, to, isAuthenticated, userRole);
};

export const logApiCall = (url: string, method: string, status: number, hasCredentials: boolean) => {
  authDebugger.logApiCall(url, method, status, hasCredentials);
};

export const logMiddlewareDecision = (pathname: string, decision: string, reason: string, userRole?: string) => {
  authDebugger.logMiddlewareDecision(pathname, decision, reason, userRole);
};

export const logSessionRefresh = (attempt: number, success: boolean, error?: string) => {
  authDebugger.logSessionRefresh(attempt, success, error);
};

export const logRoleSwitch = (fromRole: string, toRole: string, success: boolean, error?: string) => {
  authDebugger.logRoleSwitch(fromRole, toRole, success, error);
};

// Debug info getter for debugging pages
export const getAuthDebugInfo = () => {
  return {
    logs: authDebugger.getLogs(),
    recentLogs: authDebugger.getRecentLogs(20),
    exportLogs: authDebugger.exportLogs(),
  };
};
