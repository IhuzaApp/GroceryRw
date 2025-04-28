import "../styles/globals.css";
import type { AppProps } from "next/app";
import "rsuite/dist/rsuite-no-reset.min.css";
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </AuthProvider>
  );
}
