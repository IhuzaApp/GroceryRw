import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { insertSystemLog } from "../queries/system-logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { referenceId } = req.query;

  if (!referenceId || typeof referenceId !== "string") {
    return res.status(400).json({ error: "Reference ID is required" });
  }

  try {
    const statusData = await momoService.getTransferStatus(referenceId);
    res.status(200).json(statusData);
  } catch (error: any) {
    console.error("💥 [MoMo Status API] Error:", error);
    await insertSystemLog(
      "error",
      `MoMo Status API failure: ${error.message || "Unknown"}`,
      "MomoStatusAPI",
      { referenceId, error: error.message || error }
    );
    res.status(500).json({ error: error.message || "Status check failed" });
  }
}
