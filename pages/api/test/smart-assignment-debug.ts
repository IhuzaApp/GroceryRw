import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// Simple test query
const TEST_QUERY = gql`
  query TestQuery {
    Orders(limit: 1) {
      id
      status
      created_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Test basic connectivity
    const testData = await hasuraClient.request(TEST_QUERY) as any;
    
    // Test smart assignment with sample data
    const testLocation = {
      lat: -1.9441,
      lng: 30.0619
    };

    const testUserId = "test-user-id";

    const smartResponse = await fetch(`${req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000'}/api/shopper/smart-assign-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        current_location: testLocation,
        user_id: testUserId
      })
    });

    const smartData = await smartResponse.json();

    return res.status(200).json({
      success: true,
      message: "Debug test completed",
      results: {
        hasuraConnection: !!testData,
        ordersCount: testData?.Orders?.length || 0,
        smartAssignment: {
          status: smartResponse.status,
          success: smartData.success,
          message: smartData.message,
          error: smartData.error
        }
      }
    });

  } catch (error) {
    logger.error("Debug test failed:", error);
    return res.status(500).json({
      error: "Debug test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
