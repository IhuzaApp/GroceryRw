# 🔍 Comprehensive Authentication Debugging Guide

## 🚨 Overview
This guide provides comprehensive debugging tools and logging for authentication issues in production. All authentication flows now include detailed logging to help identify and fix problems quickly.

## 🛠️ Debugging Tools Available

### **1. Debug Console Page** (`/debug-auth`)
- **Real-time authentication state monitoring**
- **Live debug logs with auto-refresh**
- **Session data inspection**
- **API call testing**
- **System information display**
- **Log export functionality**

### **2. Auth Test Page** (`/auth-test`)
- **Basic authentication status display**
- **Navigation testing**
- **User information display**
- **Simple debugging interface**

## 📊 Debug Logging System

### **Log Levels:**
- 🔴 **ERROR** - Authentication failures, unauthorized access
- 🟡 **WARN** - Redirects, timeouts, role issues
- 🟢 **INFO** - Successful authentication, state changes
- ⚪ **LOG** - General debugging information

### **Log Categories:**
- **Middleware** - Route protection and authentication checks
- **AuthContext** - Client-side authentication state management
- **AuthenticatedFetch** - API call authentication
- **WithAuth** - Protected route component behavior
- **MiddlewareAuth** - Server-side token validation

## 🔍 How to Debug Authentication Issues

### **Step 1: Access Debug Console**
1. Navigate to `/debug-auth` in your browser
2. Enable auto-refresh to see real-time logs
3. Check the "Current Authentication State" section

### **Step 2: Analyze Authentication State**
Look for these key indicators:
- ✅ **AuthContext Ready**: Should be `true`
- ✅ **Logged In**: Should be `true` when authenticated
- ✅ **NextAuth Status**: Should be `authenticated`
- ✅ **Role**: Should match user's actual role

### **Step 3: Check Debug Logs**
Look for these patterns in the logs:

#### **🔴 Authentication Failures:**
```
[AUTH DEBUG] Middleware: User not authenticated for /Plasa/Earnings, redirecting to login
[AUTH DEBUG] AuthenticatedFetch: request_failed { status: 401, ... }
[AUTH DEBUG] AuthContext: user_not_authenticated { status: "unauthenticated" }
```

#### **🟡 Role Issues:**
```
[AUTH DEBUG] WithAuth: redirecting_due_to_role { userRole: "user", allowedRoles: ["shopper"] }
[AUTH DEBUG] Middleware: Non-shopper trying to access shopper route
```

#### **🟢 Successful Authentication:**
```
[AUTH DEBUG] Middleware: User authenticated with role shopper - access granted
[AUTH DEBUG] AuthContext: user_authenticated { userData: {...} }
[AUTH DEBUG] AuthenticatedFetch: request_completed { status: 200, success: true }
```

### **Step 4: Test API Calls**
Use the debug console to test:
1. **Regular API Call** - Tests basic fetch without authentication
2. **Authenticated API Call** - Tests authenticatedFetch utility
3. **Navigation Test** - Tests protected page access

## 🐛 Common Issues and Solutions

### **Issue 1: Users Redirected to Login After Successful Login**

**Symptoms:**
- User logs in successfully
- Immediately redirected to login page
- Console shows: `User not authenticated for /Plasa/Earnings`

**Debug Steps:**
1. Check middleware logs for token validation
2. Look for `MiddlewareAuth: no_token_found` logs
3. Verify session cookies are present

**Possible Causes:**
- Session cookies not being set properly
- Token validation failing in middleware
- Environment variable issues

**Solution:**
- Check `NEXTAUTH_SECRET` environment variable
- Verify cookie settings in NextAuth configuration
- Check browser developer tools for cookie issues

### **Issue 2: 401 Errors on API Calls**

**Symptoms:**
- API calls return 401 Unauthorized
- Console shows: `AuthenticatedFetch: request_failed { status: 401 }`

**Debug Steps:**
1. Check if `credentials: 'include'` is being sent
2. Look for session validation errors
3. Verify API route authentication

**Possible Causes:**
- API calls not using `authenticatedFetch()`
- Session cookies not being sent
- API route authentication failing

**Solution:**
- Ensure all API calls use `authenticatedFetch()`
- Check API route session validation
- Verify session cookies are present

### **Issue 3: Role-Based Access Issues**

**Symptoms:**
- Users can't access role-specific pages
- Console shows: `redirecting_due_to_role`

**Debug Steps:**
1. Check user role in session data
2. Verify role-based redirects in middleware
3. Look for role switching issues

**Possible Causes:**
- User role not properly set in session
- Role switching not working correctly
- Middleware role validation failing

**Solution:**
- Check role setting in NextAuth configuration
- Verify role switching API calls
- Check middleware role validation logic

### **Issue 4: Session State Inconsistencies**

**Symptoms:**
- AuthContext shows different state than NextAuth
- Inconsistent authentication status

**Debug Steps:**
1. Compare AuthContext and NextAuth session data
2. Look for session refresh issues
3. Check for race conditions

**Possible Causes:**
- Session refresh not working properly
- State synchronization issues
- Timing problems between components

**Solution:**
- Check session refresh implementation
- Verify state synchronization logic
- Add proper loading states

## 📋 Debug Checklist

### **Before Debugging:**
- [ ] Access `/debug-auth` page
- [ ] Enable auto-refresh
- [ ] Clear browser cache and cookies
- [ ] Check browser developer tools console

### **During Debugging:**
- [ ] Monitor real-time logs
- [ ] Test API calls using debug tools
- [ ] Check authentication state changes
- [ ] Verify session data consistency

### **After Debugging:**
- [ ] Export logs for analysis
- [ ] Document the issue and solution
- [ ] Test the fix thoroughly
- [ ] Monitor for recurring issues

## 🚀 Production Debugging Tips

### **1. Use Browser Developer Tools**
- **Console**: Check for authentication errors
- **Network**: Monitor API call status codes
- **Application**: Inspect cookies and localStorage
- **Security**: Check for HTTPS issues

### **2. Monitor Server Logs**
- Check Vercel function logs
- Look for middleware execution logs
- Monitor API route errors

### **3. Test Different Scenarios**
- Test with different user roles
- Test role switching functionality
- Test logout and re-login flows
- Test navigation between protected pages

### **4. Use Debug Console Features**
- **Auto-refresh**: Keep logs updated in real-time
- **Export logs**: Save logs for detailed analysis
- **Clear logs**: Start fresh debugging session
- **Test buttons**: Verify API call functionality

## 📊 Log Analysis

### **Key Metrics to Monitor:**
- **Authentication Success Rate**: Percentage of successful logins
- **API Call Success Rate**: Percentage of successful API calls
- **Redirect Frequency**: How often users are redirected
- **Session Duration**: How long sessions last

### **Performance Metrics:**
- **Middleware Execution Time**: How long middleware takes
- **Token Validation Time**: How long token checks take
- **API Call Duration**: How long API calls take
- **Session Refresh Time**: How long session refreshes take

## 🔧 Debugging Commands

### **Console Commands:**
```javascript
// Get current debug info
window.authDebugger?.getLogs()

// Clear all logs
window.authDebugger?.clearLogs()

// Export logs
window.authDebugger?.exportLogs()

// Get recent logs
window.authDebugger?.getRecentLogs(10)
```

### **Browser Console Testing:**
```javascript
// Test authentication state
console.log('Auth State:', {
  isLoggedIn: window.authContext?.isLoggedIn,
  role: window.authContext?.role,
  session: window.authContext?.session
});

// Test API call
fetch('/api/user', { credentials: 'include' })
  .then(r => console.log('API Status:', r.status))
  .catch(e => console.error('API Error:', e));
```

## 🎯 Quick Fixes

### **If Users Can't Login:**
1. Check NextAuth configuration
2. Verify environment variables
3. Check database connection
4. Look for credential validation errors

### **If Users Get Redirected After Login:**
1. Check middleware token validation
2. Verify session cookie settings
3. Check role-based redirects
4. Look for timing issues

### **If API Calls Fail:**
1. Ensure all calls use `authenticatedFetch()`
2. Check API route authentication
3. Verify session cookies are sent
4. Look for CORS issues

### **If Role Switching Doesn't Work:**
1. Check role switching API
2. Verify session refresh
3. Check middleware role validation
4. Look for state synchronization issues

## 📞 Support

If you encounter issues that aren't covered in this guide:

1. **Export the debug logs** from `/debug-auth`
2. **Check the browser console** for error messages
3. **Test the specific scenario** using debug tools
4. **Document the steps** to reproduce the issue
5. **Include relevant log entries** in your report

The comprehensive debugging system should help identify and resolve most authentication issues quickly! 🚀
