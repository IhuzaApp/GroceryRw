/**
 * Navigation Debug Console Utility
 * 
 * This utility provides console commands for testing the navigation debugging system.
 * It exposes the navigation debugger to the global window object for easy testing.
 */

import { 
  navigationDebugger, 
  getNavigationDebugInfo,
  logNavigation,
  logPageAccess,
  logRedirect,
  logAuthenticationCheck
} from './navigationDebug';

// Extend the Window interface to include our debug utilities
declare global {
  interface Window {
    navigationDebugger: typeof navigationDebugger;
    navigationDebug: {
      getInfo: () => any;
      getHistory: () => any[];
      getRecent: (count?: number) => any[];
      clearHistory: () => void;
      exportHistory: () => string;
      testNavigation: (from: string, to: string, reason: string, isAuth: boolean, role?: string) => void;
      testPageAccess: (pageName: string, isAuth: boolean, role?: string) => void;
      testRedirect: (from: string, to: string, reason: string, isAuth: boolean, role?: string) => void;
      testAuthCheck: (pageName: string, isAuth: boolean, role?: string) => void;
      runAllTests: () => void;
      help: () => void;
    };
  }
}

// Console testing utilities
const navigationDebugConsole = {
  getInfo: () => {
    const info = getNavigationDebugInfo();
    console.log('📊 Navigation Debug Info:', info);
    return info;
  },

  getHistory: () => {
    const history = navigationDebugger.getNavigationHistory();
    console.log('📜 Navigation History:', history);
    return history;
  },

  getRecent: (count: number = 10) => {
    const recent = navigationDebugger.getRecentNavigations(count);
    console.log(`🕒 Recent ${count} Navigations:`, recent);
    return recent;
  },

  clearHistory: () => {
    navigationDebugger.clearHistory();
    console.log('🗑️ Navigation history cleared');
  },

  exportHistory: () => {
    const exportData = navigationDebugger.exportHistory();
    console.log('📤 Navigation History Export:', exportData);
    return exportData;
  },

  testNavigation: (from: string, to: string, reason: string, isAuth: boolean, role: string = 'user') => {
    logNavigation(from, to, reason, isAuth, role);
    console.log(`🧪 Test Navigation: ${from} → ${to} (${reason})`);
  },

  testPageAccess: (pageName: string, isAuth: boolean, role: string = 'user') => {
    logPageAccess(pageName, isAuth, role);
    console.log(`🧪 Test Page Access: ${pageName} (Auth: ${isAuth}, Role: ${role})`);
  },

  testRedirect: (from: string, to: string, reason: string, isAuth: boolean, role: string = 'user') => {
    logRedirect(from, to, reason, isAuth, role);
    console.log(`🧪 Test Redirect: ${from} → ${to} (${reason})`);
  },

  testAuthCheck: (pageName: string, isAuth: boolean, role: string = 'user') => {
    logAuthenticationCheck(pageName, isAuth, role);
    console.log(`🧪 Test Auth Check: ${pageName} (Auth: ${isAuth}, Role: ${role})`);
  },

  runAllTests: () => {
    console.log('🚀 Running all navigation debug tests...');
    
    // Test navigation logging
    navigationDebugConsole.testNavigation('/test', '/debug', 'Console test navigation', true, 'user');
    
    // Test page access logging
    navigationDebugConsole.testPageAccess('TestPage', true, 'user');
    
    // Test redirect logging
    navigationDebugConsole.testRedirect('/debug', '/test-redirect', 'Console test redirect', true, 'user');
    
    // Test auth check logging
    navigationDebugConsole.testAuthCheck('TestPage', true, 'user');
    
    // Simulate some navigation events
    setTimeout(() => {
      navigationDebugConsole.testNavigation('/home', '/profile', 'User clicked profile', true, 'user');
    }, 100);
    
    setTimeout(() => {
      navigationDebugConsole.testNavigation('/profile', '/settings', 'User clicked settings', true, 'user');
    }, 200);
    
    setTimeout(() => {
      navigationDebugConsole.testRedirect('/settings', '/login', 'Session expired', false, 'user');
    }, 300);
    
    setTimeout(() => {
      console.log('✅ All tests completed! Check the navigation history.');
      navigationDebugConsole.getRecent(5);
    }, 400);
  },

  help: () => {
    console.log(`
🔧 Navigation Debug Console Commands:

📊 Data Retrieval:
  navigationDebug.getInfo()           - Get complete debug info
  navigationDebug.getHistory()         - Get full navigation history
  navigationDebug.getRecent(10)        - Get recent 10 navigations
  navigationDebug.exportHistory()      - Export history as JSON

🧪 Testing:
  navigationDebug.testNavigation('/from', '/to', 'reason', true, 'user')
  navigationDebug.testPageAccess('PageName', true, 'user')
  navigationDebug.testRedirect('/from', '/to', 'reason', true, 'user')
  navigationDebug.testAuthCheck('PageName', true, 'user')
  navigationDebug.runAllTests()       - Run all test functions

🗑️ Management:
  navigationDebug.clearHistory()      - Clear navigation history

📖 Help:
  navigationDebug.help()              - Show this help message

💡 Examples:
  navigationDebug.testNavigation('/home', '/profile', 'User clicked profile', true, 'user')
  navigationDebug.getRecent(5)
  navigationDebug.runAllTests()
    `);
  }
};

// Initialize console utilities when in browser environment
if (typeof window !== 'undefined') {
  // Expose the navigation debugger directly
  window.navigationDebugger = navigationDebugger;
  
  // Expose the console utilities
  window.navigationDebug = navigationDebugConsole;
  
  // Auto-run help on first load
  console.log('🔧 Navigation Debug Console loaded! Type navigationDebug.help() for commands.');
}

export default navigationDebugConsole;
