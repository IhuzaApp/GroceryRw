const SLACK_ORDERS_WEBHOOK = process.env.SLACK_ORDERS_WEBHOOK;

export type SlackOrderType = "regular" | "reel" | "business" | "restaurant" | "combined";

export interface SlackOrderPayload {
  id: string;
  total: number | string;
  /** Order type for Slack label (regular, reel, business, restaurant, combined) */
  orderType?: SlackOrderType;
  /** Display order number (e.g. OrderID from DB). Falls back to id if missing. */
  orderID?: string;
  /** Store/supermarket name */
  storeName?: string;
  /** Number of units/items ordered */
  units?: number | string;
  /** Customer phone */
  customerPhone?: string;
  /** Customer delivery address */
  customerAddress?: string;
  /** Expected delivery time (e.g. ISO string or readable string) */
  deliveryTime?: string;
}

const ORDER_TYPE_LABELS: Record<SlackOrderType, string> = {
  regular: "🛒 Regular order",
  reel: "🎬 Reel order",
  business: "🏪 Business order",
  restaurant: "🍽️ Restaurant order",
  combined: "📦 Combined order",
};

/**
 * Send a "new order" notification to the orders Slack channel.
 * Uses SLACK_ORDERS_WEBHOOK with a rich block layout.
 */
export async function notifyNewOrderToSlack(order: SlackOrderPayload) {
  if (!SLACK_ORDERS_WEBHOOK) {
    console.error("SLACK_ORDERS_WEBHOOK is not configured");
    return;
  }

  const totalNumber =
    typeof order.total === "string"
      ? parseFloat(order.total || "0")
      : order.total;

  const formattedTotal = Number.isFinite(totalNumber)
    ? totalNumber.toFixed(2)
    : "0.00";

  const displayOrderId = order.orderID ?? order.id;
  const storeName = order.storeName ?? "—";
  const units = order.units != null ? String(order.units) : "—";
  const customerPhone = order.customerPhone ?? "—";
  const customerAddress = order.customerAddress ?? "—";
  const deliveryTime = order.deliveryTime
    ? new Date(order.deliveryTime).toLocaleString()
    : "—";

  const orderTypeLabel = order.orderType
    ? ORDER_TYPE_LABELS[order.orderType]
    : "🛒 New order";

  const blocks = [
    {
      type: "header",
      text: { type: "plain_text", text: "🛒 New Order Created" },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Type*\n${orderTypeLabel}` },
        { type: "mrkdwn", text: `*Order ID*\n\`${displayOrderId}\`` },
        { type: "mrkdwn", text: `*Total*\n$${formattedTotal}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Supermarket*\n${storeName}` },
        { type: "mrkdwn", text: `*Units*\n${units}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Customer phone*\n${customerPhone}` },
        { type: "mrkdwn", text: `*Delivery time*\n${deliveryTime}` },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Address*\n${customerAddress}`,
      },
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        { type: "mrkdwn", text: `📦 Status: *PENDING*` },
        { type: "mrkdwn", text: `🕒 ${new Date().toLocaleString()}` },
      ],
    },
  ];

  try {
    await fetch(SLACK_ORDERS_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });
  } catch (error) {
    console.error("Failed to send order notification to Slack", error);
  }
}
