import { GraphQLClient } from "graphql-request";

if (!process.env.HASURA_GRAPHQL_URL) {
  throw new Error("HASURA_GRAPHQL_URL is not defined");
}

if (!process.env.HASURA_GRAPHQL_ADMIN_SECRET) {
  throw new Error("HASURA_GRAPHQL_ADMIN_SECRET is not defined");
}

export const hasuraClient = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});
