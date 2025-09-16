import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { referenceId } = req.query;

  if (!referenceId || typeof referenceId !== "string") {
    return res.status(400).json({ error: "Reference ID is required" });
  }

  try {
    // 1. Get Access Token
    const tokenRes = await fetch(`${process.env.MOMO_SANDBOX_URL}/collection/token/`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY_SANDBOX!,
        "Authorization": `Basic ${Buffer.from(
          `${process.env.MOMO_API_USER_SANDBOX}:${process.env.MOMO_API_KEY_SANDBOX}`
        ).toString("base64")}`,
      },
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      console.error("MTN Token API Error:", errorText);
      return res.status(tokenRes.status).json({ error: errorText });
    }

    const { access_token } = await tokenRes.json();

    // 2. Check Transfer Status
    const statusRes = await fetch(`${process.env.MOMO_SANDBOX_URL}/disbursement/v1_0/transfer/${referenceId}`, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY_SANDBOX!,
        "Authorization": `Bearer ${access_token}`,
        "X-Target-Environment": "sandbox",
      },
    });

    if (!statusRes.ok) {
      const error = await statusRes.text();
      console.error("MTN Status API Error:", error);
      return res.status(statusRes.status).json({ error });
    }

    const statusData = await statusRes.json();
    res.status(200).json(statusData);
  } catch (error) {
    console.error("Status check failed:", error);
    res.status(500).json({ error: "Status check failed" });
  }
}
