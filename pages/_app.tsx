import "../styles/globals.css";
import type { AppProps } from "next/app";
import "rsuite/dist/rsuite-no-reset.min.css";
import { CartProvider } from "../src/context/CartContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <Component {...pageProps} />
    </CartProvider>
  );
}
