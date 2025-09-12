import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import {
  isRoleSwitchInProgress,
  clearRoleSwitchFlag,
} from "../src/lib/sessionRefresh";
import { ThemeProvider } from "../src/context/ThemeContext";
import InstallPrompt from "../src/components/ui/InstallPrompt";
import Head from "next/head";

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
import "../src/lib/navigationDebugConsole"; // Initialize navigation debug console
import DebugFloatingButton from "../src/components/debug/DebugFloatingButton";

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

  // Show loading state while session is being determined
  if (status === "loading") {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white transition-colors duration-200 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-green-800"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Head>
        <meta name="application-name" content="Grocery App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Grocery App" />
        <meta
          name="description"
          content="Your convenient grocery shopping app"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#10b981" />

        <link rel="apple-touch-icon" href="/app-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/app-icon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/app-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/app-icon.png" color="#10b981" />
        <link rel="shortcut icon" href="/favicon.ico" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://your-app-domain.com" />
        <meta name="twitter:title" content="Grocery App" />
        <meta
          name="twitter:description"
          content="Your convenient grocery shopping app"
        />
        <meta name="twitter:image" content="/app-icon.png" />
        <meta name="twitter:creator" content="@yourusername" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Grocery App" />
        <meta
          property="og:description"
          content="Your convenient grocery shopping app"
        />
        <meta property="og:site_name" content="Grocery App" />
        <meta property="og:url" content="https://your-app-domain.com" />
        <meta property="og:image" content="/app-icon.png" />
      </Head>
      <SessionProvider
        session={(pageProps as any).session}
        basePath="/api/auth"
        refetchInterval={0} // Disable automatic refetching
        refetchOnWindowFocus={false} // Disable refetch on window focus
        refetchWhenOffline={false} // Disable refetch when offline
      >
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <CartProvider>
              <ChatProvider>
                <GoogleMapProvider>
                  <SessionRefreshHandler>
                    <Toaster position="top-right" />
                    <Component {...pageProps} />
                    <InstallPrompt />
                    <DebugFloatingButton />
                  </SessionRefreshHandler>
                </GoogleMapProvider>
              </ChatProvider>
            </CartProvider>
          </AuthProvider>
        </ApolloProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
