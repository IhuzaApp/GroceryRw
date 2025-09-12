import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouteProtection } from '../../context/RouteProtectionContext';
import { Button } from 'rsuite';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ProtectedCartProps {
  children: React.ReactNode;
  action?: string;
  showAuthPrompt?: boolean;
}

export const ProtectedCart: React.FC<ProtectedCartProps> = ({ 
  children, 
  action = 'addToCart',
  showAuthPrompt = true 
}) => {
  const { isLoggedIn } = useAuth();
  const { canPerformAction } = useRouteProtection();
  const router = useRouter();

  // Check if user can perform the action
  const canPerform = canPerformAction('/Cart', action);

  if (!canPerform && !isLoggedIn) {
    if (showAuthPrompt) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
            Sign in required
          </h3>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            You need to sign in to {action === 'addToCart' ? 'add items to your cart' : 'perform this action'}.
          </p>
          <div className="flex gap-3">
            <Link href={`/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`}>
              <Button appearance="primary" size="md">
                Sign In
              </Button>
            </Link>
            <Link href="/Auth/Register">
              <Button appearance="ghost" size="md">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    return null;
  }

  return <>{children}</>;
};

// Higher-order component for protecting cart actions
export const withCartProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    action?: string;
    showAuthPrompt?: boolean;
  }
) => {
  return function CartProtectedComponent(props: P) {
    const { action = 'addToCart', showAuthPrompt = true } = options || {};
    
    return (
      <ProtectedCart action={action} showAuthPrompt={showAuthPrompt}>
        <WrappedComponent {...props} />
      </ProtectedCart>
    );
  };
};

// Hook for checking cart action permissions
export const useCartProtection = (action: string = 'addToCart') => {
  const { isLoggedIn } = useAuth();
  const { canPerformAction } = useRouteProtection();
  const router = useRouter();

  const canPerform = canPerformAction('/Cart', action);
  const requiresAuth = !canPerform && !isLoggedIn;

  const handleProtectedAction = (callback: () => void) => {
    if (requiresAuth) {
      router.push(`/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }
    callback();
  };

  return {
    canPerform,
    requiresAuth,
    handleProtectedAction,
  };
};
