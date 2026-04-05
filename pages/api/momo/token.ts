import type { NextApiRequest, NextApiResponse } from "next";
import { momoService } from "../../../src/lib/momoService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("🔑 [MoMo Token API] Starting token request...");

  try {
    const accessToken = await momoService.getAccessToken();

    // We return a simplified response that matches what the frontend might expect,
    // or we could return the full token data. The service handles caching.
    res.status(200).json({ access_token: accessToken });
  } catch (error) {
    console.error("💥 [MoMo Token API] Exception:", error);
    res.status(500).json({ error: "Token fetch failed" });
  }
}
