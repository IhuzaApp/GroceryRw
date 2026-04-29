import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";
import { insertSystemLog } from "../queries/system-logs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🔑 [MoMo Token API] Starting token request...");

  try {
    const accessToken = await momoService.getAccessToken("collection");

    // We return a simplified response that matches what the frontend might expect,
    // or we could return the full token data. The service handles caching.
    res.status(200).json({ access_token: accessToken });
  } catch (error: any) {
    console.error("💥 [MoMo Token API] Exception:", error);
    await insertSystemLog(
      "error",
      `MoMo Token API failure: ${error.message || "Unknown"}`,
      "MomoTokenAPI",
      { error: error.message || error }
    );
    res.status(500).json({ error: "Token fetch failed" });
  }
}
