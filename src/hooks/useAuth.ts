import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoggedIn = status === 'authenticated' && !!session;
  const isLoading = status === 'loading';
  const user = session?.user;
  const role = (user as any)?.role || 'user';

  // Simple redirect function
  const requireAuth = (redirectTo?: string) => {
    if (!isLoggedIn && !isLoading) {
      const callbackUrl = redirectTo || router.asPath;
      router.push(`/Auth/Login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return false;
    }
    return true;
  };

  // Check if user has required role
  const requireRole = (requiredRole: string) => {
    if (!requireAuth()) return false;
    if (role !== requiredRole) {
      router.push('/Auth/Login?error=insufficient_permissions');
      return false;
    }
    return true;
  };

  return {
    isLoggedIn,
    isLoading,
    user,
    role,
    session,
    status,
    requireAuth,
    requireRole,
  };
};
