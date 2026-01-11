import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { orderId, pin, orderType = "regular" } = req.body;

    if (!orderId || !pin) {
      return res.status(400).json({ error: "Missing orderId or PIN" });
    }

    // Query the appropriate table based on order type
    let query;
    let variableName;

    if (orderType === "restaurant") {
      query = gql`
        query VerifyRestaurantOrderPin($orderId: uuid!) {
          restaurant_orders_by_pk(id: $orderId) {
            id
            pin
          }
        }
      `;
      variableName = "restaurant_orders_by_pk";
    } else if (orderType === "reel") {
      query = gql`
        query VerifyReelOrderPin($orderId: uuid!) {
          reel_orders_by_pk(id: $orderId) {
            id
            pin
          }
        }
      `;
      variableName = "reel_orders_by_pk";
    } else {
      // Regular order
      query = gql`
        query VerifyOrderPin($orderId: uuid!) {
          Orders_by_pk(id: $orderId) {
            id
            pin
          }
        }
      `;
      variableName = "Orders_by_pk";
    }

    const data = await hasuraClient.request<any>(query, { orderId });
    const order = data[variableName];

    if (!order) {
      return res.status(404).json({ error: "Order not found", verified: false });
    }

    // Verify the PIN
    const verified = order.pin && order.pin === pin;

    return res.status(200).json({
      verified,
      message: verified ? "PIN verified successfully" : "Invalid PIN",
    });
  } catch (error) {
    console.error("Error verifying PIN:", error);
    return res.status(500).json({
      error: "Failed to verify PIN",
      verified: false,
    });
  }
}
