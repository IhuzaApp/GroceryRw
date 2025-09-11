import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { logAuth } from "./debugAuth";

/**
 * Middleware Authentication Utility
 * 
 * This utility provides consistent authentication checking for middleware
 * by using the same JWT secret and configuration as the main NextAuth setup.
 */

export async function getMiddlewareSession(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    logAuth('MiddlewareAuth', 'token_check_started', {
      pathname: req.nextUrl.pathname,
      method: req.method,
      hasCookies: req.cookies.size > 0,
      cookieCount: req.cookies.size,
      timestamp: Date.now(),
    });

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NEXTAUTH_SECURE_COOKIES === "true",
    });

    const duration = Date.now() - startTime;

    if (!token) {
      logAuth('MiddlewareAuth', 'no_token_found', {
        pathname: req.nextUrl.pathname,
        duration,
        timestamp: Date.now(),
      });
      return null;
    }

    const sessionData = {
      user: {
        id: token.sub,
        name: token.name,
        email: token.email,
        image: token.picture,
        role: token.role || "user",
      },
      role: token.role || "user",
      expires: token.exp ? new Date(token.exp * 1000).toISOString() : null,
    };

    logAuth('MiddlewareAuth', 'token_found', {
      pathname: req.nextUrl.pathname,
      userId: token.sub,
      userRole: token.role || "user",
      duration,
      tokenExp: token.exp,
      timestamp: Date.now(),
    });

    return sessionData;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logAuth('MiddlewareAuth', 'token_check_error', {
      pathname: req.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      duration,
      timestamp: Date.now(),
    });
    
    return null;
  }
}

/**
 * Check if a user is authenticated in middleware
 */
export async function isAuthenticated(req: NextRequest): Promise<boolean> {
  const session = await getMiddlewareSession(req);
  return !!session;
}

/**
 * Get user role from middleware session
 */
export async function getUserRole(req: NextRequest): Promise<string | null> {
  const session = await getMiddlewareSession(req);
  return session?.role || null;
}
