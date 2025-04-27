import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './utils/auth';

// Add all paths that require authentication
const protectedPaths = [
  '/cart',
  '/myprofile',
  '/orders',
  '/current-pending-orders',
  '/profile',
  '/checkout',
  '/payment',
  '/address',
  '/wishlist',
  '/settings',
];

// Add paths that are always public
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/products',
  '/categories',
  '/about',
  '/contact',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Convert pathname to lowercase for case-insensitive matching
  const lowercasePathname = pathname.toLowerCase();
  
  // Check if the path is public
  if (publicPaths.some(path => lowercasePathname.startsWith(path.toLowerCase()))) {
    return NextResponse.next();
  }
  
  // Check if the path requires authentication
  if (protectedPaths.some(path => lowercasePathname.startsWith(path.toLowerCase()))) {
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      // Redirect to login if no token
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 