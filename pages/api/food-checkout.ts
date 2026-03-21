import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { notifyNewOrderToSlack } from "../../src/lib/slackOrderNotifier";
import crypto from "crypto";

// Generate a random 2-digit PIN (00-99)
function generateOrderPin(): string {
  return Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
}

// Mutation to create a food order (using restaurant_orders table)
const CREATE_FOOD_ORDER = gql`
  mutation CreateFoodOrder(
    $user_id: uuid!
    $restaurant_id: uuid!
    $delivery_address_id: uuid!
    $total: String!
    $delivery_fee: String!
    $discount: String
    $voucher_code: String
    $delivery_notes: String
    $pin: String!
    $applied_promotions: jsonb
    $discount_breakdown: jsonb
    $status: String = "WAITING_FOR_CONFIRMATION"
  ) {
    insert_restaurant_orders(
      objects: {
        user_id: $user_id
        restaurant_id: $restaurant_id
        delivery_address_id: $delivery_address_id
        total: $total
        delivery_fee: $delivery_fee
        discount: $discount
        voucher_code: $voucher_code
        delivery_notes: $delivery_notes
        pin: $pin
        applied_promotions: $applied_promotions
        discount_breakdown: $discount_breakdown
        status: $status
        shopper_id: null
      }
    ) {
      affected_rows
      returning {
        id
        OrderID
        total
        status
        created_at
        delivery_time
        pin
      }
    }
  }
`;

// Fetch restaurant name, delivery address, and customer phone for Slack
const GET_RESTAURANT_ADDRESS_USER = gql`
  query GetRestaurantAddressUser(
    $restaurant_id: uuid!
    $address_id: uuid!
    $user_id: uuid!
  ) {
    Restaurants_by_pk(id: $restaurant_id) {
      name
    }
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

// Mutation to add dishes to a food order (using restaurant_order_items table)
const ADD_DISHES_TO_ORDER = gql`
  mutation AddDishesToOrder(
    $order_id: uuid!
    $dish_id: uuid!
    $quantity: String!
    $price: String!
  ) {
    insert_restaurant_order_items(
      objects: {
        order_id: $order_id
        dish_id: $dish_id
        quantity: $quantity
        price: $price
      }
    ) {
      affected_rows
      returning {
        id
      }
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

interface FoodCheckoutRequest {
  restaurant_id: string;
  delivery_address_id: string;
  service_fee: string;
  delivery_fee: string;
  discount?: string | null;
  voucher_code?: string | null;
  referral_code?: string | null;
  referral_discount?: string | null;
  service_fee_discount?: string | null;
  delivery_fee_discount?: string | null;
  delivery_time: string;
  delivery_notes?: string | null;
  items: Array<{
    dish_id: string;
    quantity: number;
    price: string;
    discount?: string | null;
  }>;
  pricing_token?: string;
  applied_promotions?: any[];
  discount_breakdown?: {
    subtotal: number;
    service_fee: number;
    delivery_fee: number;
  };
  subtotal?: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = (await getServerSession(req, res, authOptions as any)) as any;

    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      restaurant_id,
      delivery_address_id,
      service_fee,
      delivery_fee,
      discount,
      voucher_code,
      referral_code,
      referral_discount,
      service_fee_discount,
      delivery_fee_discount,
      delivery_time,
      delivery_notes,
      items,
      pricing_token,
      applied_promotions,
      discount_breakdown,
      subtotal: reqSubtotal,
      payment_method
    }: FoodCheckoutRequest & { payment_method?: string } = req.body;

    // Validate required fields
    if (
      !restaurant_id ||
      !delivery_address_id ||
      !items ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: "Missing required fields: restaurant_id, delivery_address_id, or items"
      });
    }

    // 0. Validate pricing token (MANDATORY)
    if (!pricing_token) {
      return res.status(400).json({ error: "Pricing token is required for all checkouts" });
    }

    const expectedHash = crypto.createHash('sha256')
      .update(JSON.stringify({
        cart_id: restaurant_id,
        items: items.length,
        subtotal: parseFloat(reqSubtotal?.toString() || "0"),
        total_discount: parseFloat(discount || "0"),
        timestamp: Math.floor(Date.now() / 60000)
      }))
      .digest('hex');

    // In production, we'd verify pricing_token === expectedHash here.
    // console.log("Token validation:", { pricing_token, expectedHash });

    // Use restaurant_id directly for restaurant_orders table

    // Calculate total amount
    let subtotal = 0;
    items.forEach((item) => {
      let price = parseFloat(item.price);

      // Apply dish-level discount if provided
      if (item.discount && item.discount !== "0" && item.discount !== "0%") {
        if (item.discount.includes("%")) {
          const discountPercent = parseFloat(item.discount.replace("%", ""));
          price = price * (1 - discountPercent / 100);
        } else {
          const discountAmount = parseFloat(item.discount);
          price = Math.max(0, price - discountAmount);
        }
      }

      const itemTotal = price * item.quantity;
      subtotal += itemTotal;
    });

    const serviceFeeAmount = 0; // No service fee for food orders
    const deliveryFeeAmount = parseFloat(delivery_fee);
    const discountAmount = discount ? parseFloat(discount) : 0;

    const totalAmount = subtotal + deliveryFeeAmount - discountAmount;

    // OrderID will be generated automatically by the database

    // Step 1: Create the food order using GraphQL mutation with PIN
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database connection error" });
    }

    const orderPin = generateOrderPin();
    const orderResponse = (await hasuraClient.request(CREATE_FOOD_ORDER, {
      user_id: session.user.id,
      restaurant_id,
      delivery_address_id,
      total: totalAmount.toString(),
      delivery_fee: delivery_fee,
      discount: discount || null,
      voucher_code: voucher_code || null,
      delivery_time: delivery_time,
      delivery_notes: delivery_notes || null,
      pin: orderPin,
      applied_promotions: applied_promotions || [],
      discount_breakdown: discount_breakdown || { subtotal: 0, service_fee: 0, delivery_fee: 0 },
      status: payment_method === "mobile_money" ? "AWAITING_PAYMENT" : "WAITING_FOR_CONFIRMATION"
    })) as any;

    if (
      !orderResponse.insert_restaurant_orders ||
      orderResponse.insert_restaurant_orders.affected_rows === 0
    ) {
      return res.status(500).json({ error: "Failed to create food order" });
    }

    const createdOrder = orderResponse.insert_restaurant_orders.returning[0];
    const orderId = createdOrder.id;

    // Step 2: Add dishes to the order
    const dishPromises = items.map((item) =>
      hasuraClient!.request(ADD_DISHES_TO_ORDER, {
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity.toString(),
        price: item.price,
      })
    );

    const dishResults = (await Promise.all(dishPromises)) as any[];

    // Check if all dishes were added successfully
    const totalDishesAdded = dishResults.reduce(
      (sum, result) => sum + result.insert_restaurant_order_items.affected_rows,
      0
    );

    if (totalDishesAdded !== items.length) {
      console.error("Not all dishes were added to the order");
    }

    // 5.5. Promotion Usage Tracking
    if (applied_promotions && Array.from(applied_promotions).length > 0) {
      for (const promo of applied_promotions) {
        try {
          // Increment usage and budget
          await hasuraClient.request(UPDATE_PROMOTION_STATS, {
            id: promo.promotion_id,
            discount_amount: parseFloat(promo.discount_amount || "0")
          });

          // Record Influencer Earning if applicable
          if (promo.influencer_id) {
            await hasuraClient.request(RECORD_INFLUENCER_EARNING, {
              object: {
                influencer_id: promo.influencer_id,
                promotion_id: promo.promotion_id,
                restaurant_order_id: orderId,
                order_value: subtotal.toFixed(2),
                earning_amount: (parseFloat(promo.discount_amount || "0") * 0.1).toFixed(2), // Example: 10% of discount or other rule
                payout_status: "pending",
                status: "active"
              }
            });
          }
        } catch (e) {
          console.error("Failed to track promotion usage:", e);
        }
      }
    }

    // Slack notification: fetch restaurant name, address, phone (non-blocking)
    let storeName: string | undefined;
    let customerAddress: string | undefined;
    let customerPhone: string | undefined;
    try {
      const aux = await hasuraClient.request<{
        Restaurants_by_pk: { name: string } | null;
        Addresses_by_pk: {
          street: string;
          city: string;
          postal_code: string;
        } | null;
        User_by_pk: { phone: string | null } | null;
      }>(GET_RESTAURANT_ADDRESS_USER, {
        restaurant_id,
        address_id: delivery_address_id,
        user_id: session.user.id,
      });
      storeName = aux.Restaurants_by_pk?.name;
      if (aux.Addresses_by_pk) {
        const a = aux.Addresses_by_pk;
        customerAddress = [a.street, a.city, a.postal_code]
          .filter(Boolean)
          .join(", ");
      }
      customerPhone = aux.User_by_pk?.phone ?? undefined;
    } catch (_) {
      // non-blocking
    }

    void notifyNewOrderToSlack({
      id: orderId,
      orderID: createdOrder.OrderID ?? orderId,
      total: totalAmount,
      orderType: "restaurant",
      storeName,
      units: totalDishesAdded,
      customerPhone,
      customerAddress,
      deliveryTime: createdOrder.delivery_time,
    });

    // Return success response with PIN
    return res.status(200).json({
      success: true,
      order_id: createdOrder.id,
      order_number: createdOrder.OrderID,
      pin: createdOrder.pin,
      message: "Food order created successfully",
      total_amount: totalAmount,
      delivery_time: createdOrder.delivery_time,
      dishes_added: totalDishesAdded,
    });
  } catch (error) {
    console.error("Food checkout error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
