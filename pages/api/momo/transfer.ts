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

  const { amount, currency, payerNumber, externalId, payerMessage, payeeNote } =
    req.body;

  // Validate required fields
  if (!amount || !currency || !payerNumber) {
    return res.status(400).json({
      error: "Missing required fields: amount, currency, payerNumber",
    });
  }

  try {
    const response = await momoService.transfer({
      amount,
      currency,
      payeeId: payerNumber,
      externalId: externalId || `TRANSFER-${Date.now()}`,
      payerMessage: payerMessage || "Transfer request",
      payeeNote: payeeNote || "Transfer confirmation",
    });

    res.status(200).json({
      ...response,
      message: "Transfer request accepted",
      status: "PENDING",
    });
  } catch (error: any) {
    console.error("💥 [MoMo Transfer API] Error:", error);
    await insertSystemLog(
      "error",
      `MoMo Transfer API failure: ${error.message || "Unknown"}`,
      "MomoTransferAPI",
      { amount, payerNumber, error: error.message || error }
    );
    res.status(500).json({ error: error.message || "Transfer request failed" });
  }
}
