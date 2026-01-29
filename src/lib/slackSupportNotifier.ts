const SLACK_SUPPORT_WEBHOOK = process.env.SLACK_SUPPORT_WEBHOOK;

export interface SupportTicketPayload {
  /** Order ID (internal uuid) */
  orderId: string;
  /** Display order number (e.g. OrderID from DB) */
  orderDisplayId?: string;
  /** Order type: regular, reel, restaurant */
  orderType: "regular" | "reel" | "restaurant";
  /** Store/shop/restaurant name */
  storeName?: string;
  /** Order status */
  status?: string;
  /** User's message */
  message: string;
  /** User email (optional) */
  userEmail?: string;
  /** User name (optional) */
  userName?: string;
  /** Customer phone (for support to call for urgency) */
  userPhone?: string;
  /** Ticket number from DB (shown in Slack instead of internal ID) */
  ticketNum?: number;
}

const ORDER_TYPE_LABELS: Record<SupportTicketPayload["orderType"], string> = {
  regular: "🛒 Regular",
  reel: "🎬 Reel",
  restaurant: "🍽️ Restaurant",
};

/**
 * Send a support ticket to Slack using SLACK_SUPPORT_WEBHOOK.
 * Designed for server-side (API route) only.
 */
export async function sendSupportTicketToSlack(ticket: SupportTicketPayload) {
  if (!SLACK_SUPPORT_WEBHOOK) {
    console.error("SLACK_SUPPORT_WEBHOOK is not configured");
    return;
  }

  const orderTypeLabel = ORDER_TYPE_LABELS[ticket.orderType];
  const displayId = ticket.orderDisplayId ?? ticket.orderId;
  const storeDisplay = ticket.storeName ?? "—";
  const statusDisplay = ticket.status ?? "—";
  const userDisplay = ticket.userName
    ? `${ticket.userName}${ticket.userEmail ? ` (${ticket.userEmail})` : ""}`
    : ticket.userEmail ?? "—";
  const phoneDisplay = ticket.userPhone ?? "—";
  const ticketDisplay =
    ticket.ticketNum != null ? `#${ticket.ticketNum}` : "—";

  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🎫 Support Ticket",
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Ticket #*\n\`${ticketDisplay}\`` },
        { type: "mrkdwn", text: `*Type*\n${orderTypeLabel}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Order ID*\n\`${displayId}\`` },
        { type: "mrkdwn", text: `*Store / Shop*\n${storeDisplay}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Order Status*\n${statusDisplay}` },
        { type: "mrkdwn", text: `*From*\n${userDisplay}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*📞 Customer phone (call for urgency)*\n${phoneDisplay}` },
      ],
    },
    { type: "divider" },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Message*\n${ticket.message || "_No message provided._"}`,
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `🕒 ${new Date().toISOString()}` },
      ],
    },
  ];

  try {
    await fetch(SLACK_SUPPORT_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text:
          ticket.ticketNum != null
            ? `Support ticket #${ticket.ticketNum} (Order #${displayId})`
            : `Support ticket for order #${displayId}`,
        blocks,
      }),
    });
  } catch (error) {
    console.error("Failed to send support ticket to Slack", error);
    throw error;
  }
}
