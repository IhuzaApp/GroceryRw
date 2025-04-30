import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure NProgress
NProgress.configure({ showSpinner: false });
// Bind NProgress events
Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeComplete', () => NProgress.done());
Router.events.on('routeChangeError', () => NProgress.done());

import "../styles/globals.css";
import type { AppProps } from "next/app";
import 'rsuite/dist/rsuite-no-reset.min.css';
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext";
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={(pageProps as any).session}>
      <AuthProvider>
        <CartProvider>
          <Toaster position="top-right" />
          <Component {...pageProps} />
        </CartProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
