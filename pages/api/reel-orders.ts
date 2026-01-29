import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { notifyNewOrderToSlack } from "../../src/lib/slackOrderNotifier";

const GET_ADDRESS_AND_USER = gql`
  query GetAddressAndUser($address_id: uuid!, $user_id: uuid!) {
    Addresses_by_pk(id: $address_id) {
      street
      city
      postal_code
    }
    User_by_pk(id: $user_id) {
      phone
    }
  }
`;

// Generate a random 2-digit PIN (00-99)
function generateOrderPin(): string {
  return Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
}

// Create a reel order
// Note: pin field is not in reel_orders schema, but we generate it for consistency with other order types
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
        status: "PENDING"
        found: false
      }
    ) {
      id
      OrderID
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
  } = req.body;

  // Validate required fields
  if (
    !reel_id ||
    !quantity ||
    !total ||
    !service_fee ||
    !delivery_fee ||
    !delivery_time ||
    !delivery_address_id
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: reel_id, quantity, total, service_fee, delivery_fee, delivery_time, delivery_address_id",
    });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Generate PIN (same way as checkoutCard.tsx - 2-digit, 00-99)
    const orderPin = generateOrderPin();

    // Create reel order (pin field not in schema, but we generate it for response)
    const orderRes = await hasuraClient.request<{
      insert_reel_orders_one: { id: string; OrderID: string };
    }>(CREATE_REEL_ORDER, {
      user_id,
      reel_id,
      quantity: quantity.toString(),
      total,
      service_fee,
      delivery_fee,
      discount: discount || null,
      voucher_code: voucher_code || null,
      delivery_time,
      delivery_note: delivery_note || "",
      delivery_address_id,
    });

    const orderId = orderRes.insert_reel_orders_one.id;
    const orderNumber = orderRes.insert_reel_orders_one.OrderID;

    let customerAddress: string | undefined;
    let customerPhone: string | undefined;
    try {
      const addrRes = await hasuraClient.request<{
        Addresses_by_pk: { street: string; city: string; postal_code: string } | null;
        User_by_pk: { phone: string | null } | null;
      }>(GET_ADDRESS_AND_USER, {
        address_id: delivery_address_id,
        user_id,
      });
      if (addrRes.Addresses_by_pk) {
        const a = addrRes.Addresses_by_pk;
        customerAddress = [a.street, a.city, a.postal_code].filter(Boolean).join(", ");
      }
      customerPhone = addrRes.User_by_pk?.phone ?? undefined;
    } catch (_) {
      // non-blocking
    }

    // Send Slack notification for new reel order (fire-and-forget)
    void notifyNewOrderToSlack({
      id: orderId,
      orderID: orderNumber,
      total,
      orderType: "reel",
      storeName: "Reel order",
      units: quantity,
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
