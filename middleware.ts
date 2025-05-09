import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow unauthenticated access to home, shops, and Auth pages
  if (
    pathname === "/" ||
    pathname === "/shops" ||
    pathname.startsWith("/Auth")
  ) {
    return NextResponse.next();
  }

  // Allow public assets, API routes, and Next.js internals
  if (
    pathname.includes(".") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  // Check for NextAuth token with relative path setting
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });
  
  if (!token) {
    // Use relative URL paths to avoid port-specific redirects
    const url = req.nextUrl.clone();
    url.pathname = "/Auth/Login";
    url.search = `callbackUrl=${encodeURIComponent(req.url)}`;
    return NextResponse.redirect(url);
  }

  // Protect shopper routes
  if (pathname.startsWith('/shopper')) {
    // If no session or not a shopper, redirect to home
    if (token.role !== 'shopper') {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // User is authenticated, allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except API, static files, home and shops
    "/((?!api|_next|static|favicon.ico).*)",
    '/shopper/:path*',
  ],
};
