import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { sendSupportTicketToSlack } from "../../src/lib/slackSupportNotifier";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const ADD_TICKET_REQUEST = gql`
  mutation AddTicketRequest(
    $priority: String!
    $status: String!
    $subject: String!
    $user_id: uuid!
  ) {
    insert_tickets_one(
      object: {
        priority: $priority
        status: $status
        subject: $subject
        user_id: $user_id
      }
    ) {
      id
    }
  }
`;

type Body = {
  orderId: string;
  orderDisplayId?: string;
  orderType: "regular" | "reel" | "restaurant";
  storeName?: string;
  status?: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await getServerSession(req, res, authOptions as any);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = req.body as Body;
    const {
      orderId,
      orderDisplayId,
      orderType,
      storeName,
      status,
      message,
    } = body;

    if (!orderId || !orderType || typeof message !== "string") {
      return res.status(400).json({
        error: "Missing required fields: orderId, orderType, message",
      });
    }

    const displayId = orderDisplayId ?? orderId;
    const subject = `Order issue #${displayId}`;

    // 1. Send ticket to Slack (SLACK_SUPPORT_WEBHOOK)
    await sendSupportTicketToSlack({
      orderId,
      orderDisplayId: displayId,
      orderType,
      storeName,
      status,
      message: message.trim().slice(0, 2000),
      userEmail: session.user?.email ?? undefined,
      userName: session.user?.name ?? undefined,
      userPhone: (session.user as any)?.phone ?? undefined,
    });

    // 2. Insert ticket in DB (category = orderIssues implied by subject; priority = critical)
    if (hasuraClient) {
      await hasuraClient.request(ADD_TICKET_REQUEST, {
        priority: "critical",
        status: "open",
        subject,
        user_id: session.user.id,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Support ticket error:", err);
    return res.status(500).json({
      error: "Failed to submit support ticket",
    });
  }
}
