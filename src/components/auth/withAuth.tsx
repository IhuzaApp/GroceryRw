import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { logRouteNavigation, logAuth } from "../../lib/debugAuth";

/**
 * Higher-Order Component for protecting pages
 * 
 * This HOC ensures that pages are properly protected both on the server and client side.
 * It handles authentication checking, role-based access, and loading states.
 */

interface WithAuthOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    redirectTo = "/Auth/Login",
  } = options;

  const AuthenticatedComponent = (props: P) => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      logAuth('WithAuth', 'component_mounted', {
        requireAuth,
        allowedRoles,
        redirectTo,
        currentPath: router.asPath,
        status,
        hasSession: !!session,
        timestamp: Date.now(),
      });

      if (requireAuth && status === "unauthenticated") {
        logRouteNavigation(router.asPath, redirectTo, false);
        
        logAuth('WithAuth', 'redirecting_to_login', {
          currentPath: router.asPath,
          redirectTo,
          reason: 'User not authenticated',
          timestamp: Date.now(),
        });

        const callbackUrl = encodeURIComponent(router.asPath);
        router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
        return;
      }

      if (requireAuth && session && allowedRoles.length > 0) {
        const userRole = (session.user as any)?.role || "user";
        
        logAuth('WithAuth', 'checking_role_access', {
          userRole,
          allowedRoles,
          hasAccess: allowedRoles.includes(userRole),
          currentPath: router.asPath,
          timestamp: Date.now(),
        });

        if (!allowedRoles.includes(userRole)) {
          logRouteNavigation(router.asPath, '/', true, userRole);
          
          logAuth('WithAuth', 'redirecting_due_to_role', {
            userRole,
            allowedRoles,
            currentPath: router.asPath,
            reason: 'Insufficient role permissions',
            timestamp: Date.now(),
          });

          router.push("/");
          return;
        }
      }

      if (requireAuth && status === "authenticated") {
        logAuth('WithAuth', 'access_granted', {
          userRole: (session.user as any)?.role || "user",
          currentPath: router.asPath,
          timestamp: Date.now(),
        });
      }
    }, [session, status, router, requireAuth, allowedRoles, redirectTo]);

    // Show loading state while checking authentication
    if (requireAuth && status === "loading") {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-white transition-colors duration-200 dark:bg-gray-900">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
        </div>
      );
    }

    // Show loading state while redirecting
    if (requireAuth && status === "unauthenticated") {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-white transition-colors duration-200 dark:bg-gray-900">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

/**
 * Server-side authentication check for getServerSideProps
 */
export function requireAuth(
  context: GetServerSidePropsContext,
  options: WithAuthOptions = {}
) {
  const { allowedRoles = [] } = options;

  return async () => {
    const session = await getServerSession(
      context.req,
      context.res,
      authOptions as any
    );

    if (!session) {
      return {
        redirect: {
          destination: `/Auth/Login?callbackUrl=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
        },
      };
    }

    if (allowedRoles.length > 0) {
      const userRole = (session.user as any)?.role || "user";
      if (!allowedRoles.includes(userRole)) {
        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }

    return {
      props: {
        session,
      },
    };
  };
}

/**
 * Server-side authentication check for specific roles
 */
export function requireRole(roles: string[]) {
  return (context: GetServerSidePropsContext) => requireAuth(context, { allowedRoles: roles });
}

/**
 * Server-side authentication check for shoppers only
 */
export function requireShopper() {
  return requireRole(["shopper"]);
}

/**
 * Server-side authentication check for users only
 */
export function requireUser() {
  return requireRole(["user"]);
}
