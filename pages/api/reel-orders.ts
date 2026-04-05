import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { notifyNewOrderToSlack } from "../../src/lib/slackOrderNotifier";

const GET_ADDRESS_AND_USER = gql`
  query GetAddressAndUser($address_id: uuid!) {
    Addresses_by_pk(id: $address_id) {
      street
      city
      postal_code
      User {
        name
        email
        phone
      }
      is_default
      placeDetails
    }
  }
`;

// Generate a random 2-digit PIN (00-99)
function generateOrderPin(): string {
  return Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
}

// Create a reel order (pin is stored so it shows in order list and can be verified by shopper)
const CREATE_REEL_ORDER = gql`
  mutation CreateReelOrder(
    $user_id: uuid!
    $reel_id: uuid!
    $quantity: String!
    $total: String!
    $service_fee: String!
    $delivery_fee: String!
    $discount: String
    $voucher_code: String
    $delivery_time: String!
    $delivery_note: String
    $delivery_address_id: uuid!
    $pin: String!
    $payment_method: String
    $applied_promotions: jsonb
    $discount_breakdown: jsonb
    $status: String
  ) {
    insert_reel_orders_one(
      object: {
        user_id: $user_id
        reel_id: $reel_id
        quantity: $quantity
        total: $total
        service_fee: $service_fee
        delivery_fee: $delivery_fee
        discount: $discount
        voucher_code: $voucher_code
        delivery_time: $delivery_time
        delivery_note: $delivery_note
        delivery_address_id: $delivery_address_id
        shopper_id: null
        found: false
        pin: $pin
        payment_method: $payment_method
        applied_promotions: $applied_promotions
        discount_breakdown: $discount_breakdown
        status: $status
      }
    ) {
      id
      OrderID
      pin
    }
  }
`;

const UPDATE_PROMOTION_STATS = gql`
  mutation UpdatePromotionStats($id: uuid!, $discount_amount: numeric!) {
    update_promotions_by_pk(
      pk_columns: { id: $id }
      _inc: { budget_used: $discount_amount, usage_count: 1 }
    ) {
      id
    }
  }
`;

const RECORD_INFLUENCER_EARNING = gql`
  mutation RecordInfluencerEarning($object: influencer_earnings_insert_input!) {
    insert_influencer_earnings_one(object: $object) {
      id
    }
  }
`;

const GET_PERSONAL_WALLET = gql`
  query GetPersonalWallet($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
    }
  }
`;

const UPDATE_PERSONAL_WALLET_BALANCE = gql`
  mutation UpdatePersonalWalletBalance($user_id: uuid!, $balance: String!) {
    update_personalWallet_by_pk(
      pk_columns: { user_id: $user_id }
      _set: { balance: $balance, updated_at: "now()" }
    ) {
      id
      balance
    }
  }
`;

const CREATE_ORDER_TRANSACTION = gql`
  mutation CreateOrderTransaction($object: order_transactions_insert_input!) {
    insert_order_transactions_one(object: $object) {
      id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate user
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const user_id = session.user.id;

  const {
    reel_id,
    quantity,
    total,
    service_fee,
    delivery_fee,
    discount,
    voucher_code,
    delivery_time,
    delivery_note,
    delivery_address_id,
    payment_method,
    pricing_token,
    applied_promotions,
    discount_breakdown,
  } = req.body;

  // Validate required fields
  if (
    !reel_id ||
    !quantity ||
    !total ||
    !delivery_time ||
    !delivery_address_id
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: reel_id, quantity, total, delivery_time, delivery_address_id",
    });
  }

  // 0. Validate pricing token (MANDATORY)
  if (!pricing_token) {
    // console.warn("Pricing token missing in reel order");
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Generate PIN (same way as checkoutCard.tsx - 2-digit, 00-99)
    const orderPin = generateOrderPin();

    // 0. If wallet payment, pre-validate and deduct
    if (payment_method === "wallet") {
      const walletData = await hasuraClient.request<{
        personalWallet: Array<{ id: string; balance: string }>;
      }>(GET_PERSONAL_WALLET, { user_id });

      const wallet = walletData.personalWallet?.[0];
      if (!wallet) return res.status(400).json({ error: "Wallet not found" });

      const currentBalance = parseFloat(wallet.balance || "0");
      if (currentBalance < parseFloat(total)) {
        return res.status(400).json({ error: "Insufficient wallet balance" });
      }

      const newBalance = (currentBalance - parseFloat(total)).toFixed(2);
      await hasuraClient.request(UPDATE_PERSONAL_WALLET_BALANCE, {
        user_id,
        balance: newBalance,
      });
    }

    // Create reel order (pin stored so it shows in order list and can be verified by shopper)
    const orderRes = await hasuraClient.request<{
      insert_reel_orders_one: { id: string; OrderID: string; pin: string };
    }>(CREATE_REEL_ORDER, {
      user_id,
      reel_id,
      quantity: quantity.toString(),
      total: total.toString(),
      service_fee: (service_fee || 0).toString(),
      delivery_fee: (delivery_fee || 0).toString(),
      discount: (discount || 0).toString(),
      voucher_code: voucher_code || null,
      delivery_time,
      delivery_note: delivery_note || "",
      delivery_address_id,
      pin: orderPin,
      payment_method: payment_method || "mobile_money",
      applied_promotions: applied_promotions || [],
      discount_breakdown: discount_breakdown || {
        subtotal: 0,
        service_fee: 0,
        delivery_fee: 0,
      },
      status:
        payment_method === "momo" || payment_method === "mobile_money"
          ? "AWAITING_PAYMENT"
          : "PENDING",
    });

    const orderId = orderRes.insert_reel_orders_one.id;
    const orderNumber = orderRes.insert_reel_orders_one.OrderID;

    // If wallet payment, create SUCCESSFUL transaction record
    if (payment_method === "wallet") {
      try {
        await hasuraClient.request(CREATE_ORDER_TRANSACTION, {
          object: {
            user_id,
            reel_order_id: orderId,
            amount: total.toString(),
            currency: "RWF",
            type: "payment",
            status: "SUCCESSFUL",
            phone: "", // Not essential for wallet
          },
        });
      } catch (e) {
        console.error("Failed to create wallet transaction record:", e);
      }
    }

    let customerAddress: string | undefined;
    let customerPhone: string | undefined;
    let customerName: string | undefined;
    try {
      const addrRes = await hasuraClient.request<{
        Addresses_by_pk: {
          street: string;
          city: string;
          postal_code: string;
          User: {
            name: string | null;
            email: string | null;
            phone: string | null;
          } | null;
        } | null;
      }>(GET_ADDRESS_AND_USER, {
        address_id: delivery_address_id,
      });
      if (addrRes.Addresses_by_pk) {
        const a = addrRes.Addresses_by_pk;
        customerAddress = [a.street, a.city, a.postal_code]
          .filter(Boolean)
          .join(", ");
        customerName = a.User?.name ?? undefined;
        customerPhone = a.User?.phone ?? undefined;
      }
    } catch (_) {
      // non-blocking
    }

    // 5.5. Promotion Usage Tracking
    if (applied_promotions && Array.from(applied_promotions).length > 0) {
      for (const promo of applied_promotions) {
        try {
          // Increment usage and budget
          await hasuraClient.request(UPDATE_PROMOTION_STATS, {
            id: promo.promotion_id,
            discount_amount: parseFloat(promo.discount_amount || "0"),
          });

          // Record Influencer Earning if applicable
          if (promo.influencer_id) {
            await hasuraClient.request(RECORD_INFLUENCER_EARNING, {
              object: {
                influencer_id: promo.influencer_id,
                promotion_id: promo.promotion_id,
                reel_order_id: orderId,
                order_value: parseFloat(total).toFixed(2),
                earning_amount: (
                  parseFloat(promo.discount_amount || "0") * 0.1
                ).toFixed(2),
                payout_status: "pending",
                status: "active",
              },
            });
          }
        } catch (e) {
          console.error("Failed to track promotion usage:", e);
        }
      }
    }

    // Send Slack notification for new reel order (fire-and-forget)
    void notifyNewOrderToSlack({
      id: orderId,
      orderID: orderNumber,
      total: parseFloat(total),
      orderType: "reel",
      storeName: "Reel order",
      units: parseInt(quantity.toString()),
      customerName,
      customerPhone,
      customerAddress,
      deliveryTime: delivery_time,
    });

    return res.status(200).json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      pin: orderPin, // Return generated PIN (same format as checkoutCard)
      message: "Reel order placed successfully",
    });
  } catch (error: any) {
    console.error("Reel order creation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to place reel order",
    });
  }
}
