import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// Mutation to create a food order (using restaurant_orders table)
const CREATE_FOOD_ORDER = gql`
  mutation CreateFoodOrder(
    $user_id: uuid!,
    $restaurant_id: uuid!,
    $delivery_address_id: uuid!,
    $total: String!,
    $delivery_fee: String!,
    $discount: String,
    $voucher_code: String,
    $delivery_time: String!,
    $delivery_notes: String,
                $status: String = "WAITING_FOR_CONFIRMATION",
    $OrderID: String!
  ) {
    insert_restaurant_orders(
      objects: {
        user_id: $user_id,
        restaurant_id: $restaurant_id,
        delivery_address_id: $delivery_address_id,
        total: $total,
        delivery_fee: $delivery_fee,
        discount: $discount,
        voucher_code: $voucher_code,
        delivery_time: $delivery_time,
        delivery_notes: $delivery_notes,
        status: $status,
        found: false,
        shopper_id: null,
        OrderID: $OrderID
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
      }
    }
  }
`;

// Mutation to add dishes to a food order (using restaurant_dishe_orders table)
const ADD_DISHES_TO_ORDER = gql`
  mutation AddDishesToOrder(
    $order_id: uuid!,
    $dish_id: uuid!,
    $quantity: String!,
    $price: String!
  ) {
    insert_restaurant_dishe_orders(
      objects: {
        order_id: $order_id,
        dish_id: $dish_id,
        quantity: $quantity,
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

interface FoodCheckoutRequest {
  restaurant_id: string;
  delivery_address_id: string;
  service_fee: string;
  delivery_fee: string;
  discount?: string | null;
  voucher_code?: string | null;
  delivery_time: string;
  delivery_notes?: string | null;
  items: Array<{
    dish_id: string;
    quantity: number;
    price: string;
    discount?: string | null;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

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
      delivery_time,
      delivery_notes,
      items,
    }: FoodCheckoutRequest = req.body;

    // Validate required fields
    if (!restaurant_id || !delivery_address_id || !items || items.length === 0) {
      return res.status(400).json({ 
        error: "Missing required fields: restaurant_id, delivery_address_id, and items" 
      });
    }

    // Use restaurant_id directly for restaurant_orders table

    // Calculate total amount
    let subtotal = 0;
    items.forEach(item => {
      let price = parseFloat(item.price);
      
      // Apply dish-level discount if provided
      if (item.discount && item.discount !== "0" && item.discount !== "0%") {
        if (item.discount.includes('%')) {
          const discountPercent = parseFloat(item.discount.replace('%', ''));
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

    // Generate OrderID for restaurant order
    const OrderID = `R${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Step 1: Create the food order using GraphQL mutation
    const orderResponse = await hasuraClient.request(
      CREATE_FOOD_ORDER,
      {
        user_id: session.user.id,
        restaurant_id,
        delivery_address_id,
        total: totalAmount.toString(),
        delivery_fee: delivery_fee,
        discount: discount || null,
        voucher_code: voucher_code || null,
        delivery_time: delivery_time,
        delivery_notes: delivery_notes || null,
        OrderID: OrderID,
      }
    );

    if (!orderResponse.insert_restaurant_orders || orderResponse.insert_restaurant_orders.affected_rows === 0) {
      return res.status(500).json({ error: 'Failed to create food order' });
    }

    const createdOrder = orderResponse.insert_restaurant_orders.returning[0];
    const orderId = createdOrder.id;

    // Step 2: Add dishes to the order
    const dishPromises = items.map(item =>
      hasuraClient.request(ADD_DISHES_TO_ORDER, {
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity.toString(),
        price: item.price,
      })
    );

    const dishResults = await Promise.all(dishPromises);

    // Check if all dishes were added successfully
    const totalDishesAdded = dishResults.reduce(
      (sum, result) => sum + result.insert_restaurant_dishe_orders.affected_rows,
      0
    );

    if (totalDishesAdded !== items.length) {
      console.error('Not all dishes were added to the order');
    }

    // Return success response
    return res.status(200).json({
      success: true,
      order_id: createdOrder.id,
      order_number: createdOrder.OrderID,
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
