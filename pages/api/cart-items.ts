import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { GraphQLClient, gql } from "graphql-request";
import type { Session } from "next-auth";

// Initialize Hasura client
const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

// GraphQL queries & mutations
const GET_ACTIVE_CART = gql`
  query GetActiveCart($user_id: uuid!, $shop_id: uuid!) {
    Carts(
      where: {
        user_id: { _eq: $user_id }
        shop_id: { _eq: $shop_id }
        is_active: { _eq: true }
      }
      limit: 1
    ) {
      id
    }
  }
`;

const ADD_CART = gql`
  mutation AddCart($user_id: uuid!, $shop_id: uuid!) {
    insert_Carts(
      objects: {
        user_id: $user_id
        shop_id: $shop_id
        total: "0"
        is_active: true
      }
    ) {
      returning {
        id
      }
    }
  }
`;

const GET_PRODUCT_PRICE = gql`
  query GetProductPrice($id: uuid!) {
    Products_by_pk(id: $id) {
      final_price
      price
    }
  }
`;

const ADD_ITEM = gql`
  mutation AddItem(
    $cart_id: uuid!
    $product_id: uuid!
    $quantity: Int!
    $price: String!
  ) {
    insert_Cart_Items(
      objects: {
        cart_id: $cart_id
        product_id: $product_id
        quantity: $quantity
        price: $price
      }
    ) {
      affected_rows
    }
  }
`;

const GET_CART_ITEMS = gql`
  query GetCartItems($cart_id: uuid!) {
    Cart_Items(where: { cart_id: { _eq: $cart_id } }) {
      price
      quantity
    }
  }
`;

const UPDATE_CART_TOTAL = gql`
  mutation UpdateCartTotal($cart_id: uuid!, $total: String!) {
    update_Carts_by_pk(pk_columns: { id: $cart_id }, _set: { total: $total }) {
      id
    }
  }
`;

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
        id
        product_id
        price
        quantity
      }
    }
    Shops_by_pk(id: $shop_id) {
      name
    }
  }
`;

// New query: fetch product details for multiple product IDs
const GET_PRODUCTS_BY_IDS = gql`
  query GetProductsByIds($ids: [uuid!]!) {
    Products(where: { id: { _in: $ids } }) {
      id
      ProductName {
        name
        description
      }
      image
      measurement_unit
      quantity
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    // Handle POST: add item logic
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user_id = session.user.id;

    const { shop_id, product_id, quantity } = req.body;
    if (!shop_id || !product_id || typeof quantity !== "number") {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // 1. Get or create active cart
      const cartData = await hasuraClient.request<{ Carts: { id: string }[] }>(
        GET_ACTIVE_CART,
        {
          user_id,
          shop_id,
        }
      );
      let cart_id = cartData.Carts[0]?.id;
      if (!cart_id) {
        const newCart = await hasuraClient.request<{
          insert_Carts: { returning: { id: string }[] };
        }>(ADD_CART, {
          user_id,
          shop_id,
        });
        cart_id = newCart.insert_Carts.returning[0].id;
      }

      // 2. Get product price
      const prodData = await hasuraClient.request<{
        Products_by_pk?: { price: string; final_price: string };
      }>(GET_PRODUCT_PRICE, {
        id: product_id,
      });
      const price = prodData.Products_by_pk?.final_price || "0";

      // 3. Add item to cart
      await hasuraClient.request(ADD_ITEM, {
        cart_id,
        product_id,
        quantity,
        price,
      });

      // 4. Recalculate count and total
      const itemsData = await hasuraClient.request<{
        Cart_Items: { price: string; quantity: number }[];
      }>(GET_CART_ITEMS, {
        cart_id,
      });
      const items = itemsData.Cart_Items;
      // Count distinct cart items (not sum of quantities)
      const count = items.length;
      const totalValue = items.reduce(
        (sum, item) =>
          sum + (parseFloat(item.price) || 0) * (item.quantity || 0),
        0
      );

      // 5. Update cart total
      await hasuraClient.request(UPDATE_CART_TOTAL, {
        cart_id,
        total: totalValue.toString(),
      });

      return res.status(200).json({ count, total: totalValue.toString() });
    } catch (error) {
      console.error("Error adding to cart:", error);
      return res.status(500).json({ error: "Failed to add to cart" });
    }
  } else if (req.method === "GET") {
    // Handle GET: fetch cart items and shop name
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user_id = session.user.id;
    const { shop_id } = req.query;
    if (!shop_id || typeof shop_id !== "string") {
      return res.status(400).json({ error: "Missing shop_id" });
    }
    try {
      // 1) Fetch the cart with raw items
      const data = await hasuraClient.request<{
        Carts: Array<{
          id: string;
          Cart_Items: Array<{
            id: string;
            product_id: string;
            price: string;
            quantity: number;
          }>;
        }>;
        Shops_by_pk?: { name: string };
      }>(GET_CART_WITH_ITEMS, { user_id, shop_id });
      const cart = data.Carts[0];
      const shopName = data.Shops_by_pk?.name || "";
      const rawItems = cart?.Cart_Items || [];
      // 2) Fetch product metadata
      const productIds = rawItems.map((item) => item.product_id);
      const productsData = await hasuraClient.request<{
        Products: Array<{
          id: string;
          ProductName: {
            name: string;
            description?: string;
          };
          image: string;
          measurement_unit: string;
          quantity: number;
        }>;
      }>(GET_PRODUCTS_BY_IDS, { ids: productIds });
      const productsMap = productsData.Products.reduce((map, p) => {
        map[p.id] = p;
        return map;
      }, {} as Record<string, { 
        ProductName: { name: string; description?: string; }; 
        image: string; 
        measurement_unit: string; 
        quantity: number 
      }>);
      // 3) Combine items with metadata
      const items = rawItems.map((item) => {
        const prod = productsMap[item.product_id];
        return {
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: prod?.ProductName?.name || "",
          image: prod?.image || "",
          size: prod?.measurement_unit || "",
        };
      });
      // Count distinct cart items (not sum of quantities)
      const count = items.length;
      const totalValue = items.reduce(
        (sum, item) => sum + parseFloat(item.price || "0") * item.quantity,
        0
      );
      return res
        .status(200)
        .json({ items, count, total: totalValue.toString(), shopName });
    } catch (error) {
      console.error("Error fetching cart:", error);
      return res.status(500).json({ error: "Failed to fetch cart" });
    }
  } else if (req.method === "DELETE") {
    // Handle DELETE: remove a cart item
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { cart_item_id } = req.body as { cart_item_id?: string };
    if (!cart_item_id) {
      return res.status(400).json({ error: "Missing cart_item_id" });
    }
    try {
      const DELETE_ITEM = gql`
        mutation DeleteCartItem($id: uuid!) {
          delete_Cart_Items_by_pk(id: $id) {
            id
          }
        }
      `;
      await hasuraClient.request(DELETE_ITEM, { id: cart_item_id });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting cart item:", error);
      return res.status(500).json({ error: "Failed to delete cart item" });
    }
  } else if (req.method === "PUT") {
    // Handle PUT: update cart item quantity
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const { cart_item_id, quantity } = req.body as {
      cart_item_id?: string;
      quantity?: number;
    };
    if (!cart_item_id || typeof quantity !== "number") {
      return res.status(400).json({ error: "Missing or invalid fields" });
    }
    try {
      const UPDATE_ITEM = gql`
        mutation UpdateCartItem($id: uuid!, $quantity: Int!) {
          update_Cart_Items_by_pk(
            pk_columns: { id: $id }
            _set: { quantity: $quantity }
          ) {
            id
          }
        }
      `;
      await hasuraClient.request(UPDATE_ITEM, { id: cart_item_id, quantity });
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error updating cart item:", error);
      return res.status(500).json({ error: "Failed to update cart item" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "DELETE", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
