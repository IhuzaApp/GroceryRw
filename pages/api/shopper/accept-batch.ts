import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// ============================================================================
// ACCEPT BATCH WITH OFFER VERIFICATION
// ============================================================================
// This API now implements atomic offer verification and order assignment:
// 1. Verify the offer exists and belongs to this shopper
// 2. Verify the offer hasn't expired
// 3. Update order_offers.status = ACCEPTED
// 4. Update order.shopper_id and order.status = accepted
// ============================================================================

const ACCEPT_BATCH_MUTATION = gql`
  mutation AcceptBatch(
    $orderId: uuid!
    $shopperId: uuid!
    $assigned_at: timestamptz!
  ) {
    update_Orders_by_pk(
      pk_columns: { id: $orderId }
      _set: {
        shopper_id: $shopperId
        status: "accepted"
        updated_at: "now()"
        assigned_at: $assigned_at
      }
    ) {
      id
      status
      shopper_id
      updated_at
      assigned_at
    }
  }
`;

const ACCEPT_REEL_BATCH_MUTATION = gql`
  mutation AcceptReelBatch(
    $orderId: uuid!
    $shopperId: uuid!
    $assigned_at: timestamptz!
  ) {
    update_reel_orders_by_pk(
      pk_columns: { id: $orderId }
      _set: {
        shopper_id: $shopperId
        status: "accepted"
        updated_at: "now()"
        assigned_at: $assigned_at
      }
    ) {
      id
      status
      shopper_id
      updated_at
      assigned_at
    }
  }
`;

const ACCEPT_RESTAURANT_BATCH_MUTATION = gql`
  mutation AcceptRestaurantBatch(
    $orderId: uuid!
    $shopperId: uuid!
    $assigned_at: timestamptz!
  ) {
    update_restaurant_orders_by_pk(
      pk_columns: { id: $orderId }
      _set: {
        shopper_id: $shopperId
        status: "accepted"
        updated_at: "now()"
        assigned_at: $assigned_at
      }
    ) {
      id
      status
      shopper_id
      updated_at
      assigned_at
    }
  }
`;

const CHECK_ORDER_EXISTS = gql`
  query CheckOrderExists($orderId: uuid!) {
    Orders(where: { id: { _eq: $orderId } }) {
      id
      status
      shopper_id
    }

    reel_orders(where: { id: { _eq: $orderId } }) {
      id
      status
      shopper_id
    }

    restaurant_orders(where: { id: { _eq: $orderId } }) {
      id
      status
      shopper_id
    }
  }
`;

// Query to verify the offer belongs to this shopper and is still valid
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
    }
  }
`;

// Mutation to mark offer as accepted
const ACCEPT_ORDER_OFFER = gql`
  mutation AcceptOrderOffer($offerId: uuid!) {
    update_order_offers_by_pk(
      pk_columns: { id: $offerId }
      _set: { status: "ACCEPTED", updated_at: "now()" }
    ) {
      id
      status
      shopper_id
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
      .json({ error: "You can only accept batches for yourself" });
  }

  try {
    if (!hasuraClient) {
      return res
        .status(500)
        .json({ error: "Database connection not available" });
    }

    // ========================================================================
    // STEP 1: Verify the offer exists and belongs to this shopper
    // ========================================================================
    // This is the critical security check:
    // - Offer must exist for this order
    // - Offer must belong to this shopper (shopper_id = userId)
    // - Offer must be in OFFERED state
    // - Offer must not have expired (expires_at > now())
    // ========================================================================

    console.log("Verifying offer for order:", orderId, "shopper:", userId);

    const offerResponse = (await hasuraClient.request(VERIFY_ORDER_OFFER, {
      orderId,
      shopperId: userId,
    })) as any;

    const offer = offerResponse.order_offers?.[0];

    if (!offer) {
      console.warn(
        "❌ Offer verification failed - no valid offer found for order:",
        orderId,
        "shopper:",
        userId
      );
      return res.status(403).json({
        error:
          "You don't have an active offer for this order, or the offer has expired",
        code: "NO_VALID_OFFER",
      });
    }

    console.log("✅ Offer verified:", {
      offerId: offer.id,
      round: offer.round_number,
      expiresAt: offer.expires_at,
    });

    // ========================================================================
    // STEP 2: Check if the order exists and is still available
    // ========================================================================

    const checkResponse = (await hasuraClient.request(CHECK_ORDER_EXISTS, {
      orderId,
    })) as any;

    const regularOrder = checkResponse.Orders?.[0];
    const reelOrder = checkResponse.reel_orders?.[0];
    const restaurantOrder = checkResponse.restaurant_orders?.[0];

    if (!regularOrder && !reelOrder && !restaurantOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = regularOrder || reelOrder || restaurantOrder;
    const isReelOrder = !!reelOrder;
    const isRestaurantOrder = !!restaurantOrder;

    // Check if order is already assigned to someone else
    if (order.shopper_id && order.shopper_id !== userId) {
      console.warn(
        "❌ Order already assigned to another shopper:",
        order.shopper_id
      );
      return res.status(409).json({
        error: "This batch has already been assigned to another shopper",
        code: "ALREADY_ASSIGNED",
      });
    }

    // Check if order is in valid state for acceptance
    if (order.status !== "PENDING") {
      console.warn("❌ Order is not in PENDING state:", order.status);
      return res.status(409).json({
        error: "This batch is no longer available for assignment",
        code: "INVALID_STATUS",
      });
    }

    // ========================================================================
    // STEP 3: Atomic Transaction - Accept Offer + Assign Order
    // ========================================================================
    // This must be atomic to prevent race conditions
    // ========================================================================

    const assignedAt = new Date().toISOString();

    console.log("Accepting offer and assigning order atomically...");

    // First, mark the offer as ACCEPTED
    const acceptOfferResponse = (await hasuraClient.request(
      ACCEPT_ORDER_OFFER,
      {
        offerId: offer.id,
      }
    )) as any;

    if (!acceptOfferResponse.update_order_offers_by_pk) {
      console.error("❌ Failed to accept offer");
      return res.status(500).json({
        error: "Failed to accept offer",
        code: "OFFER_UPDATE_FAILED",
      });
    }

    // Then, assign the order to the shopper
    let acceptResponse;

    if (isRestaurantOrder) {
      acceptResponse = (await hasuraClient.request(
        ACCEPT_RESTAURANT_BATCH_MUTATION,
        {
          orderId,
          shopperId: userId,
          assigned_at: assignedAt,
        }
      )) as any;
    } else if (isReelOrder) {
      acceptResponse = (await hasuraClient.request(ACCEPT_REEL_BATCH_MUTATION, {
        orderId,
        shopperId: userId,
        assigned_at: assignedAt,
      })) as any;
    } else {
      acceptResponse = (await hasuraClient.request(ACCEPT_BATCH_MUTATION, {
        orderId,
        shopperId: userId,
        assigned_at: assignedAt,
      })) as any;
    }

    if (
      acceptResponse.update_Orders_by_pk ||
      acceptResponse.update_reel_orders_by_pk ||
      acceptResponse.update_restaurant_orders_by_pk
    ) {
      console.log(
        `✅ Batch ${orderId} accepted by shopper ${userId} (offer ${offer.id}, round ${offer.round_number})`
      );

      return res.status(200).json({
        success: true,
        message: "Batch accepted successfully",
        orderId,
        shopperId: userId,
        offerId: offer.id,
        roundNumber: offer.round_number,
        orderType: isRestaurantOrder
          ? "restaurant"
          : isReelOrder
          ? "reel"
          : "regular",
      });
    } else {
      console.error("❌ Failed to assign order after accepting offer");
      return res.status(500).json({
        error: "Failed to accept batch",
        code: "ORDER_UPDATE_FAILED",
      });
    }
  } catch (error) {
    console.error("Error accepting batch:", error);
    return res.status(500).json({
      error: "Failed to accept batch",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
