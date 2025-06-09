import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { logger } from "../../../src/utils/logger";

interface ScheduleResponse {
  Shopper_Availability: Array<{
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession({ req });
    const userId = session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const GET_SCHEDULE = gql`
      query GetShopperSchedule($userId: uuid!) {
        Shopper_Availability(
          where: { user_id: { _eq: $userId } }
          order_by: { day_of_week: asc }
        ) {
          id
      day_of_week
      start_time
      end_time
      is_available
      created_at
      updated_at
    }
  }
`;

        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

    const data = await hasuraClient.request<ScheduleResponse>(GET_SCHEDULE, {
      userId,
    });

    logger.info("Schedule query result:", "ScheduleAPI", {
      userId,
      scheduleCount: data.Shopper_Availability.length,
    });

        return res.status(200).json({
      schedule: data.Shopper_Availability,
      hasSchedule: data.Shopper_Availability.length > 0,
    });
  } catch (error) {
    logger.error("Error fetching schedule:", "ScheduleAPI", error);
    return res.status(500).json({ error: "Failed to fetch schedule" });
  }
}
