import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import type { InvoiceData } from "../../../src/lib/invoiceUtils";

// GraphQL query to get order details for invoice
const GET_ORDER_BY_ID = gql`
  query GetOrderForInvoice($order_id: uuid!) {
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET method
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Extract the invoice ID from the URL
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Invalid invoice ID" });
    }

    // Extract the order ID from the invoice ID
    // The format we're using is inv_TIMESTAMP
    // For now, let's simulate a database lookup based on the invoice ID
    
    // This would typically be a database query to find the invoice by ID
    // For now, we'll use a simplistic approach to create a demo invoice
    const invoiceData: InvoiceData = {
      id: id,
      invoiceNumber: `INV-${id.slice(4)}`,
      orderId: `order_${id.slice(4)}`,
      orderNumber: `ORD-${id.slice(-6)}`,
      customer: "Customer Name",
      customerEmail: "customer@example.com",
      shop: "Grocery Store",
      shopAddress: "123 Main St, City",
      dateCreated: new Date().toLocaleString(),
      dateCompleted: new Date().toLocaleString(),
      status: "delivered",
      items: [
        {
          name: "Sample Product 1",
          quantity: 2,
          unitPrice: 9.99,
          total: 19.98,
          unit: "item"
        },
        {
          name: "Sample Product 2",
          quantity: 1,
          unitPrice: 15.50,
          total: 15.50,
          unit: "kg"
        }
      ],
      subtotal: 35.48,
      serviceFee: 2.99,
      deliveryFee: 5.99,
      total: 44.46,
    };

    // Return the mock invoice data
    return res.status(200).json({
      success: true,
      invoice: invoiceData,
    });
  } catch (error) {
    console.error("Error retrieving invoice:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
} 