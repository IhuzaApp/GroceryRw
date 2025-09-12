import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from 'rsuite';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface ProtectedReelsActionProps {
  children: React.ReactNode;
  action?: string;
  showAuthPrompt?: boolean;
}

export const ProtectedReelsAction: React.FC<ProtectedReelsActionProps> = ({ 
  children, 
  action = 'comment',
  showAuthPrompt = true 
}) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  if (!isLoggedIn) {
    if (showAuthPrompt) {
      return (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="mb-3">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
          <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            Sign in to {action === 'comment' ? 'add comments' : action === 'order' ? 'place orders' : 'continue'}
          </h4>
          <p className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            You need to sign in to {action === 'comment' ? 'add comments' : action === 'order' ? 'place orders' : 'perform this action'}.
          </p>
          <div className="flex gap-2">
            <Link href={`/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`}>
              <Button appearance="primary" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/Auth/Register">
              <Button appearance="ghost" size="sm">
                Register
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

// Higher-order component for protecting reels actions
export const withReelsActionProtection = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    action?: string;
    showAuthPrompt?: boolean;
  }
) => {
  return function ReelsActionProtectedComponent(props: P) {
    const { action = 'comment', showAuthPrompt = true } = options || {};
    
    return (
      <ProtectedReelsAction action={action} showAuthPrompt={showAuthPrompt}>
        <WrappedComponent {...props} />
      </ProtectedReelsAction>
    );
  };
};

// Hook for checking reels action permissions
export const useReelsActionProtection = (action: string = 'comment') => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  const requiresAuth = !isLoggedIn;

  const handleProtectedAction = (callback: () => void) => {
    if (requiresAuth) {
      router.push(`/Auth/Login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }
    callback();
  };

  return {
    canPerform: isLoggedIn,
    requiresAuth,
    handleProtectedAction,
  };
};
