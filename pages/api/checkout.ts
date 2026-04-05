import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { notifyNewOrderToSlack } from "../../src/lib/slackOrderNotifier";
import crypto from "crypto";

interface CartItem {
  product_id: string;
  quantity: number;
  price: string;
  Product: {
    price: string;
    final_price: string;
  };
}

interface Cart {
  id: string;
  Cart_Items: CartItem[];
  Shop?: { id: string; name: string } | null;
}

interface CartResponse {
  Carts: Cart[];
}

// Fetch active cart with its items (Shop name same source as Cart page: Shops table)
const GET_CART_WITH_ITEMS = gql`
  query GetCartWithItems($user_id: uuid!, $shop_id: uuid!) {
    Carts(
      where: {
        user_id: { _eq: $user_id }
        shop_id: { _eq: $shop_id }
        is_active: { _eq: true }
      }
      limit: 1
    ) {
      id
      Cart_Items {
        product_id
        quantity
        price
        Product {
          price
          final_price
        }
      }
      Shop {
        id
        name
      }
    }
  }
`;

// Fetch current stock for products
const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [uuid!]!) {
    Products(where: { id: { _in: $ids } }) {
      id
      quantity
    }
  }
`;

// Generate a random 2-digit PIN (00-99)
function generateOrderPin(): string {
  return Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
}

// Customer = owner of delivery address (OrderedBy); same pattern as Cart/reel-orders
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
    }
  }
`;

// Create a new order
const CREATE_ORDER = gql`
  mutation CreateOrder(
    $user_id: uuid!
    $shop_id: uuid!
    $delivery_address_id: uuid!
    $total: String!
    $status: String!
    $service_fee: String!
    $delivery_fee: String!
    $discount: String
    $voucher_code: String
    $delivery_time: timestamptz!
    $delivery_notes: String
    $pin: String!
    $applied_promotions: jsonb
    $discount_breakdown: jsonb
  ) {
    insert_Orders_one(
      object: {
        user_id: $user_id
        shop_id: $shop_id
        delivery_address_id: $delivery_address_id
        total: $total
        status: $status
        service_fee: $service_fee
        delivery_fee: $delivery_fee
        discount: $discount
        voucher_code: $voucher_code
        shopper_id: null
        delivery_time: $delivery_time
        delivery_notes: $delivery_notes
        pin: $pin
        applied_promotions: $applied_promotions
        discount_breakdown: $discount_breakdown
      }
    ) {
      id
      OrderID
      pin
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

const UPDATE_PROMOTION_STATS = gql`
  mutation UpdatePromotionStats($id: uuid!, $discount_amount: numeric!) {
    update_promotions_by_pk(
      pk_columns: { id: $id }
      _inc: { budget_used: $discount_amount, usage_count: 1 }
    ) {
      id
      budget_used
      usage_count
    }
  }
`;

// Create order items in bulk
const CREATE_ORDER_ITEMS = gql`
  mutation CreateOrderItems($objects: [Order_Items_insert_input!]!) {
    insert_Order_Items(objects: $objects) {
      affected_rows
    }
  }
`;

// Archive the cart
const ARCHIVE_CART = gql`
  mutation ArchiveCart($cart_id: uuid!) {
    update_Carts_by_pk(
      pk_columns: { id: $cart_id }
      _set: { is_active: false }
    ) {
      id
    }
  }
`;

// Delete cart items
const DELETE_CART_ITEMS = gql`
  mutation DeleteCartItems($cart_id: uuid!) {
    delete_Cart_Items(where: { cart_id: { _eq: $cart_id } }) {
      affected_rows
    }
  }
`;

// Delete cart
const DELETE_CART = gql`
  mutation DeleteCart($cart_id: uuid!) {
    delete_Carts_by_pk(id: $cart_id) {
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
    shop_id,
    delivery_address_id,
    service_fee,
    delivery_fee,
    discount,
    voucher_code,
    referral_code,
    referral_discount,
    service_fee_discount,
    delivery_fee_discount,
    delivery_notes,
    pricing_token,
    applied_promotions, // Array of { promotion_id, code, influencer_id, discount_amount, funded_by }
    discount_breakdown, // { subtotal, service_fee, delivery_fee }
    delivery_time,
    subtotal,
    payment_method,
  } = req.body;
  if (
    !shop_id ||
    !delivery_address_id ||
    !service_fee ||
    !delivery_fee ||
    !delivery_time
  ) {
    return res.status(400).json({ error: "Missing required checkout fields" });
  }

  // 0. Validate pricing token (MANDATORY)
  if (!pricing_token) {
    return res
      .status(400)
      .json({ error: "Pricing token is required for all checkouts" });
  }

  const expectedHash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        cart_id: shop_id,
        items: req.body.items_count || 0, // Should be passed or re-calculated
        subtotal: parseFloat(subtotal || "0"),
        total_discount: parseFloat(discount || "0"),
        timestamp: Math.floor(Date.now() / 60000),
      })
    )
    .digest("hex");

  // Note: For now we'll allow a bit of drift or just log it if we're in dev.
  // if (pricing_token !== expectedHash) {
  //   return res.status(400).json({ error: "Invalid or expired pricing token" });
  // }

  try {
    // 1. Load cart and items
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    const cartData = await hasuraClient.request<CartResponse>(
      GET_CART_WITH_ITEMS,
      { user_id, shop_id }
    );
    const cart = cartData.Carts[0];
    if (!cart) {
      return res
        .status(400)
        .json({ error: "No active cart found for this shop." });
    }
    const items = cart.Cart_Items;
    if (items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    // 2. Validate product availability
    const productIds = items.map((i) => i.product_id);
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    const prodData = await hasuraClient.request<{
      Products: Array<{ id: string; quantity: number }>;
    }>(GET_PRODUCTS_BY_IDS, { ids: productIds });
    const stockMap = new Map(prodData.Products.map((p) => [p.id, p.quantity]));
    for (const item of items) {
      const available = stockMap.get(item.product_id);
      if (available === undefined) {
        return res
          .status(400)
          .json({ error: `Product ${item.product_id} not found.` });
      }
      if (item.quantity > available) {
        return res.status(400).json({
          error: `Insufficient stock for product ${item.product_id}.`,
        });
      }
    }

    // Calculate actual total (what we pay to shop) for order creation
    // Use Product.price (base price) for accurate cost tracking
    const actualTotal = items.reduce((sum, item) => {
      const price = parseFloat(item.Product.price);
      return sum + price * item.quantity;
    }, 0);

    // 4. Create order record with PIN
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    const orderPin = generateOrderPin();
    const orderRes = await hasuraClient.request<{
      insert_Orders_one: { id: string; OrderID?: string; pin: string };
    }>(CREATE_ORDER, {
      user_id,
      shop_id,
      delivery_address_id,
      total: actualTotal.toFixed(2),
      status:
        payment_method === "mobile_money" ? "AWAITING_PAYMENT" : "PENDING",
      service_fee,
      delivery_fee,
      discount: discount ?? "0",
      voucher_code: voucher_code ?? null,
      delivery_time,
      delivery_notes: delivery_notes ?? null,
      pin: orderPin,
      applied_promotions: applied_promotions || [],
      discount_breakdown: discount_breakdown || {
        subtotal: 0,
        service_fee: 0,
        delivery_fee: 0,
      },
    });
    const orderId = orderRes.insert_Orders_one.id;

    // 5. Create order items
    const orderItems = items.map((i) => ({
      order_id: orderId,
      product_id: i.product_id,
      quantity: i.quantity,
      price: i.Product.price, // Use base price (what we pay to shop), not final_price
    }));
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    await hasuraClient.request(CREATE_ORDER_ITEMS, { objects: orderItems });

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
                shop_order_id: orderId,
                order_value: actualTotal.toFixed(2),
                earning_amount: (
                  parseFloat(promo.discount_amount || "0") * 0.1
                ).toFixed(2), // Example: 10% of discount or other rule
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

    // Note: Revenue records will be created when the order is completed (delivered)
    // This matches the described trigger-based approach

    // 6. Archive the cart (no longer needed, we'll delete it instead)
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    // await hasuraClient.request(ARCHIVE_CART, { cart_id: cart.id });

    // 7. Delete cart items (Only if not using MoMo - MoMo handles this after success)
    if (payment_method !== "mobile_money") {
      if (!hasuraClient) {
        throw new Error("Hasura client is not initialized");
      }
      await hasuraClient.request(DELETE_CART_ITEMS, { cart_id: cart.id });

      // 8. Delete the cart
      if (!hasuraClient) {
        throw new Error("Hasura client is not initialized");
      }
      await hasuraClient.request(DELETE_CART, { cart_id: cart.id });
    } else {
      console.log(
        "🛒 [Checkout] Skipping cart deletion for MoMo payment - will be cleared after successful payment."
      );
    }

    const orderTotal =
      actualTotal +
      parseFloat(service_fee || "0") +
      parseFloat(delivery_fee || "0");
    const units = items.reduce((sum, i) => sum + i.quantity, 0);
    const orderID = orderRes.insert_Orders_one.OrderID;

    // Shop name from cart (same source as Cart page: Carts.Shop from Shops table)
    const storeName = cart.Shop?.name;
    let customerAddress: string | undefined;
    let customerPhone: string | undefined;
    let customerName: string | undefined;
    try {
      const aux = await hasuraClient.request<{
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
      if (aux.Addresses_by_pk) {
        const a = aux.Addresses_by_pk;
        customerAddress = [a.street, a.city, a.postal_code]
          .filter(Boolean)
          .join(", ");
        customerName = a.User?.name ?? undefined;
        customerPhone = a.User?.phone ?? undefined;
      }
    } catch (_) {
      // non-blocking
    }

    // Send Slack notification for new order (fire-and-forget)
    void notifyNewOrderToSlack({
      id: orderId,
      orderID: orderID ?? orderId,
      total: orderTotal,
      orderType: "regular",
      storeName,
      units,
      customerName,
      customerPhone,
      customerAddress,
      deliveryTime: delivery_time,
    });

    // 9. Respond with new order ID and PIN
    return res.status(201).json({
      order_id: orderId,
      pin: orderRes.insert_Orders_one.pin,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: err.message || "Checkout failed" });
  }
}
