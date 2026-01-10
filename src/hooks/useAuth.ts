import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoggedIn = status === "authenticated" && !!session;
  const isLoading = status === "loading";
  const user = session?.user;
  const role = (user as any)?.role || "user";
  const isGuest = (user as any)?.is_guest || false;

  // Simple redirect function
  const requireAuth = (redirectTo?: string, allowGuest: boolean = false) => {
    if (!isLoggedIn && !isLoading) {
      const callbackUrl = redirectTo || router.asPath;
      router.push(`/Auth/Login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return false;
    }

    // If guest is not allowed and user is a guest, redirect to login
    if (!allowGuest && isGuest && isLoggedIn) {
      const callbackUrl = redirectTo || router.asPath;
      router.push(
        `/Auth/Login?callbackUrl=${encodeURIComponent(
          callbackUrl
        )}&message=Please sign in with a full account`
      );
      return false;
    }

    return true;
  };

  // Check if user has required role (guests are not allowed for role-based access)
  const requireRole = (requiredRole: string) => {
    if (!requireAuth(undefined, false)) return false;
    if (role !== requiredRole) {
      router.push("/Auth/Login?error=insufficient_permissions");
      return false;
    }
    return true;
  };

  return {
    isLoggedIn,
    isLoading,
    user,
    role,
    isGuest,
    session,
    status,
    requireAuth,
    requireRole,
  };
};
