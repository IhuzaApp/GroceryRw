import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

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
    console.log("Testing smart assignment API...");
    
    // Test basic connectivity
    const testData = await hasuraClient.request(TEST_QUERY) as any;
    console.log("Hasura connection test:", testData);
    
    // Test smart assignment with sample data
    const testLocation = {
      lat: -1.9441,
      lng: 30.0619
    };

    const testUserId = "test-user-id-123";

    console.log("Testing smart assignment with:", { testLocation, testUserId });

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

    console.log("Smart assignment response status:", smartResponse.status);

    const smartData = await smartResponse.json();
    console.log("Smart assignment response data:", smartData);

    return res.status(200).json({
      success: true,
      message: "Simple test completed",
      results: {
        hasuraConnection: !!testData,
        ordersCount: testData?.Orders?.length || 0,
        smartAssignment: {
          status: smartResponse.status,
          success: smartData.success,
          message: smartData.message,
          error: smartData.error,
          details: smartData.details
        }
      }
    });

  } catch (error) {
    console.error("Simple test failed:", error);
    return res.status(500).json({
      error: "Simple test failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}
