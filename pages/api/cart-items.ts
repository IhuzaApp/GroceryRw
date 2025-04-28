import { NextApiRequest, NextApiResponse } from 'next';
import { hasuraClient } from '../../src/lib/hasuraClient';
import { gql } from 'graphql-request';

// Query to get active cart for a user and shop
const GET_ACTIVE_CART = gql`
  query GetActiveCart($user_id: uuid!, $shop_id: uuid!) {
    Carts(
      where: {
        user_id: { _eq: $user_id },
        shop_id: { _eq: $shop_id },
        is_active: { _eq: true }
      },
      limit: 1
    ) {
      id
    }
  }
`;

// Mutation to create a new cart
const ADD_CART = gql`
  mutation AddCart($user_id: uuid!, $shop_id: uuid!) {
    insert_Carts(
      objects: { user_id: $user_id, shop_id: $shop_id, total: "0", is_active: true }
    ) {
      returning {
        id
      }
    }
  }
`;

// Query to get product price
const GET_PRODUCT = gql`
  query GetProduct($id: uuid!) {
    Products_by_pk(id: $id) {
      price
    }
  }
`;

// Mutation to add item to cart
const ADD_ITEM = gql`
  mutation AddItem($cart_id: uuid!, $product_id: uuid!, $quantity: Int!, $price: String!) {
    insert_Cart_Items(
      objects: { cart_id: $cart_id, product_id: $product_id, quantity: $quantity, price: $price }
    ) {
      affected_rows
    }
  }
`;

// Query to fetch all items in a cart
const GET_CART_ITEMS = gql`
  query GetCartItems($cart_id: uuid!) {
    Cart_Items(where: { cart_id: { _eq: $cart_id } }) {
      price
      quantity
    }
  }
`;

// Mutation to update cart total
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

interface ActiveCartResponse {
  Carts: { id: string }[];
}

interface AddCartResponse {
  insert_Carts: { returning: { id: string }[] };
}

interface ProductResponse {
  Products_by_pk?: { price: string } | null;
}

interface CartItemsResponse {
  Cart_Items: { price: string; quantity: number }[];
}

interface UpdateCartResponse {
  update_Carts_by_pk: { id: string };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === 'GET') {
    const { cart_id } = req.query;
    if (!cart_id || typeof cart_id !== 'string') {
      res.status(400).json({ error: 'Missing or invalid cart_id' });
      return;
    }
    try {
      // Get cart items
      const data = await hasuraClient.request<CartItemsResponse>(GET_CART_ITEMS, { cart_id });
      const items = data.Cart_Items;
      // Calculate count and total
      let count = 0;
      let total = 0;
      items.forEach((i: any) => {
        const q = i.quantity || 0;
        const p = parseFloat(i.price) || 0;
        count += q;
        total += q * p;
      });
      res.status(200).json({ count, total: total.toString() });
    } catch (error) {
      console.error('Error fetching cart-items:', error);
      res.status(500).json({ error: 'Failed to fetch cart items' });
    }

  } else if (method === 'POST') {
    const { user_id, shop_id, product_id, quantity } = req.body;
    if (!user_id || !shop_id || !product_id || typeof quantity !== 'number') {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    try {
      // Step 1: ensure cart exists
      const cartData = await hasuraClient.request<ActiveCartResponse>(GET_ACTIVE_CART, { user_id, shop_id });
      let cart_id = cartData.Carts[0]?.id;
      if (!cart_id) {
        const addCartData = await hasuraClient.request<AddCartResponse>(ADD_CART, { user_id, shop_id });
        cart_id = addCartData.insert_Carts.returning[0].id;
      }
      // Step 2: fetch product price
      const prodData = await hasuraClient.request<ProductResponse>(GET_PRODUCT, { id: product_id });
      const price = prodData.Products_by_pk?.price;
      // Step 3: insert item
      await hasuraClient.request(ADD_ITEM, { cart_id, product_id, quantity, price });
      // Step 4: recalc total and update cart
      const itemsData = await hasuraClient.request<CartItemsResponse>(GET_CART_ITEMS, { cart_id });
      const items = itemsData.Cart_Items;
      let count = 0;
      let total = 0;
      items.forEach((i: any) => {
        const q = i.quantity || 0;
        const p = parseFloat(i.price) || 0;
        count += q;
        total += q * p;
      });
      await hasuraClient.request<UpdateCartResponse>(UPDATE_CART_TOTAL, { cart_id, total: total.toString() });
      // Return updated count and total
      res.status(200).json({ count, total: total.toString() });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({ error: 'Failed to add to cart' });
    }

  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
} 