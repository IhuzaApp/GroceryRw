import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getSession } from 'next-auth/react';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

// HTTP link to your GraphQL API
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || 'http://localhost:8080/v1/graphql',
});

// Auth header link
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from session if it exists
  const session = await getSession();
  
  // Get JWT token from session cookie if available
  // In a real app, you might need to extract this from the session
  // or use a different authentication mechanism
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Use a simple authorization header or get it from your session management
      authorization: session ? `Bearer ${session.user?.id || ''}` : "",
      "x-hasura-role": (session?.user as any)?.role || "anonymous",
    }
  };
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client; 