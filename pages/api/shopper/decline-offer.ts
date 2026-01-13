import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// ============================================================================
// DECLINE OFFER
// ============================================================================
// When a shopper explicitly skips/declines an offer:
// 1. Verify the offer belongs to them and is still active
// 2. Mark the offer as DECLINED
// 3. Immediately trigger rotation to next shopper
// ============================================================================

// Query to verify the offer belongs to this shopper
const VERIFY_ORDER_OFFER = gql`
  query VerifyOrderOffer($orderId: uuid!, $shopperId: uuid!) {
    order_offers(
      where: {
        _and: [
          {
            _or: [
              { order_id: { _eq: $orderId } }
              { reel_order_id: { _eq: $orderId } }
              { restaurant_order_id: { _eq: $orderId } }
            ]
          }
          { shopper_id: { _eq: $shopperId } }
          { status: { _eq: "OFFERED" } }
          { expires_at: { _gt: "now()" } }
        ]
      }
    ) {
      id
      shopper_id
      status
      offered_at
      expires_at
      round_number
      order_type
      order_id
      reel_order_id
      restaurant_order_id
    }
  }
`;

// Mutation to decline an offer
const DECLINE_ORDER_OFFER = gql`
  mutation DeclineOrderOffer($offerId: uuid!) {
    update_order_offers_by_pk(
      pk_columns: { id: $offerId }
      _set: { status: "DECLINED", updated_at: "now()" }
    ) {
      id
      status
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, userId } = req.body;

  if (!orderId || !userId) {
    return res.status(400).json({ error: "Order ID and User ID are required" });
  }

  if (userId !== session.user.id) {
    return res
      .status(403)
      .json({ error: "You can only decline offers for yourself" });
  }

  try {
    if (!hasuraClient) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }

    console.log("Verifying offer for decline:", { orderId, userId });

    // Verify the offer exists and belongs to this shopper
    const offerResponse = (await hasuraClient.request(VERIFY_ORDER_OFFER, {
      orderId,
      shopperId: userId,
    })) as any;

    const offer = offerResponse.order_offers?.[0];

    if (!offer) {
      console.warn("No active offer found to decline");
      return res.status(404).json({
        error: "No active offer found for this order",
        code: "NO_ACTIVE_OFFER",
      });
    }

    console.log("Declining offer:", offer.id);

    // Mark the offer as DECLINED
    const declineResponse = (await hasuraClient.request(DECLINE_ORDER_OFFER, {
      offerId: offer.id,
    })) as any;

    if (!declineResponse.update_order_offers_by_pk) {
      console.error("Failed to decline offer");
      return res.status(500).json({
        error: "Failed to decline offer",
        code: "DECLINE_FAILED",
      });
    }

    console.log(`✅ Offer ${offer.id} declined by shopper ${userId}`);

    // Trigger rotation immediately (call the rotation API internally)
    // This ensures the next shopper gets notified right away
    try {
      const rotationUrl = `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/shopper/rotate-expired-offers`;

      // Fire and forget - don't wait for rotation to complete
      fetch(rotationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch((error) => {
        console.error("Failed to trigger rotation:", error);
        // Silent fail - rotation will happen on next cron run
      });

      console.log("✅ Triggered rotation for next shopper");
    } catch (error) {
      console.error("Failed to trigger rotation:", error);
      // Continue - rotation will happen on next cron run
    }

    return res.status(200).json({
      success: true,
      message: "Offer declined successfully",
      orderId,
      offerId: offer.id,
    });
  } catch (error) {
    console.error("Error declining offer:", error);
    return res.status(500).json({
      error: "Failed to decline offer",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
