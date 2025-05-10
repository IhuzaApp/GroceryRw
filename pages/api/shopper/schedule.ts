import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";
import { gql } from "graphql-request";

// Define response types
interface ShopperAvailabilityItem {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

interface GetShopperAvailabilityResponse {
  Shopper_Availability: ShopperAvailabilityItem[];
}

interface AddShopperAvailabilityResponse {
  insert_Shopper_Availability: {
    affected_rows: number;
  };
}

interface UpsertShopperAvailabilityResponse {
  insert_Shopper_Availability: {
    affected_rows: number;
    returning: ShopperAvailabilityItem[];
  };
}

// GraphQL queries
const GET_SHOPPER_AVAILABILITY = gql`
  query GetShopperAvailability($user_id: uuid!) {
    Shopper_Availability(where: { user_id: { _eq: $user_id } }) {
      id
      user_id
      day_of_week
      start_time
      end_time
      is_available
      created_at
      updated_at
    }
  }
`;

const ADD_SHOPPER_AVAILABILITY = gql`
  mutation AddShopperAvailability($day_of_week: Int!, $end_time: timetz!, $start_time: timetz!, $user_id: uuid!, $is_available: Boolean!) {
    insert_Shopper_Availability(objects: {
      day_of_week: $day_of_week,
      end_time: $end_time,
      start_time: $start_time,
      user_id: $user_id,
      is_available: $is_available
    }) {
      affected_rows
    }
  }
`;

const UPDATE_SHOPPER_AVAILABILITY = gql`
  mutation UpdateShopperAvailability($user_id: uuid!, $day_of_week: Int!, $start_time: timetz!, $end_time: timetz!, $is_available: Boolean!) {
    update_Shopper_Availability(
      where: { 
        user_id: { _eq: $user_id },
        day_of_week: { _eq: $day_of_week }
      },
      _set: {
        start_time: $start_time,
        end_time: $end_time,
        is_available: $is_available
      }
    ) {
      affected_rows
    }
  }
`;

// Helper function to convert day string to number
const dayToNumber = (day: string): number => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days.indexOf(day) + 1; // 1-based index (Monday = 1, Sunday = 7)
};

// Helper function to convert number to day string
const numberToDay = (num: number): string => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[num - 1] || "Unknown"; // 1-based index (1 = Monday, 7 = Sunday)
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  console.log("Session:", session); // Debugging log to check session

  if (!session || !session.user) {
    console.error("Unauthorized access attempt"); // Debugging log for unauthorized access
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = session.user.id;
  console.log("User ID:", userId); // Debugging log to check user ID

  try {
    // GET request to fetch schedule
    if (req.method === "GET") {
      try {
        const data = await hasuraClient.request<GetShopperAvailabilityResponse>(GET_SHOPPER_AVAILABILITY, {
          user_id: userId,
        });

        console.log("Retrieved availability data:", data.Shopper_Availability);

        // Transform data format for frontend
        const scheduleData = data.Shopper_Availability.map((item) => {
          console.log(`Raw item for day ${item.day_of_week}:`, item);
          const transformedItem = {
            day: numberToDay(item.day_of_week),
            startTime: item.start_time,
            endTime: item.end_time,
            available: item.is_available,
          };
          console.log(`Transformed item for ${transformedItem.day}:`, transformedItem);
          return transformedItem;
        });

        console.log("Transformed schedule data:", scheduleData);

        return res.status(200).json({ 
          schedule: scheduleData,
          hasSchedule: scheduleData.length > 0 
        });
      } catch (error) {
        console.error("Error fetching schedule:", error);
        return res.status(500).json({ error: "Failed to fetch schedule", details: error });
      }
    }
    
    // POST request to save schedule
    else if (req.method === "POST") {
      const { schedule } = req.body;
      
      if (!schedule || !Array.isArray(schedule)) {
        return res.status(400).json({ error: "Invalid schedule data" });
      }
      
      try {
        // First, get the current availability data
        const currentData = await hasuraClient.request<GetShopperAvailabilityResponse>(GET_SHOPPER_AVAILABILITY, {
          user_id: userId,
        });
        
        const currentAvailability = currentData.Shopper_Availability || [];
        const hasExistingSchedule = currentAvailability.length > 0;
        
        console.log("Current availability count:", currentAvailability.length);
        
        // Process each schedule item
        const results = await Promise.all(
          schedule.map(async (slot) => {
            const dayNumber = dayToNumber(slot.day);
            
            // Check if this day already exists in the database
            const existingDay = currentAvailability.find(
              item => item.day_of_week === dayNumber
            );
            
            if (existingDay) {
              console.log(`Updating day ${slot.day} (${dayNumber})`);
              // Update existing entry
              return hasuraClient.request<{ update_Shopper_Availability: { affected_rows: number } }>(
                UPDATE_SHOPPER_AVAILABILITY, {
                  user_id: userId,
                  day_of_week: dayNumber,
                  start_time: slot.startTime,
                  end_time: slot.endTime,
                  is_available: slot.available
                }
              );
            } else {
              console.log(`Creating new entry for day ${slot.day} (${dayNumber})`);
              // Create new entry
              return hasuraClient.request<AddShopperAvailabilityResponse>(
                ADD_SHOPPER_AVAILABILITY, {
                  day_of_week: dayNumber,
                  start_time: slot.startTime,
                  end_time: slot.endTime,
                  user_id: userId,
                  is_available: slot.available
                }
              );
            }
          })
        );
        
        // Count total affected rows
        const totalAffectedRows = results.reduce((total, result) => {
          if ('update_Shopper_Availability' in result) {
            return total + (result.update_Shopper_Availability?.affected_rows || 0);
          } else if ('insert_Shopper_Availability' in result) {
            return total + (result.insert_Shopper_Availability?.affected_rows || 0);
          }
          return total;
        }, 0);
        
        return res.status(200).json({ 
          success: true, 
          affected_rows: totalAffectedRows,
          had_existing_schedule: hasExistingSchedule
        });
      } catch (error) {
        console.error("Error saving schedule:", error);
        return res.status(500).json({ error: "Failed to save schedule", details: error });
      }
    }
    
    // Method not allowed
    else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling shopper availability:", error);
    return res.status(500).json({ error: "Internal server error", details: error });
  }
} 