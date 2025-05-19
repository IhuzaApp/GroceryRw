import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  isRoleSwitchInProgress,
  clearRoleSwitchFlag,
} from "../src/lib/sessionRefresh";

// Configure NProgress
NProgress.configure({ showSpinner: false });
// Bind NProgress events
Router.events.on("routeChangeStart", () => NProgress.start());
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

import "../styles/globals.css";
import type { AppProps } from "next/app";
import "rsuite/dist/rsuite-no-reset.min.css";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext";
import { ChatProvider } from "../src/context/ChatContext";
import { Toaster } from "react-hot-toast";
import { GoogleMapProvider } from "../src/context/GoogleMapProvider";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "../src/lib/apolloClient";

// Component to handle session refresh after role switching
function SessionRefreshHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Check if we need to refresh the session due to role switching
    const isSwitchingRole = isRoleSwitchInProgress();

    if (isSwitchingRole && status === "authenticated") {
      // Clear the flag
      clearRoleSwitchFlag();

      // Force reload the page to ensure we have the latest session data
      window.location.reload();
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider
      session={(pageProps as any).session}
      basePath="/api/auth"
      refetchInterval={0} // Disable automatic refetching
    >
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <CartProvider>
            <ChatProvider>
              <GoogleMapProvider>
                <SessionRefreshHandler>
                  <Toaster position="top-right" />
                  <Component {...pageProps} />
                </SessionRefreshHandler>
              </GoogleMapProvider>
            </ChatProvider>
          </CartProvider>
        </AuthProvider>
      </ApolloProvider>
    </SessionProvider>
  );
}
