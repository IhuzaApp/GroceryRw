import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { GraphQLClient, gql } from 'graphql-request';

// Initialize Hasura client
const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { 'x-hasura-admin-secret': HASURA_SECRET }
});

// GraphQL queries & mutations
const GET_ACTIVE_CART = gql`
  query GetActiveCart($user_id: uuid!, $shop_id: uuid!) {
    Carts(
      where: { user_id: { _eq: $user_id }, shop_id: { _eq: $shop_id }, is_active: { _eq: true } }
      limit: 1
    ) {
      id
    }
  }
`;

const ADD_CART = gql`
  mutation AddCart($user_id: uuid!, $shop_id: uuid!) {
    insert_Carts(
      objects: { user_id: $user_id, shop_id: $shop_id, total: "0", is_active: true }
    ) {
      returning { id }
    }
  }
`;

const GET_PRODUCT_PRICE = gql`
  query GetProductPrice($id: uuid!) {
    Products_by_pk(id: $id) {
      price
    }
  }
`;

const ADD_ITEM = gql`
  mutation AddItem($cart_id: uuid!, $product_id: uuid!, $quantity: Int!, $price: String!) {
    insert_Cart_Items(
      objects: { cart_id: $cart_id, product_id: $product_id, quantity: $quantity, price: $price }
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
    update_Carts_by_pk(
      pk_columns: { id: $cart_id },
      _set: { total: $total }
    ) {
      id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate user session
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const user_id = session.user.id;

  const { shop_id, product_id, quantity } = req.body;
  if (!shop_id || !product_id || typeof quantity !== 'number') {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Get or create active cart
    const cartData = await hasuraClient.request<{ Carts: { id: string }[] }>(GET_ACTIVE_CART, {
      user_id,
      shop_id,
    });
    let cart_id = cartData.Carts[0]?.id;
    if (!cart_id) {
      const newCart = await hasuraClient.request<{ insert_Carts: { returning: { id: string }[] } }>(ADD_CART, {
        user_id,
        shop_id,
      });
      cart_id = newCart.insert_Carts.returning[0].id;
    }

    // 2. Get product price
    const prodData = await hasuraClient.request<{ Products_by_pk?: { price: string } }>(GET_PRODUCT_PRICE, {
      id: product_id,
    });
    const price = prodData.Products_by_pk?.price || '0';

    // 3. Add item to cart
    await hasuraClient.request(ADD_ITEM, { cart_id, product_id, quantity, price });

    // 4. Recalculate count and total
    const itemsData = await hasuraClient.request<{ Cart_Items: { price: string; quantity: number }[] }>(GET_CART_ITEMS, {
      cart_id,
    });
    const items = itemsData.Cart_Items;
    const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalValue = items.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 0),
      0
    );

    // 5. Update cart total
    await hasuraClient.request(UPDATE_CART_TOTAL, {
      cart_id,
      total: totalValue.toString(),
    });

    return res.status(200).json({ count, total: totalValue.toString() });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
} 