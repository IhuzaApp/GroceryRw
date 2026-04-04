import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { sendSupportTicketToSlack } from "../../../src/lib/slackSupportNotifier";

const GET_DELIVERY_ISSUES = gql`
  query GetDeliveryIssues {
    Delivery_Issues {
      id
      order_id
      issue_type
      description
      created_at
      shopper_id
      status
      updated_at
    }
  }
`;

const GET_ORDER_BY_PIN = gql`
  query GetOrderByPin($pin: String!) {
    Orders(where: { pin: { _eq: $pin } }) { id pin OrderID }
    package_delivery(where: { DeliveryCode: { _eq: $pin } }) { id DeliveryCode }
    restaurant_orders(where: { pin: { _eq: $pin } }) { id OrderID pin }
    reel_orders(where: { pin: { _eq: $pin } }) { id OrderID pin }
    businessProductOrders(where: { pin: { _eq: $pin } }) { id OrderID pin }
  }
`;

const ADD_DELIVERY_ISSUE = gql`
  mutation AddDeliveryIssue($description: String = "", $issue_type: String = "", $order_id: uuid, $priority: String = "", $status: String = "", $user_id: uuid, $updated_at: timestamptz, $package_id: uuid, $business_order_id: uuid, $reel_order_id: uuid, $shopper_id: uuid, $image: String) {
    insert_Delivery_Issues(objects: {description: $description, issue_type: $issue_type, order_id: $order_id, priority: $priority, status: $status, user_id: $user_id, updated_at: $updated_at, package_id: $package_id, business_order_id: $business_order_id, reel_order_id: $reel_order_id, shopper_id: $shopper_id, image: $image}) {
      affected_rows
    }
  }
`;

interface DeliveryIssuesResponse {
  Delivery_Issues: Array<{
    id: string;
    order_id: string;
    issue_type: string;
    description: string;
    created_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    if (req.method === "POST") {
      const session = (await getServerSession(req, res, authOptions as any)) as any;
      if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

      const { pin, order_source, description, issue_type, image } = req.body;
      if (!pin || !order_source) return res.status(400).json({ error: "Missing pin or order_source" });

      // Look up order ID by pin
      const ordersRes = await hasuraClient.request<any>(GET_ORDER_BY_PIN, { pin });

      let order_id = undefined;
      let package_id = undefined;
      let business_order_id = undefined;
      let reel_order_id = undefined;

      let found = false;

      if (order_source.toLowerCase() === "shop" && ordersRes.Orders?.length) {
        order_id = ordersRes.Orders[0].id;
        found = true;
      } else if (order_source.toLowerCase() === "restaurant" && ordersRes.restaurant_orders?.length) {
        order_id = ordersRes.restaurant_orders[0].id;
        found = true;
      } else if (order_source.toLowerCase() === "reel" && ordersRes.reel_orders?.length) {
        reel_order_id = ordersRes.reel_orders[0].id;
        found = true;
      } else if (order_source.toLowerCase() === "business" && ordersRes.businessProductOrders?.length) {
        business_order_id = ordersRes.businessProductOrders[0].id;
        found = true;
      } else if (order_source.toLowerCase() === "package" && ordersRes.package_delivery?.length) {
        package_id = ordersRes.package_delivery[0].id;
        found = true;
      }

      if (!found) {
        return res.status(404).json({ error: "Could not find an order matching that PIN for the given source." });
      }

      const mutRes = await hasuraClient.request<any>(ADD_DELIVERY_ISSUE, {
        description: description || "No description provided",
        issue_type: issue_type || "Other",
        priority: "high",
        status: "open",
        order_id,
        package_id,
        business_order_id,
        reel_order_id,
        user_id: session.user.id,
        image: image || null
      });

      try {
        await sendSupportTicketToSlack({
          orderId: String(order_id || package_id || business_order_id || reel_order_id || pin),
          orderDisplayId: pin,
          orderType: order_source.toLowerCase() === "shop" ? "regular" :
                     order_source.toLowerCase() === "business" ? "business" :
                     order_source.toLowerCase() === "restaurant" ? "restaurant" : "reel" as any,
          message: `[DELIVERY ISSUE - ${issue_type}] ${description}`,
          userEmail: session.user.email,
          userName: session.user.name,
          image: image || null
        });
      } catch (err) {
        console.error("Slack notification failed for delivery issue:", err);
      }

      return res.status(200).json({ success: true, affected_rows: mutRes?.insert_Delivery_Issues?.affected_rows });
    }

    const data = await hasuraClient.request<DeliveryIssuesResponse>(
      GET_DELIVERY_ISSUES
    );
    res.status(200).json({ delivery_issues: data.Delivery_Issues });
  } catch (error) {
    console.error("Error fetching/posting delivery issues:", error);
    res.status(500).json({ error: "Failed to process delivery issues request" });
  }
}
