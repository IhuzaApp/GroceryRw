import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { logger } from "../../../src/utils/logger";
import { authOptions } from "../auth/[...nextauth]";

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

interface UpsertScheduleResponse {
  insert_Shopper_Availability: {
    affected_rows: number;
    returning: Array<{
      id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      is_available: boolean;
    }>;
  };
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

const UPSERT_SCHEDULE = gql`
  mutation UpsertShopperSchedule($schedules: [Shopper_Availability_insert_input!]!) {
    insert_Shopper_Availability(
      objects: $schedules,
      on_conflict: {
        constraint: shopper_availability_user_id_day_of_week_key,
        update_columns: [start_time, end_time, is_available]
      }
    ) {
      affected_rows
      returning {
        id
        day_of_week
        start_time
        end_time
        is_available
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.info("Schedule API request received", "ScheduleAPI", {
      method: req.method,
    });

  const session = await getServerSession(req, res, authOptions);

    if (!session) {
      logger.error("No session found", "ScheduleAPI");
      return res.status(401).json({ error: "Unauthorized - No session found" });
    }

    const userId = session.user?.id;
    
    if (!userId) {
      logger.error("No user ID in session", "ScheduleAPI");
      return res.status(401).json({ error: "Unauthorized - No user ID found" });
    }

        if (!hasuraClient) {
      logger.error("Hasura client not initialized", "ScheduleAPI");
          throw new Error("Hasura client is not initialized");
        }

    if (req.method === "GET") {
      logger.info("Processing GET request", "ScheduleAPI", { userId });

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
    } else if (req.method === "POST") {
      logger.info("Processing POST request", "ScheduleAPI", { userId });

      const { schedule } = req.body;

      if (!Array.isArray(schedule)) {
        logger.error("Invalid schedule format", "ScheduleAPI", { 
          receivedType: typeof schedule 
        });
        return res.status(400).json({ error: "Invalid schedule format" });
      }

      const scheduleInput = schedule.map((slot) => ({
              user_id: userId,
        day_of_week: slot.day_of_week,
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available,
      }));

      logger.info("Upserting schedule", "ScheduleAPI", { 
        userId,
        scheduleCount: scheduleInput.length 
      });

      const result = await hasuraClient.request<UpsertScheduleResponse>(UPSERT_SCHEDULE, {
        schedules: scheduleInput,
      });

      logger.info("Schedule update result:", "ScheduleAPI", {
        userId,
        affectedRows: result.insert_Shopper_Availability.affected_rows,
      });

        return res.status(200).json({
          success: true,
        affected_rows: result.insert_Shopper_Availability.affected_rows,
      });
    }

    logger.warn("Method not allowed", "ScheduleAPI", { method: req.method });
      return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    logger.error(
      "Error in schedule API:",
      "ScheduleAPI",
      error instanceof Error ? error.message : "Unknown error"
    );
    return res.status(500).json({ 
      error: "Failed to process schedule request",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
