import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { getSession } from "next-auth/react";

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    // Log more details for connection refused errors
    if (networkError.message?.includes("Failed to fetch")) {
      console.error("Connection to GraphQL server failed. Please check:");
      console.error("1. Is the Hasura server running?");
      console.error(
        "2. Is the NEXT_PUBLIC_HASURA_GRAPHQL_URL environment variable set correctly?"
      );
      console.error("3. Are there any CORS issues?");
    }
  }
});

// Get the GraphQL endpoint URL from environment variables
const graphqlUrl =
  process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL ||
  "http://localhost:8080/v1/graphql";

// Log the GraphQL URL being used (helpful for debugging)
if (typeof window !== "undefined") {
  console.log(`Apollo Client using GraphQL endpoint: ${graphqlUrl}`);
}

// HTTP link to your GraphQL API
const httpLink = new HttpLink({
  uri: graphqlUrl,
  // Add fetch options for better error handling
  fetchOptions: {
    timeout: 30000, // 30 second timeout
  },
});

// Auth header link
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from session if it exists
  const session = await getSession();

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Use a simple authorization header or get it from your session management
      authorization: session ? `Bearer ${session.user?.id || ""}` : "",
      "x-hasura-role": (session?.user as any)?.role || "anonymous",
    },
  };
});

// Create Apollo Client instance
const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
  // Add client name for debugging
  name: "grocery-app-client",
  version: "1.0",
});

export default client;
