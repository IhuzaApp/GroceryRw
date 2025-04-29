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
