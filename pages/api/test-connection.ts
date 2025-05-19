import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const TEST_QUERY = gql`
  query TestConnection {
    __typename
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return environment info (without secrets)
  const envInfo = {
    hasuraUrl: process.env.HASURA_GRAPHQL_URL ? "Set" : "Not set",
    hasuraAdminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET ? "Set" : "Not set",
    nextPublicHasuraUrl: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || "Not set",
    nodeEnv: process.env.NODE_ENV || "Not set"
  };

  try {
    if (!hasuraClient) {
      return res.status(500).json({ 
        status: "error", 
        message: "Hasura client is not initialized",
        env: envInfo
      });
    }

    // Attempt a simple query to test the connection
    const data = await hasuraClient.request(TEST_QUERY);
    
    return res.status(200).json({ 
      status: "success", 
      message: "Hasura connection successful",
      data,
      env: envInfo
    });
  } catch (error: any) {
    console.error("Error testing Hasura connection:", error);
    
    return res.status(500).json({ 
      status: "error", 
      message: "Failed to connect to Hasura",
      error: error.message,
      env: envInfo
    });
  }
} 