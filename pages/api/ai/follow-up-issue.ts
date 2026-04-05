import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { sendSupportTicketToSlack } from "../../../src/lib/slackSupportNotifier";
import { notifySystemToSlack } from "../../../src/lib/slackSystemNotifier";

const GET_ISSUE_OR_TICKET = gql`
  query GetIssueOrTicket($code: Int!) {
    Delivery_Issues(where: { code: { _eq: $code } }) {
      id
      priority
      status
    }
    tickets(where: { ticket_num: { _eq: $code } }) {
      id
      priority
      status
    }
  }
`;

const UPDATE_DELIVERY_ISSUE = gql`
  mutation UpdateDeliveryIssuePriority($code: Int!, $priority: String!) {
    update_Delivery_Issues(
      where: { code: { _eq: $code } }
      _set: { priority: $priority }
    ) {
      affected_rows
    }
  }
`;

const UPDATE_TICKET = gql`
  mutation UpdateTicketPriority($code: Int!, $priority: String!) {
    update_tickets(
      where: { ticket_num: { _eq: $code } }
      _set: { priority: $priority }
    ) {
      affected_rows
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id)
    return res.status(401).json({ error: "Unauthorized" });

  const { tracking_code, urgency, message } = req.body;
  if (!tracking_code || !urgency || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const codeNum = parseInt(String(tracking_code).replace(/\D/g, ""), 10);
  if (isNaN(codeNum)) {
    return res.status(400).json({ error: "Invalid tracking code format" });
  }

  if (!hasuraClient)
    return res.status(500).json({ error: "Missing DB client" });

  try {
    const data = await hasuraClient.request<any>(GET_ISSUE_OR_TICKET, {
      code: codeNum,
    });

    const isDeliveryIssue = data.Delivery_Issues?.length > 0;
    const isTicket = data.tickets?.length > 0;

    if (!isDeliveryIssue && !isTicket) {
      return res.status(404).json({
        error: "Could not find any issue or ticket with that tracking code.",
      });
    }

    if (isDeliveryIssue) {
      await hasuraClient.request(UPDATE_DELIVERY_ISSUE, {
        code: codeNum,
        priority: urgency,
      });
    } else {
      await hasuraClient.request(UPDATE_TICKET, {
        code: codeNum,
        priority: urgency,
      });
    }

    const urgencyIndicator =
      urgency === "high"
        ? "🔴 HIGH"
        : urgency === "medium"
        ? "🟡 MEDIUM"
        : "🟢 LOW";
    const typeLabel = isDeliveryIssue ? "Delivery Issue" : "Support Ticket";

    // 1. Notify Support Slack
    await sendSupportTicketToSlack({
      orderId: "N/A",
      orderDisplayId: `Follow-up on ${typeLabel} #${codeNum}`,
      orderType: "general" as any,
      message: `[FOLLOW UP - ${urgencyIndicator}] ${message}`,
      userEmail: session.user.email,
      userName: session.user.name,
      ticketNum: codeNum,
    });

    // 2. Notify System Slack
    await notifySystemToSlack({
      title: `🚨 User Follow-Up: ${typeLabel} #${codeNum}`,
      message: `${
        session.user.name || "A user"
      } is following up on ${typeLabel} #${codeNum}.\n*Urgency*: ${urgencyIndicator}\n*Message*: ${message}`,
      context: {
        userId: session.user.id,
        email: session.user.email,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Priority updated and support notified.",
    });
  } catch (error) {
    console.error("Error updating issue priority:", error);
    return res.status(500).json({ error: "Failed to process follow-up" });
  }
}
