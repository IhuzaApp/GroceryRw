import type { NextApiRequest, NextApiResponse } from 'next';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { gql } from 'graphql-request';

const ADD_TO_CART = gql`
  mutation AddToCart($product_id: String!, $quantity: Int!, $user_id: String!) {
    insert_Cart_Items_one(object: {
      product_id: $product_id,
      quantity: $quantity,
      user_id: $user_id
    }) {
      id
      product_id
      quantity
      created_at
    }
  }
`;

const GET_CART_ITEMS = gql`
  query GetCartItems($user_id: String!) {
    Cart_Items(where: {user_id: {_eq: $user_id}}) {
      id
      product_id
      quantity
      Products {
        id
        name
        final_price
        image
      }
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, quantity, userId, confirm } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({ error: 'Product ID and User ID are required' });
    }

    if (!hasuraClient) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    if (confirm === true) {
      // Add item to cart
      const cartData = await hasuraClient.request(ADD_TO_CART, {
        product_id: productId,
        quantity: quantity || 1,
        user_id: userId
      });

      // Get updated cart items
      const cartItems = await hasuraClient.request(GET_CART_ITEMS, {
        user_id: userId
      });

      res.status(200).json({
        success: true,
        message: `Added ${quantity || 1} item(s) to your cart successfully!`,
        cartItem: cartData.insert_Cart_Items_one,
        cartItems: cartItems.Cart_Items,
        action: 'item_added'
      });

    } else {
      res.status(200).json({
        success: false,
        message: 'Order cancelled.',
        action: 'order_cancelled'
      });
    }

  } catch (error) {
    console.error('Voice order confirmation error:', error);
    res.status(500).json({ 
      error: 'Failed to confirm order',
      message: 'Sorry, I encountered an error processing your order.'
    });
  }
} 