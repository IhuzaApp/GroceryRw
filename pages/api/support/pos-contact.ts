import { NextApiRequest, NextApiResponse } from "next";
import { sendPOSContactRequestToSlack } from "../../../src/lib/slackSupportNotifier";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { shopName, ownerName, phone } = req.body;

        if (!shopName || !ownerName || !phone) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await sendPOSContactRequestToSlack({
            shopName,
            ownerName,
            phone,
        });

        res.status(200).json({ message: "Success" });
    } catch (error: any) {
        console.error("Error in POS contact API:", error);
        res.status(500).json({
            error: "Failed to process request",
            message: error.message
        });
    }
}
