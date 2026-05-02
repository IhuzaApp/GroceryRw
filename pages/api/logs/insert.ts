import type { NextApiRequest, NextApiResponse } from "next";
import { insertSystemLog } from "../queries/system-logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, message, component, details } = req.body;

  if (!type || !message || !component) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const log = await insertSystemLog(type, message, component, details);
    return res.status(200).json({ success: true, id: log?.id });
  } catch (error: any) {
    console.error("Error inserting manual log:", error);
    return res.status(500).json({ error: "Failed to insert log" });
  }
}
