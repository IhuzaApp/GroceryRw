import type { NextApiRequest, NextApiResponse } from "next";
import { cleanupExpiredNotifications } from "../../../src/services/fcmService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Simple protection: only allow GET with a specific key or just allow it for now
  // In production, this should be called by a secure CRON job

  try {
    const deletedCount = await cleanupExpiredNotifications();
    return res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} expired notifications.`,
    });
  } catch (error: any) {
    console.error("Cleanup API Error:", error);
    return res.status(500).json({
      success: true,
      error: error.message,
    });
  }
}
