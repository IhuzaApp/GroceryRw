import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { notifyDelayedOrderToSlack } from "../../../src/lib/slackSystemNotifier";
import { sendDelayedOrderNotification } from "../../../src/services/fcmService";

const GET_DELAYED_ORDERS = gql`
  query GetDelayedOrders($now: timestamptz!) {
    Orders(where: {
      status: { _nin: ["delivered", "cancelled"] },
      delivery_time: { _lt: $now }
    }) {
      id
      OrderID
      status
      delivery_time
      Shop { name }
      orderedBy { id phone }
      shoppers { id phone full_name phone_number }
    }
    reel_orders(where: {
      status: { _nin: ["delivered", "cancelled"] },
      delivery_time: { _lt: $now }
    }) {
      id
      OrderID
      status
      delivery_time
      Reel { title }
      User { id phone }
      shoppers { id phone full_name phone_number }
    }
    restaurant_orders(where: {
      status: { _nin: ["delivered", "cancelled"] },
      delivery_time: { _lt: $now }
    }) {
      id
      OrderID
      status
      delivery_time
      Restaurant { name }
      orderedBy { id phone }
      shoppers { id phone full_name phone_number }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authorization check for Vercel Cron
  if (process.env.NODE_ENV === "production" && 
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    // return res.status(401).json({ error: "Unauthorized" });
    // In some environments CRON_SECRET might not be set, so we can also check for vercel specific header
  }

  try {
    if (!hasuraClient) {
      return res.status(503).json({ error: "Hasura client not initialized" });
    }
    const now = new Date().toISOString();
    const data = await hasuraClient.request<any>(GET_DELAYED_ORDERS, { now });

    const allDelayed: any[] = [
      ...(data.Orders || []).map((o: any) => ({ ...o, type: "regular" })),
      ...(data.reel_orders || []).map((o: any) => ({ ...o, type: "reel" })),
      ...(data.restaurant_orders || []).map((o: any) => ({ ...o, type: "restaurant" })),
    ];

    if (allDelayed.length === 0) {
      return res.status(200).json({ message: "No delayed orders found." });
    }

    console.log(`🔍 [Delayed Orders Cron] Found ${allDelayed.length} delayed orders.`);

    // Process notifications
    for (const order of allDelayed) {
      const orderId = order.id;
      const orderNumber = order.OrderID != null ? String(order.OrderID).padStart(4, "0") : "—";
      const customerId = order.orderedBy?.id || order.User?.id;
      const shopperId = order.shoppers?.id;
      
      const est = new Date(order.delivery_time).getTime();
      const diffMs = Date.now() - est;
      const minutesDelayed = Math.round(diffMs / 60000);

      // 1. Send FCM to Customer
      if (customerId) {
        await sendDelayedOrderNotification(customerId, orderId, minutesDelayed, orderNumber);
      }

      // 2. Send FCM to Shopper (nudge)
      if (shopperId) {
        // We can reuse the same notification or customize it for the shopper
        await sendDelayedOrderNotification(shopperId, orderId, minutesDelayed, orderNumber);
      }
    }

    // 3. Send Summary to Slack
    const summaryText = allDelayed.map(o => {
      const orderNumber = o.OrderID != null ? String(o.OrderID).padStart(4, "0") : o.id.substring(0, 8);
      const store = o.Shop?.name || o.Reel?.title || o.Restaurant?.name || "Unknown";
      const delay = Math.round((Date.now() - new Date(o.delivery_time).getTime()) / 60000);
      return `• *#${orderNumber}* (${o.status}) - ${store} - ${delay}m late`;
    }).join("\n");

    await fetch(process.env.SLACK_GENERAL_WEBHOOK!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `⚠️ *Delayed Orders Summary (Every 5 Hours)*\nFound ${allDelayed.length} delayed orders:\n\n${summaryText}`,
        attachments: [{
          color: "#E01E5A",
          footer: "Plasa Delayed Orders Cron",
          ts: Math.floor(Date.now() / 1000)
        }]
      })
    });

    return res.status(200).json({ 
      success: true, 
      count: allDelayed.length,
      processed: true 
    });
  } catch (err) {
    console.error("❌ [Delayed Orders Cron] Error:", err);
    return res.status(500).json({ error: "Cron failed" });
  }
}
