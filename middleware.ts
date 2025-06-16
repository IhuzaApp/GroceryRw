import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define public paths that don't require authentication
const publicPaths = [
  "/",
  "/shops",
  "/Auth/Login",
  "/Auth/Register",
  "/api", // All API routes are public
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

  // Skip middleware for API routes entirely
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

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

    // If no token is found, check for cookies before redirecting
    if (!token) {
      // Check for any auth-related cookies as a fallback
      const sessionCookie =
        req.cookies.get("next-auth.session-token") ||
        req.cookies.get("__Secure-next-auth.session-token");

      if (sessionCookie) {
        console.log(
          "Session cookie found but token verification failed, allowing access"
        );
        // If we have a session cookie but token verification failed, let the request through
        return NextResponse.next();
      }

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

    // In case of any error, allow the request to proceed
    // The pages themselves can handle authentication if needed
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
