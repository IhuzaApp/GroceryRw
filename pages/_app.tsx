import Router, { useRouter } from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

// Suppress AbortError messages in development
if (process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("AbortError") ||
        message.includes("upstream image response failed"))
    ) {
      return; // Suppress these specific errors
    }
    originalConsoleError.apply(console, args);
  };
}
import {
  isRoleSwitchInProgress,
  clearRoleSwitchFlag,
} from "../src/lib/sessionRefresh";
import { ThemeProvider } from "../src/context/ThemeContext";
import { LanguageProvider } from "../src/context/LanguageContext";
import InstallPrompt from "../src/components/ui/InstallPrompt";
import Head from "next/head";

// Configure NProgress
NProgress.configure({ showSpinner: false });

// Function to generate dynamic page titles
const getPageTitle = (
  pathname: string,
  query: any = {},
  names: { shopName?: string | null; restaurantName?: string | null } = {}
) => {
  const baseTitle = "Plas";

  // Handle dynamic routes and specific pages
  if (pathname === "/") {
    return `${baseTitle} - Home`;
  }

  if (pathname === "/Plasa") {
    return `${baseTitle} - Shopper Dashboard`;
  }

  if (pathname.startsWith("/Plasa/chat")) {
    if (pathname.includes("/chat/[")) {
      return `${baseTitle} - Chat`;
    }
    return `${baseTitle} - Messages`;
  }

  if (pathname.startsWith("/Plasa/orders")) {
    return `${baseTitle} - Orders`;
  }

  if (pathname.startsWith("/Plasa/invoices")) {
    return `${baseTitle} - Invoices`;
  }

  if (pathname.startsWith("/Plasa/Earnings")) {
    return `${baseTitle} - Earnings`;
  }

  if (pathname.startsWith("/Plasa/active-batches")) {
    return `${baseTitle} - Active Batches`;
  }

  if (pathname.startsWith("/Plasa/Settings")) {
    return `${baseTitle} - Settings`;
  }

  if (pathname.startsWith("/Plasa/ShopperProfile")) {
    return `${baseTitle} - Profile`;
  }

  if (pathname.startsWith("/shops/")) {
    const shopId = query.id;
    if (names.shopName) {
      return `${baseTitle} - ${names.shopName}`;
    }
    return `${baseTitle} - Shop ${shopId ? `#${shopId}` : ""}`;
  }

  if (pathname.startsWith("/restaurant/")) {
    const restaurantId = query.id;
    if (names.restaurantName) {
      return `${baseTitle} - ${names.restaurantName}`;
    }
    return `${baseTitle} - Restaurant ${
      restaurantId ? `#${restaurantId}` : ""
    }`;
  }

  if (pathname.startsWith("/Recipes/")) {
    if (pathname.includes("/[")) {
      return `${baseTitle} - Recipe`;
    }
    return `${baseTitle} - Recipes`;
  }

  if (pathname.startsWith("/Messages")) {
    if (pathname.includes("/[")) {
      return `${baseTitle} - Chat`;
    }
    return `${baseTitle} - Messages`;
  }

  if (pathname.startsWith("/CurrentPendingOrders")) {
    if (pathname.includes("/viewOrderDetails/")) {
      return `${baseTitle} - Order Details`;
    }
    return `${baseTitle} - Pending Orders`;
  }

  if (pathname.startsWith("/Cart")) {
    return `${baseTitle} - Shopping Cart`;
  }

  if (pathname.startsWith("/FoodCart")) {
    return `${baseTitle} - Food Cart`;
  }

  if (pathname.startsWith("/Myprofile")) {
    return `${baseTitle} - My Profile`;
  }

  if (pathname.startsWith("/Reels")) {
    return `${baseTitle} - Reels`;
  }

  if (pathname.startsWith("/plasBusiness")) {
    return `${baseTitle} - Business Marketplace`;
  }

  if (pathname.startsWith("/Auth/Login")) {
    return `${baseTitle} - Login`;
  }

  if (pathname.startsWith("/Auth/Register")) {
    return `${baseTitle} - Register`;
  }

  // Default fallback - convert pathname to readable format
  const cleanPath = pathname
    .replace(/^\//, "") // Remove leading slash
    .replace(/\//g, " - ") // Replace slashes with dashes
    .replace(/\[.*?\]/g, "") // Remove dynamic route brackets
    .replace(/-+/g, " - ") // Replace multiple dashes with single dash
    .trim();

  return cleanPath ? `${baseTitle} - ${cleanPath}` : baseTitle;
};
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
import { FoodCartProvider } from "../src/context/FoodCartContext";
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
  const [pageTitle, setPageTitle] = useState("Plas");
  const [shopName, setShopName] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const router = useRouter();

  // Fetch shop name when on shop page
  useEffect(() => {
    const fetchShopName = async (shopId: string) => {
      try {
        const response = await fetch(`/api/shops/${shopId}`);
        if (response.ok) {
          const data = await response.json();
          setShopName(data.shop?.name || `Shop #${shopId}`);
        } else {
          setShopName(`Shop #${shopId}`);
        }
      } catch (error) {
        setShopName(`Shop #${shopId}`);
      }
    };

    const fetchRestaurantName = async (restaurantId: string) => {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`);
        if (response.ok) {
          const data = await response.json();
          setRestaurantName(
            data.restaurant?.name || `Restaurant #${restaurantId}`
          );
        } else {
          setRestaurantName(`Restaurant #${restaurantId}`);
        }
      } catch (error) {
        setRestaurantName(`Restaurant #${restaurantId}`);
      }
    };

    if (router.pathname.startsWith("/shops/") && router.query.id) {
      fetchShopName(router.query.id as string);
    } else if (router.pathname.startsWith("/restaurant/") && router.query.id) {
      fetchRestaurantName(router.query.id as string);
    } else {
      setShopName(null);
      setRestaurantName(null);
    }
  }, [router.pathname, router.query.id]);

  // Update page title when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      const title = getPageTitle(router.pathname, router.query, {
        shopName,
        restaurantName,
      });
      setPageTitle(title);
    };

    // Set initial title
    handleRouteChange();

    // Listen for route changes
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.pathname, router.query, shopName, restaurantName]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Head>
        <title>{pageTitle}</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="application-name" content="Plas" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pla" />
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

        <link rel="apple-touch-icon" href="/assets/logos/PlasIcon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/assets/logos/PlasIcon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/assets/logos/PlasIcon.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/assets/logos/PlasIcon.png"
          color="#10b981"
        />
        <link rel="shortcut icon" href="/assets/logos/PlasIcon.png" />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://your-app-domain.com" />
        <meta name="twitter:title" content={pageTitle} />
        <meta
          name="twitter:description"
          content="Your convenient grocery shopping app"
        />
        <meta name="twitter:image" content="/assets/logos/PlasIcon.png" />
        <meta name="twitter:creator" content="@yourusername" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content="Your convenient grocery shopping app"
        />
        <meta property="og:site_name" content="Plas" />
        <meta property="og:url" content="https://plas.rw" />
        <meta property="og:image" content="/assets/logos/PlasIcon.png" />
      </Head>
      <SessionProvider
        session={(pageProps as any).session}
        basePath="/api/auth"
        refetchInterval={5 * 60} // Refetch every 5 minutes
        refetchOnWindowFocus={true} // Refetch when window gains focus
        refetchWhenOffline={false}
      >
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <CartProvider>
              <FoodCartProvider>
                <ChatProvider>
                  <GoogleMapProvider>
                    <SessionRefreshHandler>
                      <Toaster position="top-right" />
                      <Component {...pageProps} />
                      <InstallPrompt />
                    </SessionRefreshHandler>
                  </GoogleMapProvider>
                </ChatProvider>
              </FoodCartProvider>
            </CartProvider>
          </AuthProvider>
        </ApolloProvider>
      </SessionProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
