import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
    const [componentName] = useState(WrappedComponent.displayName || WrappedComponent.name || 'Unknown');
    const [isInitialized, setIsInitialized] = useState(false);

    // Log page access on mount
    useEffect(() => {
      const currentPath = router.asPath;
      const isAuthenticated = status === "authenticated";
      const userRole = (session?.user as any)?.role || "user";
      
      // logPageAccess(componentName, isAuthenticated, userRole, session);
      // logAuthenticationCheck(componentName, isAuthenticated, userRole, session);
      
      // logAuth('WithAuth', 'component_mounted', {
      //   componentName,
      //   requireAuth,
      //   allowedRoles,
      //   redirectTo,
      //   currentPath,
      //   status,
      //   hasSession: !!session,
      //   isAuthenticated,
      //   userRole,
      //   timestamp: Date.now(),
      // });

      setIsInitialized(true);
    }, []);

    useEffect(() => {
      if (!isInitialized) return;

      const currentPath = router.asPath;
      const isAuthenticated = status === "authenticated";
      const userRole = (session?.user as any)?.role || "user";

      // logAuth('WithAuth', 'status_change', {
      //   componentName,
      //   currentPath,
      //   status,
      //   isAuthenticated,
      //   userRole,
      //   hasSession: !!session,
      //   timestamp: Date.now(),
      // });

      if (requireAuth && status === "unauthenticated") {
        // logRedirect(currentPath, redirectTo, 'User not authenticated', false);
        
        // logAuth('WithAuth', 'redirecting_to_login', {
        //   componentName,
        //   currentPath,
        //   redirectTo,
        //   reason: 'User not authenticated',
        //   status,
        //   timestamp: Date.now(),
        // });

        const callbackUrl = encodeURIComponent(currentPath);
        router.push(`${redirectTo}?callbackUrl=${callbackUrl}`);
        return;
      }

      if (requireAuth && session && allowedRoles.length > 0) {
        // logAuth('WithAuth', 'checking_role_access', {
        //   componentName,
        //   userRole,
        //   allowedRoles,
        //   hasAccess: allowedRoles.includes(userRole),
        //   currentPath,
        //   timestamp: Date.now(),
        // });

        if (!allowedRoles.includes(userRole)) {
          // logRedirect(currentPath, '/', 'Insufficient role permissions', true, userRole);
          
          // logAuth('WithAuth', 'redirecting_due_to_role', {
          //   componentName,
          //   userRole,
          //   allowedRoles,
          //   currentPath,
          //   reason: 'Insufficient role permissions',
          //   timestamp: Date.now(),
          // });

          router.push("/");
          return;
        }
      }

      if (requireAuth && status === "authenticated") {
        // logAuth('WithAuth', 'access_granted', {
        //   componentName,
        //   userRole,
        //   currentPath,
        //   hasSession: !!session,
        //   timestamp: Date.now(),
        // });
      }
    }, [session, status, router, requireAuth, allowedRoles, redirectTo, isInitialized, componentName]);

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
