import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { logger } from "../../../src/utils/logger";

// Test user ID (you can change this to test with different users)
const TEST_USER_ID = "36672ccc-5f44-465a-b2f6-7ff23f4f643f";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get current notification settings
    const GET_NOTIFICATION_SETTINGS = gql`
      query GetNotificationSettings($user_id: uuid!) {
        shopper_notification_settings(where: { user_id: { _eq: $user_id } }) {
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

    const settingsResponse = (await hasuraClient.request(
      GET_NOTIFICATION_SETTINGS,
      {
        user_id: TEST_USER_ID,
      }
    )) as any;

    const currentSettings = settingsResponse.shopper_notification_settings?.[0];

    // Test 1: Check if settings exist
    if (!currentSettings) {
      return res.status(200).json({
        success: true,
        message: "No notification settings found for test user",
        test_user_id: TEST_USER_ID,
        recommendation: "Create notification settings first",
      });
    }

    // Test 2: Check location management logic
    const locationManagementTests = {
      hasLiveLocation: currentSettings.use_live_location,
      hasCustomLocations: currentSettings.custom_locations?.length > 0,
      customLocationsCount: currentSettings.custom_locations?.length || 0,
      maxDistance: currentSettings.max_distance,
      soundEnabled: currentSettings.sound_settings?.enabled,
      soundVolume: currentSettings.sound_settings?.volume,
    };

    // Test 3: Validate location management rules
    const validationResults = {
      // Rule: If custom locations exist, live location should be false
      customLocationRule:
        !currentSettings.use_live_location ||
        currentSettings.custom_locations?.length === 0,
      // Rule: Maximum 2 custom locations
      maxLocationsRule: (currentSettings.custom_locations?.length || 0) <= 2,
      // Rule: Valid max distance
      validDistance: ["5", "10", "15", "20", "25", "30"].includes(
        currentSettings.max_distance
      ),
      // Rule: Valid sound settings
      validSoundSettings:
        currentSettings.sound_settings?.enabled !== undefined &&
        currentSettings.sound_settings?.volume >= 0 &&
        currentSettings.sound_settings?.volume <= 1,
    };

    // Test 4: Check notification types
    const notificationTypes = currentSettings.notification_types || {};
    const typeValidation = {
      hasOrders: notificationTypes.orders !== undefined,
      hasBatches: notificationTypes.batches !== undefined,
      hasEarnings: notificationTypes.earnings !== undefined,
      hasSystem: notificationTypes.system !== undefined,
    };

    // Test 5: Simulate notification check with current settings
    const testNotificationCheck = {
      useLiveLocation: currentSettings.use_live_location,
      customLocations: currentSettings.custom_locations || [],
      maxDistance: currentSettings.max_distance,
      notificationTypes: currentSettings.notification_types,
      soundSettings: currentSettings.sound_settings,
    };

    // Calculate test score
    const totalTests =
      Object.keys(validationResults).length +
      Object.keys(typeValidation).length;
    const passedTests =
      Object.values(validationResults).filter(Boolean).length +
      Object.values(typeValidation).filter(Boolean).length;
    const testScore = Math.round((passedTests / totalTests) * 100);

    logger.info(
      "Location management test completed",
      "LocationManagementTest",
      {
        user_id: TEST_USER_ID,
        test_score: testScore,
        validation_results: validationResults,
        type_validation: typeValidation,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Location management test completed",
      test_user_id: TEST_USER_ID,
      test_score: `${testScore}%`,
      location_management: locationManagementTests,
      validation_results: validationResults,
      notification_types: typeValidation,
      notification_check_simulation: testNotificationCheck,
      recommendations: [
        testScore < 100
          ? "Some validation rules failed - check settings"
          : "All validation rules passed",
        currentSettings.use_live_location &&
        currentSettings.custom_locations?.length > 0
          ? "Warning: Live location is enabled but custom locations exist"
          : "Location management is correctly configured",
        (currentSettings.custom_locations?.length || 0) > 2
          ? "Warning: More than 2 custom locations detected"
          : "Custom location count is within limits",
      ].filter(Boolean),
    });
  } catch (error) {
    logger.error(
      "Error testing location management",
      "LocationManagementTest",
      error
    );
    return res.status(500).json({
      success: false,
      message: "Failed to test location management",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
