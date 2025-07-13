import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { logger } from "../../../src/utils/logger";

const GET_SHOPPER_NOTIFICATION_SETTINGS = `
  query GetShopperNotificationSettings($user_id: uuid!) {
    shopper_notification_settings(where: {user_id: {_eq: $user_id}}) {
      id
      user_id
      use_live_location
      custom_locations
      max_distance
      notification_types
      sound_settings
      created_at
      updated_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!hasuraClient) {
      return res.status(500).json({
        success: false,
        message: "Database client not available",
      });
    }

    const user_id = session.user?.id;

    // Get current notification settings
    const settingsResponse = (await hasuraClient.request(
      GET_SHOPPER_NOTIFICATION_SETTINGS,
      {
        user_id,
      }
    )) as any;

    const settings = settingsResponse.shopper_notification_settings?.[0] || {
      use_live_location: true,
      custom_locations: [],
      max_distance: "10",
      notification_types: {
        orders: true,
        batches: true,
        earnings: true,
        system: true,
      },
      sound_settings: {
        enabled: true,
        volume: 0.8,
      },
    };

    // Test the notification check API
    const testLocation = { lat: -1.9441, lng: 30.0619 }; // Kigali coordinates
    const testResponse = await fetch(
      `${
        req.headers.host
          ? `http://${req.headers.host}`
          : "http://localhost:3000"
      }/api/shopper/check-notifications-with-settings`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id,
          current_location: testLocation,
        }),
      }
    );

    const testData = await testResponse.json();

    // Log detailed test results
    logger.info(
      "Notification settings integration test completed",
      "NotificationSettingsIntegration",
      {
        user_id,
        settings,
        test_result: {
          success: testData.success,
          notifications_count: testData.notifications?.length || 0,
          message: testData.message,
          status_code: testResponse.status,
          error_details: testData.error || testData.details,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Notification settings integration test completed",
      data: {
        user_id,
        current_settings: settings,
        test_result: testData,
        integration_status: testData.success ? "working" : "failed",
        test_details: {
          status_code: testResponse.status,
          error_message: testData.message,
          error_details: testData.error || testData.details,
        },
      },
    });
  } catch (error) {
    logger.error(
      "Error testing notification settings integration",
      "NotificationSettingsIntegration",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Failed to test notification settings integration",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
