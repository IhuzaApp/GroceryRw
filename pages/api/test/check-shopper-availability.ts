import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { logger } from "../../../src/utils/logger";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    const user_id = session.user.id;
    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0] + "+00:00"; // HH:MM:SS+00:00 format with timezone
    const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // Sunday = 7

    // Check all shopper availability records for this user
    const GET_ALL_SHOPPER_AVAILABILITY = gql`
      query GetAllShopperAvailability($user_id: uuid!) {
        Shopper_Availability(where: { user_id: { _eq: $user_id } }) {
          id
          user_id
          is_available
          day_of_week
          start_time
          end_time
          created_at
          updated_at
        }
      }
    `;

    // Check current day availability
    const GET_CURRENT_DAY_AVAILABILITY = gql`
      query GetCurrentDayAvailability($user_id: uuid!, $current_day: Int!) {
        Shopper_Availability(
          where: {
            _and: [
              { user_id: { _eq: $user_id } }
              { day_of_week: { _eq: $current_day } }
            ]
          }
        ) {
          id
          user_id
          is_available
          day_of_week
          start_time
          end_time
        }
      }
    `;

    // Check active availability
    const GET_ACTIVE_AVAILABILITY = gql`
      query GetActiveAvailability(
        $user_id: uuid!
        $current_time: timetz!
        $current_day: Int!
      ) {
        Shopper_Availability(
          where: {
            _and: [
              { user_id: { _eq: $user_id } }
              { is_available: { _eq: true } }
              { day_of_week: { _eq: $current_day } }
              { start_time: { _lte: $current_time } }
              { end_time: { _gte: $current_time } }
            ]
          }
        ) {
          id
          user_id
          is_available
          day_of_week
          start_time
          end_time
        }
      }
    `;

    const [allAvailability, currentDayAvailability, activeAvailability] =
      await Promise.all([
        hasuraClient.request(GET_ALL_SHOPPER_AVAILABILITY, { user_id }) as any,
        hasuraClient.request(GET_CURRENT_DAY_AVAILABILITY, {
          user_id,
          current_day: currentDay,
        }) as any,
        hasuraClient.request(GET_ACTIVE_AVAILABILITY, {
          user_id,
          current_time: currentTime,
          current_day: currentDay,
        }) as any,
      ]);

    return res.status(200).json({
      success: true,
      user_id,
      current_time: currentTime,
      current_day: currentDay,
      availability_check: {
        all_records: allAvailability.Shopper_Availability,
        current_day_records: currentDayAvailability.Shopper_Availability,
        active_records: activeAvailability.Shopper_Availability,
        has_any_records: allAvailability.Shopper_Availability.length > 0,
        has_current_day_records:
          currentDayAvailability.Shopper_Availability.length > 0,
        has_active_records: activeAvailability.Shopper_Availability.length > 0,
      },
    });
  } catch (error) {
    logger.error(
      "Error checking shopper availability",
      "CheckShopperAvailability",
      error
    );
    return res.status(500).json({
      success: false,
      error: "Failed to check shopper availability",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
