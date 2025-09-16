import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, currency, payerNumber, externalId, payerMessage, payeeNote } = req.body;

  // Validate required fields
  if (!amount || !currency || !payerNumber) {
    return res.status(400).json({ 
      error: "Missing required fields: amount, currency, payerNumber" 
    });
  }

  const referenceId = uuidv4();

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

    // 2. Send Transfer request
    const transferRes = await fetch(`${process.env.MOMO_SANDBOX_URL}/disbursement/v1_0/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.MOMO_SUBSCRIPTION_KEY_SANDBOX!,
        "Authorization": `Bearer ${access_token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": "sandbox",
      },
      body: JSON.stringify({
        amount: amount.toString(),
        currency,
        externalId: externalId || `SHOPPER-PAYMENT-${Date.now()}`,
        payee: {
          partyIdType: "MSISDN",
          partyId: payerNumber, // e.g. "2507xxxxxxx"
        },
        payerMessage: payerMessage || "Payment for Shopper Items",
        payeeNote: payeeNote || "Shopper payment confirmation",
      }),
    });

    if (transferRes.status === 202) {
      res.status(200).json({ 
        referenceId, 
        message: "Payment request accepted",
        status: "PENDING"
      });
    } else {
      const error = await transferRes.text();
      console.error("MTN Transfer API Error:", error);
      res.status(transferRes.status).json({ error });
    }
  } catch (error) {
    console.error("Payment request failed:", error);
    res.status(500).json({ error: "Payment request failed" });
  }
}
