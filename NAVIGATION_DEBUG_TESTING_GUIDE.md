# 🧪 Navigation Debug Testing Guide

This guide explains how to test and use the `navigationDebug.ts` utility in your grocery app.

## 🚀 Quick Start

### 1. Access the Test Page
Navigate to: `http://localhost:3000/debug/navigation-test`

This page provides a comprehensive testing interface with:
- ✅ Interactive test buttons
- ✅ Real-time navigation history
- ✅ Export functionality
- ✅ Console command examples

### 2. Use the Floating Debug Button
In development mode, you'll see a red floating button in the bottom-right corner. Click it to open the debug dashboard.

### 3. Use Browser Console Commands
Open your browser's developer console and use these commands:

```javascript
// Get help
navigationDebug.help()

// Run all tests
navigationDebug.runAllTests()

// Get navigation history
navigationDebug.getHistory()

// Get recent navigations
navigationDebug.getRecent(5)

// Test specific functions
navigationDebug.testNavigation('/home', '/profile', 'User clicked profile', true, 'user')
navigationDebug.testPageAccess('ProfilePage', true, 'user')
navigationDebug.testRedirect('/profile', '/login', 'Session expired', false, 'user')
```

## 📋 Testing Methods

### Method 1: Test Page Interface

1. **Navigate to the test page**: `/debug/navigation-test`
2. **Run individual tests**:
   - Click "Test Navigation" to test navigation logging
   - Click "Test Page Access" to test page access logging
   - Click "Test Redirect" to test redirect logging
   - Click "Test Auth Check" to test authentication check logging
3. **Run all tests**: Click "Run All Tests" to execute all test functions
4. **View results**: Check the "Test Results" section for test outcomes
5. **View history**: See navigation history in real-time
6. **Export data**: Click "Export JSON" to download navigation history

### Method 2: Browser Console

1. **Open Developer Console** (F12)
2. **Run commands**:
   ```javascript
   // Initialize (if not already done)
   navigationDebug.help()
   
   // Test navigation logging
   navigationDebug.testNavigation('/test', '/debug', 'Console test', true, 'user')
   
   // View results
   navigationDebug.getRecent(3)
   ```

### Method 3: Floating Debug Dashboard

1. **Look for the red floating button** in the bottom-right corner (development only)
2. **Click the button** to open the debug dashboard
3. **View real-time data**:
   - Navigation statistics
   - Recent navigations
   - Full navigation history
4. **Export data** or log to console
5. **Toggle auto-refresh** for real-time updates

### Method 4: Programmatic Testing

Add this to any component to test the navigation debug utility:

```typescript
import { logNavigation, logPageAccess } from '../lib/navigationDebug';

// In your component
const testNavigationDebug = () => {
  logNavigation('/current-page', '/target-page', 'User clicked button', true, 'user');
  logPageAccess('MyComponent', true, 'user');
};
```

## 🔍 What Gets Logged

The navigation debug utility automatically logs:

### 1. **Page Visibility Changes**
- When user switches tabs
- When browser window is minimized/maximized
- When page becomes visible/hidden

### 2. **Window Events**
- Window focus/blur events
- Page load events
- Before unload events

### 3. **Manual Navigation Events**
- Programmatic navigation calls
- Page access attempts
- Redirect events
- Authentication checks

### 4. **Session Data**
- User authentication status
- User role information
- Session expiration
- User ID and details

## 📊 Understanding the Logs

### Navigation Event Structure
```typescript
{
  from: string;           // Source page/route
  to: string;            // Destination page/route
  timestamp: number;     // Unix timestamp
  reason: string;        // Why the navigation occurred
  isAuthenticated: boolean; // User authentication status
  userRole?: string;     // User role (user/shopper)
  sessionData?: any;     // Session information
}
```

### Log Levels
- **Info**: Successful navigations, page loads
- **Warn**: Redirects, authentication issues
- **Error**: Failed navigations, authentication errors

## 🧪 Test Scenarios

### Scenario 1: Basic Navigation Testing
```javascript
// Test normal navigation
navigationDebug.testNavigation('/home', '/profile', 'User clicked profile link', true, 'user');

// Test unauthenticated navigation
navigationDebug.testNavigation('/profile', '/login', 'User not authenticated', false, 'user');
```

### Scenario 2: Role-Based Navigation
```javascript
// Test user role navigation
navigationDebug.testNavigation('/dashboard', '/orders', 'User viewing orders', true, 'user');

// Test shopper role navigation
navigationDebug.testNavigation('/dashboard', '/earnings', 'Shopper viewing earnings', true, 'shopper');
```

### Scenario 3: Authentication Flow
```javascript
// Test login flow
navigationDebug.testNavigation('/login', '/dashboard', 'User logged in successfully', true, 'user');

// Test logout flow
navigationDebug.testNavigation('/dashboard', '/login', 'User logged out', false, 'user');
```

### Scenario 4: Error Scenarios
```javascript
// Test session expiration
navigationDebug.testRedirect('/profile', '/login', 'Session expired', false, 'user');

// Test permission denied
navigationDebug.testRedirect('/admin', '/dashboard', 'Insufficient permissions', true, 'user');
```

## 🔧 Advanced Testing

### Testing with Real Navigation
1. **Enable the debug utility** in your app
2. **Navigate between pages** normally
3. **Check the console** for automatic logging
4. **Use the debug dashboard** to view real-time data

### Testing API Integration
```javascript
// Test navigation after API calls
fetch('/api/user')
  .then(() => {
    navigationDebug.testNavigation('/loading', '/profile', 'API call completed', true, 'user');
  });
```

### Testing Error Handling
```javascript
// Test navigation error handling
try {
  // Some navigation logic
  navigationDebug.testNavigation('/current', '/target', 'Navigation successful', true, 'user');
} catch (error) {
  navigationDebug.testNavigation('/current', '/error', 'Navigation failed', false, 'user');
}
```

## 📈 Monitoring and Analysis

### Real-Time Monitoring
- Use the floating debug button for real-time monitoring
- Enable auto-refresh in the dashboard
- Watch console logs for immediate feedback

### Data Export
- Export navigation history as JSON
- Analyze navigation patterns
- Identify authentication issues
- Track user behavior

### Performance Monitoring
- Monitor navigation frequency
- Track authentication success rates
- Identify slow navigation paths
- Detect authentication loops

## 🚨 Troubleshooting

### Common Issues

1. **No logs appearing**
   - Check if you're in development mode
   - Verify the console utility is loaded
   - Check browser console for errors

2. **Dashboard not opening**
   - Ensure you're in development mode
   - Check if the floating button is visible
   - Verify component imports

3. **Console commands not working**
   - Refresh the page to reload the console utility
   - Check if `navigationDebug` is available in window object
   - Verify the utility is properly imported

### Debug Steps
1. **Check console for errors**
2. **Verify imports are correct**
3. **Test with simple commands first**
4. **Check browser compatibility**
5. **Verify development environment**

## 📝 Best Practices

### 1. **Use in Development Only**
The debug utilities are only available in development mode for security.

### 2. **Test Regularly**
Run navigation tests during development to catch issues early.

### 3. **Monitor Production**
Use the exported data to analyze production navigation patterns.

### 4. **Clean Up**
Clear navigation history regularly to avoid memory issues.

### 5. **Document Issues**
Use the export functionality to document and share navigation issues.

## 🎯 Expected Results

After testing, you should see:

- ✅ **Console logs** showing navigation events
- ✅ **Dashboard data** displaying navigation history
- ✅ **Export functionality** working properly
- ✅ **Real-time updates** in the dashboard
- ✅ **Proper authentication** status tracking
- ✅ **Role-based navigation** logging

## 🔗 Related Files

- `src/lib/navigationDebug.ts` - Main debug utility
- `src/lib/navigationDebugConsole.ts` - Console commands
- `src/components/debug/NavigationDebugDashboard.tsx` - Dashboard component
- `src/components/debug/DebugFloatingButton.tsx` - Floating button
- `pages/debug/navigation-test.tsx` - Test page

## 🚀 Next Steps

1. **Test the basic functionality** using the test page
2. **Try console commands** in the browser
3. **Use the floating dashboard** for real-time monitoring
4. **Export data** to analyze navigation patterns
5. **Integrate with your development workflow**

Happy debugging! 🎉
