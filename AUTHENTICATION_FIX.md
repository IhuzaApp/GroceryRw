# Authentication Fix for Production 401 Errors

## Problem Summary
Users were experiencing 401 Unauthorized errors in production when trying to access protected API endpoints, even though they appeared to be logged in. The main issues were:

1. **Missing Credentials in Fetch Requests**: Frontend fetch calls were not including session cookies
2. **Apollo Client Configuration**: Incorrect authentication headers for GraphQL requests
3. **Environment Variables**: Missing `NEXT_PUBLIC_` prefixes for client-side access

## Root Cause Analysis

### Primary Issue: Missing Session Credentials
The frontend was making `fetch()` calls to REST API endpoints without including the necessary credentials to maintain the session. In production, session cookies weren't being sent with these requests, causing 401 errors.

### Secondary Issues:
1. **Apollo Client Misconfiguration**: Using wrong authentication method for GraphQL
2. **Environment Variables**: Client-side code couldn't access server-side environment variables

## Solutions Implemented

### 1. Created Authenticated Fetch Utility
**File**: `src/lib/authenticatedFetch.ts`

```typescript
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const fetchOptions: RequestInit = {
    ...options,
    credentials: 'include', // This ensures cookies are sent with the request
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  return fetch(url, fetchOptions);
};
```

### 2. Updated Apollo Client Configuration
**File**: `src/lib/apolloClient.ts`

**Changes Made**:
- Fixed environment variable access (added `NEXT_PUBLIC_` prefix)
- Updated authentication headers for proper Hasura authentication
- Added `credentials: 'include'` for session-based authentication

### 3. Updated Critical Fetch Calls
Updated the following components to use `authenticatedFetch`:

- `src/components/ui/sidebar.tsx` - Orders fetching
- `src/components/userProfile/useProfile.tsx` - Addresses and orders
- `src/components/userProfile/userAddress.tsx` - Address management
- `src/components/ui/NavBar/headerLayout.tsx` - Address fetching
- `pages/CurrentPendingOrders/index.tsx` - Orders fetching
- `src/components/shopper/profile/ShopperProfileComponent.tsx` - User and shopper data
- `src/components/userProfile/UserPaymentCards.tsx` - Payment and wallet data
- `src/components/shopper/ShopperSidebar.tsx` - Logout functionality
- `middleware.ts` - Added logout endpoint to public API paths

### 4. Fixed Logout Functionality
**Issues Fixed**:
- Updated logout API calls to use `authenticatedFetch` for proper session handling
- Added `/api/logout` to public API paths to prevent authentication blocking
- Ensured logout works even when session is partially invalid

**Files Modified**:
- `src/components/userProfile/useProfile.tsx` - User profile logout
- `src/components/shopper/ShopperSidebar.tsx` - Shopper logout
- `middleware.ts` - Added logout to public API paths

## Environment Variables Required

### Production Environment Variables
Ensure these are set in your Vercel deployment:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://www.plas.rw
NEXTAUTH_SECURE_COOKIES=true

# Hasura Configuration
HASURA_GRAPHQL_URL=your-hasura-graphql-url
HASURA_GRAPHQL_ADMIN_SECRET=your-hasura-admin-secret

# Client-side Hasura Configuration (NEW - Required for Apollo Client)
NEXT_PUBLIC_HASURA_GRAPHQL_URL=your-hasura-graphql-url
NEXT_PUBLIC_HASURA_GRAPHQL_ADMIN_SECRET=your-hasura-admin-secret
```

### Important Notes:
1. **NEXT_PUBLIC_ prefix**: Required for client-side access to environment variables
2. **NEXTAUTH_SECURE_COOKIES=true**: Required for production HTTPS
3. **NEXTAUTH_URL**: Must match your production domain exactly

## Testing the Fix

### 1. Local Testing
```bash
# Set environment variables
export NEXTAUTH_SECRET="your-secret"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECURE_COOKIES="false"
export HASURA_GRAPHQL_URL="your-hasura-url"
export HASURA_GRAPHQL_ADMIN_SECRET="your-admin-secret"
export NEXT_PUBLIC_HASURA_GRAPHQL_URL="your-hasura-url"
export NEXT_PUBLIC_HASURA_GRAPHQL_ADMIN_SECRET="your-admin-secret"

# Run the application
yarn dev
```

### 2. Production Testing
1. Deploy with updated environment variables
2. Test user login/logout functionality
3. Verify API calls work without 401 errors
4. Check browser network tab for proper cookie inclusion

## Files Modified

### New Files:
- `src/lib/authenticatedFetch.ts` - Authenticated fetch utility

### Modified Files:
- `src/lib/apolloClient.ts` - Fixed authentication configuration
- `src/components/ui/sidebar.tsx` - Updated fetch calls
- `src/components/userProfile/useProfile.tsx` - Updated fetch calls
- `src/components/userProfile/userAddress.tsx` - Updated fetch calls
- `src/components/ui/NavBar/headerLayout.tsx` - Updated fetch calls
- `pages/CurrentPendingOrders/index.tsx` - Updated fetch calls
- `src/components/shopper/profile/ShopperProfileComponent.tsx` - Updated fetch calls
- `src/components/userProfile/UserPaymentCards.tsx` - Updated fetch calls

## Verification Steps

1. **Check Network Tab**: Verify that requests include `credentials: 'include'`
2. **Check Cookies**: Ensure session cookies are being sent with requests
3. **Test Authentication**: Verify login/logout works properly
4. **Test API Calls**: Ensure protected endpoints return data instead of 401 errors

## Rollback Plan

If issues persist, you can rollback by:

1. Reverting the fetch calls back to regular `fetch()`
2. Removing the `credentials: 'include'` from Apollo Client
3. Reverting environment variable changes

## Additional Recommendations

1. **Monitor Logs**: Keep an eye on production logs for any remaining 401 errors
2. **Session Management**: Consider implementing session refresh logic for long-running sessions
3. **Error Handling**: Add better error handling for authentication failures
4. **Testing**: Implement automated tests for authentication flows

## Expected Results

After implementing these fixes:
- Users should be able to log in and stay logged in
- API calls should work without 401 errors
- Session cookies should be properly included in requests
- The application should work consistently in production
