import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

    // Verify restaurant exists
    const restaurant = await prisma.restaurants.findUnique({
      where: { id: restaurant_id },
    });

    if (!restaurant) {
      return res.status(404).json({ error: "Restaurant not found" });
    }

    // Verify delivery address exists and belongs to user
    const deliveryAddress = await prisma.addresses.findFirst({
      where: {
        id: delivery_address_id,
        user_id: session.user.id,
      },
    });

    if (!deliveryAddress) {
      return res.status(404).json({ error: "Delivery address not found" });
    }

    // Verify all dishes exist and belong to the restaurant
    const dishIds = items.map(item => item.dish_id);
    const dishes = await prisma.restaurantDishes.findMany({
      where: {
        id: { in: dishIds },
        restaurant_id: restaurant_id,
        is_active: true,
      },
    });

    if (dishes.length !== dishIds.length) {
      return res.status(400).json({ 
        error: "Some dishes are not available or don't belong to this restaurant" 
      });
    }

    // Create a map of dishes for quick lookup
    const dishMap = new Map(dishes.map(dish => [dish.id, dish]));

    // Calculate total amount
    let subtotal = 0;
    const orderItems = items.map(item => {
      const dish = dishMap.get(item.dish_id);
      if (!dish) {
        throw new Error(`Dish ${item.dish_id} not found`);
      }

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

      return {
        dish_id: item.dish_id,
        quantity: item.quantity,
        unit_price: price.toString(),
        total_price: itemTotal.toString(),
        dish_name: dish.name,
      };
    });

    const serviceFeeAmount = 0; // No service fee for food orders
    const deliveryFeeAmount = parseFloat(delivery_fee);
    const discountAmount = discount ? parseFloat(discount) : 0;
    
    const totalAmount = subtotal + deliveryFeeAmount - discountAmount;

    // Create the order using a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.orders.create({
        data: {
          user_id: session.user.id,
          restaurant_id: restaurant_id,
          delivery_address_id: delivery_address_id,
          status: "pending",
          total_amount: totalAmount.toString(),
          subtotal: subtotal.toString(),
          service_fee: "0", // No service fee for food orders
          delivery_fee: delivery_fee,
          discount: discountAmount > 0 ? discountAmount.toString() : null,
          voucher_code: voucher_code,
          delivery_time: new Date(delivery_time),
          delivery_notes: delivery_notes,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create order items
      await tx.orderItems.createMany({
        data: orderItems.map(item => ({
          order_id: order.id,
          dish_id: item.dish_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          created_at: new Date(),
          updated_at: new Date(),
        })),
      });

      // Create order status history
      await tx.orderStatusHistory.create({
        data: {
          order_id: order.id,
          status: "pending",
          timestamp: new Date(),
          notes: "Order created",
        },
      });

      return order;
    });

    // Return success response
    return res.status(200).json({
      success: true,
      order_id: result.id,
      message: "Food order created successfully",
      total_amount: totalAmount,
      delivery_time: delivery_time,
    });

  } catch (error) {
    console.error("Food checkout error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    await prisma.$disconnect();
  }
}
