import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await fetch(
      `${process.env.MOMO_SANDBOX_URL}/collection/token/`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key":
            process.env.MOMO_SUBSCRIPTION_KEY_SANDBOX!,
          Authorization: `Basic ${Buffer.from(
            `${process.env.MOMO_API_USER_SANDBOX}:${process.env.MOMO_API_KEY_SANDBOX}`
          ).toString("base64")}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MTN Token API Error:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.status(200).json(data); // { access_token, token_type, expires_in }
  } catch (error) {
    console.error("Token fetch failed:", error);
    res.status(500).json({ error: "Token fetch failed" });
  }
}
