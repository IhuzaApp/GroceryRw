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

  // Check for NextAuth token
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    // Redirect unauthenticated users to the Login page with an absolute URL
    return NextResponse.redirect(new URL("/Auth/Login", req.url));
  }

  // Protect shopper routes
  if (pathname.startsWith('/shopper')) {
    // If no session or not a shopper, redirect to home
    if (token.role !== 'shopper') {
      return NextResponse.redirect(new URL('/', req.url));
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
