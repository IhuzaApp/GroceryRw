import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import {
  sendSupportTicketToSlack,
  sendRequestEnableStoreToSlack,
} from "../../src/lib/slackSupportNotifier";
import { logErrorToSlack } from "../../src/lib/slackErrorReporter";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const ADD_TICKET_REQUEST = gql`
  mutation AddTicketRequest(
    $priority: String = ""
    $status: String = ""
    $subject: String = ""
    $user_id: uuid = ""
    $category: String = ""
  ) {
    insert_tickets(
      objects: {
        priority: $priority
        status: $status
        subject: $subject
        user_id: $user_id
        category: $category
      }
    ) {
      affected_rows
      returning {
        ticket_num
      }
    }
  }
`;

type Body =
  | {
      requestType?: "order";
      orderId: string;
      orderDisplayId?: string;
      orderType: "regular" | "reel" | "restaurant";
      storeName?: string;
      status?: string;
      message: string;
    }
  | {
      requestType: "enable_store";
      storeId: string;
      storeName: string;
      message?: string;
      businessAccountId?: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as {
    user?: { id?: string; name?: string | null; email?: string | null; phone?: string };
  } | null;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const body = req.body as Body;

    // Handle "request to enable store" (uses same webhook, different payload)
    if (body.requestType === "enable_store") {
      const { storeId, storeName, message, businessAccountId } = body;
      if (!storeId || !storeName?.trim()) {
        return res.status(400).json({
          error: "Missing required fields: storeId, storeName",
        });
      }
      await sendRequestEnableStoreToSlack({
        storeId,
        storeName: storeName.trim(),
        message: typeof message === "string" ? message.trim() : undefined,
        userEmail: session.user?.email ?? undefined,
        userName: session.user?.name ?? undefined,
        userPhone: session.user?.phone ?? undefined,
        userId: session.user?.id,
        businessAccountId: businessAccountId || undefined,
      });
      return res.status(200).json({ success: true });
    }

    if (!("orderId" in body) || !("orderType" in body)) {
      return res.status(400).json({
        error: "Missing required fields: orderId, orderType, message",
      });
    }

    const { orderId, orderDisplayId, orderType, storeName, status, message } =
      body;

    if (!orderId || !orderType || typeof message !== "string") {
      return res.status(400).json({
        error: "Missing required fields: orderId, orderType, message",
      });
    }

    const displayId = orderDisplayId ?? orderId;
    const subject = `Order issue #${displayId}`;

    // 1. Insert ticket in DB first so we get ticket_num for Slack
    let ticketNum: number | undefined;
    if (hasuraClient) {
      const result = await hasuraClient.request<{
        insert_tickets: {
          affected_rows: number;
          returning: Array<{ ticket_num: number }>;
        };
      }>(ADD_TICKET_REQUEST, {
        priority: "critical",
        status: "open",
        subject,
        user_id: session.user?.id ?? "",
        category: "Customer",
      });
      ticketNum = result?.insert_tickets?.returning?.[0]?.ticket_num;
    }

    // 2. Send ticket to Slack (SLACK_SUPPORT_WEBHOOK) with ticket number instead of internal ID
    await sendSupportTicketToSlack({
      orderId,
      orderDisplayId: displayId,
      orderType,
      storeName,
      status,
      message: message.trim().slice(0, 2000),
      userEmail: session.user?.email ?? undefined,
      userName: session.user?.name ?? undefined,
      userPhone: session.user?.phone ?? undefined,
      ticketNum,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Support ticket error:", err);
    const body = req.body as Body | undefined;
    await logErrorToSlack("api/support-ticket", err, {
      orderId: body && "orderId" in body ? body.orderId : undefined,
      orderDisplayId: body && "orderDisplayId" in body ? body.orderDisplayId : undefined,
      userId: session?.user?.id,
    });
    return res.status(500).json({
      error: "Failed to submit support ticket",
    });
  }
}
