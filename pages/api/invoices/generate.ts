import type { NextApiRequest, NextApiResponse } from 'next';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { gql } from 'graphql-request';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { CREATE_INVOICE, generateInvoiceNumber } from '../queries/invoices';

// GraphQL query to get order details for invoice
const GET_ORDER_DETAILS = gql`
  query GetOrderDetailsForInvoice($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      OrderID
      created_at
      total
      service_fee
      delivery_fee
      discount
      status
      user: userByUserId {
        id
        name
        email
      }
      shop: Shop {
        id
        name
        address
      }
      Order_Items {
        id
        quantity
        price
        product: Product {
          id
          name
          price
          measurement_unit
        }
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Authenticate the user
  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Missing required field: orderId' });
  }

  try {
    console.log('Generating invoice for order:', orderId);
    
    // Get order details
    const orderData = await hasuraClient.request<{
      Orders_by_pk: {
        id: string;
        OrderID: string;
        created_at: string;
        total: number;
        service_fee: string;
        delivery_fee: string;
        discount: number;
        status: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
        shop: {
          id: string;
          name: string;
          address: string;
        };
        Order_Items: Array<{
          id: string;
          quantity: number;
          price: string;
          product: {
            id: string;
            name: string;
            price: string;
            measurement_unit?: string;
          };
        }>;
      } | null;
    }>(
      GET_ORDER_DETAILS,
      { orderId }
    );

    const order = orderData.Orders_by_pk;
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ 
        error: 'Cannot generate invoice for orders that are not delivered' 
      });
    }

    // Calculate values for invoice
    const subtotal = order.Order_Items.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 
      0
    );
    
    const serviceFee = parseFloat(order.service_fee || '0');
    const deliveryFee = parseFloat(order.delivery_fee || '0');
    const discount = order.discount || 0;
    
    // In a real app, tax might be calculated differently
    const taxRate = 0.18; // 18% VAT
    const tax = subtotal * taxRate;
    
    // Create invoice items JSON array
    const invoiceItems = order.Order_Items.map((item: any) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      unit_price: parseFloat(item.price),
      quantity: item.quantity,
      total_price: parseFloat(item.price) * item.quantity,
      measurement_unit: item.product.measurement_unit || 'unit'
    }));

    // Generate invoice number using helper function from queries/invoices.ts
    const invoiceNumber = generateInvoiceNumber(order.id);

    // Create invoice in database using the mutation from queries/invoices.ts
    const invoiceData = await hasuraClient.request<{
      insert_Invoices: {
        returning: [{
          id: string;
          invoice_number: string;
          created_at: string;
        }];
      };
    }>(
      CREATE_INVOICE,
      {
        order_id: order.id,
        invoice_number: invoiceNumber,
        customer_id: order.user.id,
        total_amount: order.total.toString(),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        service_fee: serviceFee.toString(),
        delivery_fee: deliveryFee.toString(),
        discount: discount.toString(),
        invoice_items: invoiceItems,
        status: 'paid' // Assuming delivered orders are paid
      }
    );

    const invoice = invoiceData.insert_Invoices.returning[0];

    return res.status(200).json({
      success: true,
      message: 'Invoice generated successfully',
      invoice: {
        id: invoice.id,
        invoice_number: invoice.invoice_number,
        created_at: invoice.created_at,
        returning: [invoice] // Include this for backward compatibility
      }
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate invoice' 
    });
  }
} 