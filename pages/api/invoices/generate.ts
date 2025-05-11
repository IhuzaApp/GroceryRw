import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { gql } from 'graphql-request';
import { hasuraClient } from '../../../src/lib/hasuraClient';

// GraphQL query to get order details for invoice
const GET_ORDER_DETAILS_FOR_INVOICE = gql`
  query GetOrderDetailsForInvoice($order_id: uuid!) {
    Orders_by_pk(id: $order_id) {
      id
      OrderID
      status
      total
      service_fee
      delivery_fee
      created_at
      updated_at
      userByUserId {
        name
        email
      }
      Shop {
        name
        address
        image
      }
      Order_Items {
        id
        price
        quantity
        Product {
          name
          price
          measurement_unit
        }
      }
      shopper_id
    }
  }
`;

// Type definition for order details
interface OrderDetails {
  Orders_by_pk: {
    id: string;
    OrderID: string;
    status: string;
    total: number;
    service_fee: string;
    delivery_fee: string;
    created_at: string;
    updated_at: string;
    userByUserId: {
      name: string;
      email: string;
    };
    Shop: {
      name: string;
      address: string;
      image?: string;
    };
    Order_Items: Array<{
      id: string;
      price: number;
      quantity: number;
      Product: {
        name: string;
        price: number;
        measurement_unit?: string;
      };
    }>;
    shopper_id: string;
  } | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { orderId } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({ error: 'Missing required field: orderId' });
    }

    // Check if hasuraClient is available (it should be on server side)
    if (!hasuraClient) {
      return res.status(500).json({ error: 'Database client not available' });
    }

    // Get order details for invoice
    const orderDetails = await hasuraClient.request<OrderDetails>(GET_ORDER_DETAILS_FOR_INVOICE, {
      order_id: orderId,
    });

    if (!orderDetails.Orders_by_pk) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDetails.Orders_by_pk;
    
    // Verify the user is authorized to access this order (either as customer or shopper)
    if (order.shopper_id !== session.user.id && order.userByUserId.email !== session.user.email) {
      return res.status(403).json({ error: 'Not authorized to access this order' });
    }
    
    // Calculate totals
    // Use the actual items from the order and calculate based on quantities
    const items = order.Order_Items;
    // For the invoice, we want to show just the items that are in the order
    // We'll calculate the total based on the quantities in the database
    const itemsTotal = items.reduce((total, item) => {
      // Use the item's price and quantity directly
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    const serviceFee = parseFloat(order.service_fee);
    const deliveryFee = parseFloat(order.delivery_fee);
    
    // Generate invoice data that matches what's shown in the Order Summary
    const invoiceData = {
      invoiceNumber: `INV-${order.OrderID}-${new Date().getTime().toString().slice(-6)}`,
      orderId: order.id,
      orderNumber: order.OrderID,
      customer: order.userByUserId.name,
      customerEmail: order.userByUserId.email,
      shop: order.Shop.name,
      shopAddress: order.Shop.address,
      dateCreated: new Date(order.created_at).toLocaleString(),
      dateCompleted: new Date(order.updated_at).toLocaleString(),
      status: order.status,
      items: items.map(item => ({
        name: item.Product.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: parseFloat(item.price) * item.quantity,
        unit: item.Product.measurement_unit || 'item'
      })),
      subtotal: itemsTotal,
      serviceFee,
      deliveryFee,
      // When in shopping mode, the displayed total should match the subtotal without fees
      // For other modes, include the fees
      total: order.status === "shopping" ? itemsTotal : (itemsTotal + serviceFee + deliveryFee)
    };

    return res.status(200).json({
      success: true,
      invoice: invoiceData
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
}