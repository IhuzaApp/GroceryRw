import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Log the environment variables for debugging
console.log('GraphQL URL:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://plas-starfish-46.hasura.app/v1/graphql',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'x-hasura-access-key': process.env.NEXT_PUBLIC_HASURA_ACCESS_KEY || 'your_access_key',
  },
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

export const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
}); 