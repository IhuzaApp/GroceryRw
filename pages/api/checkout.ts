import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

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
}

interface CartResponse {
  Carts: Cart[];
}

// Fetch active cart with its items
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
      }
    ) {
      id
      pin
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
    delivery_time,
    delivery_notes,
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
      insert_Orders_one: { id: string; pin: string };
    }>(CREATE_ORDER, {
      user_id,
      shop_id,
      delivery_address_id,
      total: actualTotal.toFixed(2),
      status: "PENDING",
      service_fee,
      delivery_fee,
      discount: discount ?? null,
      voucher_code: voucher_code ?? null,
      delivery_time,
      delivery_notes: delivery_notes ?? null,
      pin: orderPin,
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

    // Note: Revenue records will be created when the order is completed (delivered)
    // This matches the described trigger-based approach

    // 6. Archive the cart (no longer needed, we'll delete it instead)
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    // await hasuraClient.request(ARCHIVE_CART, { cart_id: cart.id });

    // 7. Delete cart items
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    await hasuraClient.request(DELETE_CART_ITEMS, { cart_id: cart.id });

    // 8. Delete the cart
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }
    await hasuraClient.request(DELETE_CART, { cart_id: cart.id });

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
