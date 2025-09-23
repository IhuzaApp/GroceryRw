import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_BATCH_DETAILS = gql`
  query GetBatchDetails($orderId: uuid!) {
    Orders(where: { id: { _eq: $orderId } }) {
      id
      OrderID
      user_id
      status
      created_at
      total
      delivery_fee
      service_fee
      shop_id
      shopper_id
      delivery_address_id
      delivery_notes
      shop {
        id
        name
        address
        image
      }
      Address {
        id
        street
        city
        postal_code
        latitude
        longitude
      }
      orderedBy {
        id
        name
        phone
        email
      }
      order_items {
        id
        quantity
        price
        product {
          id
          name
          description
          image
          price
        }
      }
    }
    
    reel_orders(where: { id: { _eq: $orderId } }) {
      id
      OrderID
      user_id
      status
      created_at
      total
      delivery_fee
      service_fee
      shop_id
      shopper_id
      delivery_address_id
      delivery_notes
      shop {
        id
        name
        address
        image
      }
      Address {
        id
        street
        city
        postal_code
        latitude
        longitude
      }
      orderedBy {
        id
        name
        phone
        email
      }
      reel_order_items {
        id
        quantity
        price
        product {
          id
          name
          description
          image
          price
        }
      }
    }
  }
`;

interface BatchDetailsResponse {
  Orders: Array<{
    id: string;
    OrderID: string;
    user_id: string;
    status: string;
    created_at: string;
    total: string;
    delivery_fee: string;
    service_fee: string;
    shop_id: string;
    shopper_id: string | null;
    delivery_address_id: string;
    delivery_notes: string | null;
    shop: {
      id: string;
      name: string;
      address: string;
      image: string;
    };
    Address: {
      id: string;
      street: string;
      city: string;
      postal_code: string;
      latitude: string;
      longitude: string;
    };
    orderedBy: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
    order_items: Array<{
      id: string;
      quantity: number;
      price: string;
      product: {
        id: string;
        name: string;
        description: string;
        image: string;
        price: string;
      };
    }>;
  }>;
  reel_orders: Array<{
    id: string;
    OrderID: string;
    user_id: string;
    status: string;
    created_at: string;
    total: string;
    delivery_fee: string;
    service_fee: string;
    shop_id: string;
    shopper_id: string | null;
    delivery_address_id: string;
    delivery_notes: string | null;
    shop: {
      id: string;
      name: string;
      address: string;
      image: string;
    };
    Address: {
      id: string;
      street: string;
      city: string;
      postal_code: string;
      latitude: string;
      longitude: string;
    };
    orderedBy: {
      id: string;
      name: string;
      phone: string;
      email: string;
    };
    reel_order_items: Array<{
      id: string;
      quantity: number;
      price: string;
      product: {
        id: string;
        name: string;
        description: string;
        image: string;
        price: string;
      };
    }>;
  }>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id: orderId } = req.query;

  if (!orderId || typeof orderId !== "string") {
    return res.status(400).json({ error: "Order ID is required" });
  }

  try {
    const response = await hasuraClient.request<BatchDetailsResponse>(
      GET_BATCH_DETAILS,
      { orderId }
    );

    // Check if it's a regular order
    if (response.Orders && response.Orders.length > 0) {
      const order = response.Orders[0];
      
      // Check if order is already assigned to another shopper
      if (order.shopper_id && order.shopper_id !== session.user.id) {
        return res.status(404).json({ 
          error: "This batch has already been assigned to another shopper" 
        });
      }

      // Check if order is in a valid state for assignment
      if (order.status !== "PENDING") {
        return res.status(404).json({ 
          error: "This batch is no longer available for assignment" 
        });
      }

      const batchDetails = {
        id: order.id,
        OrderID: order.OrderID,
        shopName: order.shop.name,
        customerAddress: `${order.Address.street}, ${order.Address.city} ${order.Address.postal_code}`,
        distance: 0, // This would need to be calculated based on shopper location
        itemsCount: order.order_items.length,
        estimatedEarnings: parseFloat(order.delivery_fee) + parseFloat(order.service_fee),
        orderType: "regular" as const,
        createdAt: order.created_at,
        items: order.order_items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          image: item.product.image,
        })),
        customer: {
          name: order.orderedBy.name,
          phone: order.orderedBy.phone,
        },
        deliveryNotes: order.delivery_notes,
        totalAmount: parseFloat(order.total),
        deliveryFee: parseFloat(order.delivery_fee),
        serviceFee: parseFloat(order.service_fee),
      };

      return res.status(200).json({ batch: batchDetails });
    }

    // Check if it's a reel order
    if (response.reel_orders && response.reel_orders.length > 0) {
      const order = response.reel_orders[0];
      
      // Check if order is already assigned to another shopper
      if (order.shopper_id && order.shopper_id !== session.user.id) {
        return res.status(404).json({ 
          error: "This batch has already been assigned to another shopper" 
        });
      }

      // Check if order is in a valid state for assignment
      if (order.status !== "PENDING") {
        return res.status(404).json({ 
          error: "This batch is no longer available for assignment" 
        });
      }

      const batchDetails = {
        id: order.id,
        OrderID: order.OrderID,
        shopName: order.shop.name,
        customerAddress: `${order.Address.street}, ${order.Address.city} ${order.Address.postal_code}`,
        distance: 0, // This would need to be calculated based on shopper location
        itemsCount: order.reel_order_items.length,
        estimatedEarnings: parseFloat(order.delivery_fee) + parseFloat(order.service_fee),
        orderType: "reel" as const,
        createdAt: order.created_at,
        items: order.reel_order_items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: parseFloat(item.price),
          image: item.product.image,
        })),
        customer: {
          name: order.orderedBy.name,
          phone: order.orderedBy.phone,
        },
        deliveryNotes: order.delivery_notes,
        totalAmount: parseFloat(order.total),
        deliveryFee: parseFloat(order.delivery_fee),
        serviceFee: parseFloat(order.service_fee),
      };

      return res.status(200).json({ batch: batchDetails });
    }

    // No order found
    return res.status(404).json({ 
      error: "Batch not found or no longer available" 
    });

  } catch (error) {
    console.error("Error fetching batch details:", error);
    return res.status(500).json({ 
      error: "Failed to fetch batch details",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
