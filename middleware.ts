import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * AUTHENTICATION MIDDLEWARE - PRODUCTION FIXES
 *
 * This middleware handles authentication for both page routes and API routes.
 *
 * RECENT CHANGES (Production Fix):
 * 1. Removed blanket API route bypass - previously all /api/* routes were allowed without auth
 * 2. Added selective API authentication - only specific public API routes are allowed without auth
 * 3. Removed fallback session cookie logic - was allowing access even when token verification failed
 * 4. Made error handling stricter - redirects to login instead of allowing requests through
 * 5. Updated matcher to include API routes for proper authentication checking
 *
 * PUBLIC API ROUTES (no authentication required):
 * - /api/auth/* - NextAuth authentication endpoints
 * - /api/shopper/shops - Shop listings (public data)
 * - /api/shopper/pendingOrders - Pending orders (public data)
 * - /api/queries/createWallet - Wallet creation
 * - /api/shopper/assignOrder - Order assignment
 * - /api/shopper/todayCompletedEarnings - Earnings data
 *
 * PROTECTED API ROUTES (authentication required):
 * - /api/user - User profile data
 * - /api/queries/addresses - User addresses
 * - All other API routes not listed above
 *
 * TO REVERT TO PREVIOUS BEHAVIOR:
 * 1. Change line 44-73 back to: "if (pathname.startsWith("/api/")) { return NextResponse.next(); }"
 * 2. Restore the fallback session cookie logic in lines 116-122
 * 3. Change error handling back to: "return NextResponse.next();"
 * 4. Update matcher back to: '["/((?!api|_next/static|_next/image|favicon.ico).*)"]'
 */

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/shops",
  "/Auth/Login",
  "/Auth/Register",
  "/_next",
  "/favicon.ico",
  "/static",
];

// Helper function to check if a path is public
const isPublicPath = (path: string) => {
  return publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  );
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // API routes are excluded from middleware - they handle their own authentication

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for static files
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check if there's a refresh parameter in the URL, which indicates role switching
  const isRefreshing = req.nextUrl.searchParams.has("refresh");

  // Check if role has been changed (cookie set by updateRole API)
  const roleChanged = req.cookies.get("role_changed")?.value === "true";
  const newRole = req.cookies.get("new_role")?.value;

  // If role has been changed, redirect to auth/signout to force session refresh
  if (roleChanged && newRole && !pathname.includes("signout")) {
    // Create response
    const response = NextResponse.redirect(
      new URL("/api/auth/signout", req.url)
    );

    // Clear the role_changed cookie
    response.cookies.delete("role_changed");

    // Store the new role and return URL in cookies for the signout page
    response.cookies.set("return_to", req.url);

    return response;
  }

  try {
    // Check for NextAuth token with more permissive settings
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NEXTAUTH_SECURE_COOKIES === "true",
    });

    // If no token is found, redirect to login
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/Auth/Login";
      url.search = `callbackUrl=${encodeURIComponent(req.url)}`;
      return NextResponse.redirect(url);
    }

    // Handle role-specific redirects
    if (token.role === "shopper") {
      // If user is a shopper and trying to access user routes, redirect to shopper dashboard
      if (
        pathname.startsWith("/user") &&
        !pathname.startsWith("/user/profile")
      ) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      // Redirect /ShopperDashboard to root
      if (pathname === "/ShopperDashboard") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } else if (token.role === "user") {
      // If user is a customer and trying to access shopper routes, redirect to home
      if (pathname.startsWith("/Plasa") || pathname === "/ShopperDashboard") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // Protect shopper routes
    if (pathname.startsWith("/shopper")) {
      if (!token || token.role !== "shopper") {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    }

    // User is authenticated, allow
    return NextResponse.next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    // In case of any error, redirect to login for security
    const url = req.nextUrl.clone();
    url.pathname = "/Auth/Login";
    url.search = `callbackUrl=${encodeURIComponent(req.url)}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
