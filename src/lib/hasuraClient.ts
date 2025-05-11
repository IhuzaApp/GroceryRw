import { GraphQLClient } from "graphql-request";

// Check if code is running on client side
const isClient = typeof window !== 'undefined';

// Only validate environment variables on the server side
if (!isClient) {
  if (!process.env.HASURA_GRAPHQL_URL) {
    throw new Error("HASURA_GRAPHQL_URL is not defined");
  }

  if (!process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
    throw new Error("HASURA_GRAPHQL_ADMIN_SECRET is not defined");
  }
}

// Create the client only on server side, or with next public variables on client side
export const hasuraClient = !isClient 
  ? new GraphQLClient(process.env.HASURA_GRAPHQL_URL as string, {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET as string,
      },
    })
  : null; // Return null on client side to prevent direct usage
