import type { NextApiRequest, NextApiResponse } from 'next';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { gql } from 'graphql-request';

// For now, we'll use a simple text-based command parser
// In production, you can integrate with Coqui STT or other STT services

interface VoiceCommand {
  intent: 'order' | 'search' | 'cart' | 'navigate' | 'help';
  entities: {
    product?: string;
    quantity?: number;
    shop?: string;
    category?: string;
  };
  confidence: number;
}

interface VoiceResponse {
  text: string;
  command: VoiceCommand;
  results: any;
  message: string;
  action: string | null;
}

interface ProductsResponse {
  Products: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    final_price: string;
    image: string;
    shop_id: string;
    quantity: number;
    measurement_unit: string;
  }>;
}

interface ShopsResponse {
  Shops: Array<{
    id: string;
    name: string;
    description: string;
    address: string;
    image: string;
    latitude: number;
    longitude: number;
  }>;
}

// Simple command parser (replace with actual STT + NLP in production)
function parseVoiceCommand(text: string): VoiceCommand {
  const lowerText = text.toLowerCase();
  
  // Default response
  let command: VoiceCommand = {
    intent: 'help',
    entities: {},
    confidence: 0.5
  };

  // Order intent
  if (lowerText.includes('order') || lowerText.includes('buy') || lowerText.includes('purchase')) {
    command.intent = 'order';
    command.confidence = 0.8;
    
    // Extract quantity
    const quantityMatch = lowerText.match(/(\d+)/);
    if (quantityMatch) {
      command.entities.quantity = parseInt(quantityMatch[1]);
    }
    
    // Extract product names (simple keyword matching)
    const products = ['milk', 'bread', 'eggs', 'rice', 'chicken', 'beef', 'fish', 'vegetables', 'fruits', 'water'];
    for (const product of products) {
      if (lowerText.includes(product)) {
        command.entities.product = product;
        break;
      }
    }
  }
  
  // Search intent
  else if (lowerText.includes('search') || lowerText.includes('find') || lowerText.includes('look for')) {
    command.intent = 'search';
    command.confidence = 0.7;
    
    // Extract search terms
    const searchTerms = ['shop', 'store', 'restaurant', 'bakery', 'butcher'];
    for (const term of searchTerms) {
      if (lowerText.includes(term)) {
        command.entities.category = term;
        break;
      }
    }
  }
  
  // Cart intent
  else if (lowerText.includes('cart') || lowerText.includes('basket') || lowerText.includes('checkout')) {
    command.intent = 'cart';
    command.confidence = 0.9;
  }
  
  // Navigate intent
  else if (lowerText.includes('go to') || lowerText.includes('open') || lowerText.includes('show')) {
    command.intent = 'navigate';
    command.confidence = 0.6;
    
    if (lowerText.includes('profile')) command.entities.category = 'profile';
    else if (lowerText.includes('orders')) command.entities.category = 'orders';
    else if (lowerText.includes('reels')) command.entities.category = 'reels';
    else if (lowerText.includes('recipes')) command.entities.category = 'recipes';
    else if (lowerText.includes('home')) command.entities.category = 'home';
  }

  return command;
}

// GraphQL queries for voice commands
const GET_PRODUCTS_BY_NAME = gql`
  query GetProductsByName($name: String!) {
    Products(where: {name: {_ilike: $name}, is_active: {_eq: true}}) {
      id
      name
      description
      price
      final_price
      image
      shop_id
      quantity
      measurement_unit
    }
  }
`;

const GET_SHOPS_BY_CATEGORY = gql`
  query GetShopsByCategory($category: String!) {
    Shops(where: {description: {_ilike: $category}, is_active: {_eq: true}}) {
      id
      name
      description
      address
      image
      latitude
      longitude
    }
  }
`;

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
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    if (!hasuraClient) {
      return res.status(500).json({ error: 'Database connection not available' });
    }

    // Parse the voice command
    const command = parseVoiceCommand(text);
    
    let response: VoiceResponse = {
      text: text,
      command: command,
      results: null,
      message: '',
      action: null
    };

    // Handle different intents
    switch (command.intent) {
      case 'order':
        if (command.entities.product) {
          // Search for products
          const productsData = await hasuraClient.request<ProductsResponse>(GET_PRODUCTS_BY_NAME, {
            name: `%${command.entities.product}%`
          });
          
          if (productsData.Products.length > 0) {
            const product = productsData.Products[0];
            response.results = { product };
            response.message = `Found ${product.name} for $${product.final_price}. Would you like to add ${command.entities.quantity || 1} to your cart?`;
            response.action = 'confirm_order';
          } else {
            response.message = `Sorry, I couldn't find ${command.entities.product}. Please try a different product.`;
          }
        } else {
          response.message = "What would you like to order? Please specify a product.";
        }
        break;

      case 'search':
        if (command.entities.category) {
          // Search for shops by category
          const shopsData = await hasuraClient.request<ShopsResponse>(GET_SHOPS_BY_CATEGORY, {
            category: `%${command.entities.category}%`
          });
          
          if (shopsData.Shops.length > 0) {
            response.results = { shops: shopsData.Shops };
            response.message = `Found ${shopsData.Shops.length} ${command.entities.category} shops nearby.`;
            response.action = 'show_shops';
          } else {
            response.message = `Sorry, I couldn't find any ${command.entities.category} shops nearby.`;
          }
        } else {
          response.message = "What type of shop are you looking for?";
        }
        break;

      case 'cart':
        response.message = "Opening your cart. You can review your items and proceed to checkout.";
        response.action = 'open_cart';
        break;

      case 'navigate':
        if (command.entities.category) {
          response.message = `Navigating to ${command.entities.category}.`;
          response.action = `navigate_to_${command.entities.category}`;
        } else {
          response.message = "Where would you like to go?";
        }
        break;

      default:
        response.message = "I'm here to help! You can say 'order milk', 'find restaurants', 'show my cart', or 'go to profile'.";
        response.action = 'help';
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Voice recognition error:', error);
    res.status(500).json({ 
      error: 'Failed to process voice command',
      message: 'Sorry, I encountered an error. Please try again.'
    });
  }
} 