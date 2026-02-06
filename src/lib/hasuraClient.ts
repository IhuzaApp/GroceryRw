import { GraphQLClient } from "graphql-request";

// Check if code is running on client side
const isClient = typeof window !== "undefined";

// Do not throw at module load: Vercel Build (e.g. Preview) often runs without
// Production env vars, so "Collecting page data" would fail. Export null when
// env is missing; callers use `if (!hasuraClient)`. Production runtime has
// env vars set, so the client is created there.
const hasEnv =
  !!process.env.HASURA_GRAPHQL_URL &&
  !!process.env.HASURA_GRAPHQL_ADMIN_SECRET;

export const hasuraClient =
  !isClient && hasEnv
    ? new GraphQLClient(process.env.HASURA_GRAPHQL_URL as string, {
        headers: {
          "x-hasura-admin-secret": process.env
            .HASURA_GRAPHQL_ADMIN_SECRET as string,
        },
      })
    : null;
