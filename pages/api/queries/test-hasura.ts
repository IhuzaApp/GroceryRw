import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
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
  try {
    console.log("Testing Hasura connection...");
    console.log("Hasura URL:", process.env.HASURA_GRAPHQL_URL);
    console.log(
      "Hasura Admin Secret present:",
      !!process.env.HASURA_GRAPHQL_ADMIN_SECRET
    );

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request(TEST_QUERY);
    console.log("Connection successful:", data);

    res.status(200).json({
      success: true,
      message: "Connected to Hasura successfully",
      data,
    });
  } catch (error: any) {
    console.error("Connection failed:", error);
    res.status(500).json({
      success: false,
      message: "Failed to connect to Hasura",
      error: error?.message,
      details: error?.response,
    });
  }
}
