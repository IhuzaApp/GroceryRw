import "../styles/globals.css";
import { ApolloProvider } from '@apollo/client';
import { client } from '../lib/apollo-client';
import type { AppProps } from "next/app";
import "rsuite/dist/rsuite-no-reset.min.css";
import { AuthProvider } from '../src/context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ApolloProvider>
  );
}
