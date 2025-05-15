import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

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
        id
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

// GraphQL mutation to insert invoice data into the Invoices table
const ADD_INVOICE = gql`
  mutation addInvoiceDetails(
    $customer_id: uuid = "", 
    $delivery_fee: String = "", 
    $discount: String = "", 
    $invoice_items: jsonb = "", 
    $invoice_number: String = "", 
    $order_id: uuid = "", 
    $service_fee: String = "", 
    $status: String = "", 
    $subtotal: String = "", 
    $tax: String = "", 
    $total_amount: String = ""
  ) {
    insert_Invoices(
      objects: {
        customer_id: $customer_id, 
        delivery_fee: $delivery_fee, 
        discount: $discount, 
        invoice_items: $invoice_items, 
        invoice_number: $invoice_number, 
        order_id: $order_id, 
        service_fee: $service_fee, 
        status: $status, 
        subtotal: $subtotal, 
        tax: $tax, 
        total_amount: $total_amount
      }
    ) {
      returning {
        id
        invoice_number
      }
      affected_rows
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
      id: string;
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
      price: string;
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

// GraphQL mutation return type
interface AddInvoiceResult {
  insert_Invoices: {
    returning: Array<{
      id: string;
      invoice_number: string;
    }>;
    affected_rows: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("Invoice generate API called with body:", req.body);
    
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User session is missing or invalid"
      });
    }

    const { orderId } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({ 
        error: "Missing required field: orderId",
        message: "Order ID must be provided in the request body" 
      });
    }

    console.log(`Generating invoice for order: ${orderId}, requested by user: ${session.user.id}`);

    // Check if hasuraClient is available (it should be on server side)
    if (!hasuraClient) {
      return res.status(500).json({ 
        error: "Database client not available",
        message: "Hasura client initialization failed" 
      });
    }

    try {
      // Get order details for invoice
      console.log("Fetching order details from database...");
      const orderDetails = await hasuraClient.request<OrderDetails>(
        GET_ORDER_DETAILS_FOR_INVOICE,
        {
          order_id: orderId,
        }
      );

      if (!orderDetails.Orders_by_pk) {
        console.log(`Order not found: ${orderId}`);
        return res.status(404).json({ 
          error: "Order not found",
          message: `No order found with ID: ${orderId}` 
        });
      }

      const order = orderDetails.Orders_by_pk;
      console.log(`Order found with status: ${order.status}`);

      // Verify the user is authorized to access this order (either as customer or shopper)
      if (
        order.shopper_id !== session.user.id &&
        order.userByUserId.id !== session.user.id
      ) {
        console.log(`User ${session.user.id} is not authorized to access order ${orderId}`);
        return res.status(403).json({ 
          error: "Not authorized to access this order",
          message: "You must be either the customer or shopper for this order" 
        });
      }

      // Calculate totals
      // Use the actual items from the order and calculate based on quantities
      const items = order.Order_Items;
      
      // For the invoice, we want to show just the items that are in the order
      // We'll calculate the total based on the quantities in the database
      const itemsTotal = items.reduce((total, item) => {
        // Use the item's price and quantity directly
        return total + parseFloat(item.price) * item.quantity;
      }, 0);

      const serviceFee = parseFloat(order.service_fee) || 0;
      const deliveryFee = parseFloat(order.delivery_fee) || 0;

      // Create a unique invoice number
      const invoiceNumber = `INV-${order.OrderID || order.id.slice(-8)}-${new Date()
        .getTime()
        .toString()
        .slice(-6)}`;

      // Prepare invoice items for storage in jsonb format
      const invoiceItems = items.map((item) => ({
        id: item.id,
        name: item.Product.name,
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        total: parseFloat(item.price) * item.quantity,
        unit: item.Product.measurement_unit || "item",
      }));

      // Format values for database storage
      const subtotalStr = itemsTotal.toFixed(2);
      const serviceFeeStr = serviceFee.toFixed(2);
      const deliveryFeeStr = deliveryFee.toFixed(2);
      const discountStr = "0.00"; // Assuming no discount for now
      const taxStr = "0.00"; // Assuming no tax for now
      const totalAmount = (itemsTotal + serviceFee + deliveryFee).toFixed(2);

      console.log("Saving invoice to database...");
      
      try {
        // Save invoice data to the database
        const saveResult = await hasuraClient.request<AddInvoiceResult>(ADD_INVOICE, {
          customer_id: order.userByUserId.id,
          delivery_fee: deliveryFeeStr,
          discount: discountStr,
          invoice_items: invoiceItems,
          invoice_number: invoiceNumber,
          order_id: order.id,
          service_fee: serviceFeeStr,
          status: "completed",
          subtotal: subtotalStr,
          tax: taxStr,
          total_amount: totalAmount
        });

        console.log("Invoice saved to database:", JSON.stringify(saveResult, null, 2));

        // Generate invoice data for the response
        const invoiceData = {
          id: saveResult.insert_Invoices.returning[0]?.id || `inv_${Date.now()}`,
          invoiceNumber: invoiceNumber,
          orderId: order.id,
          orderNumber: order.OrderID || order.id.slice(-8),
          customer: order.userByUserId.name,
          customerEmail: order.userByUserId.email,
          shop: order.Shop.name,
          shopAddress: order.Shop.address,
          dateCreated: new Date(order.created_at).toLocaleString(),
          dateCompleted: new Date(order.updated_at).toLocaleString(),
          status: order.status,
          items: items.map((item) => ({
            name: item.Product.name,
            quantity: item.quantity,
            unitPrice: parseFloat(item.price),
            total: parseFloat(item.price) * item.quantity,
            unit: item.Product.measurement_unit || "item",
          })),
          subtotal: itemsTotal,
          serviceFee,
          deliveryFee,
          // When in shopping mode, the displayed total should match the subtotal without fees
          // For other modes, include the fees
          total:
            order.status === "shopping"
              ? itemsTotal
              : itemsTotal + serviceFee + deliveryFee,
        };

        console.log("Generated invoice data:", {
          id: invoiceData.id,
          invoiceNumber: invoiceData.invoiceNumber,
          orderId: invoiceData.orderId
        });

        return res.status(200).json({
          success: true,
          invoice: invoiceData,
          dbRecord: saveResult.insert_Invoices.returning[0] || null
        });
      } catch (dbError) {
        console.error("Database error while saving invoice:", dbError);
        return res.status(500).json({
          error: "Database error",
          message: dbError instanceof Error ? dbError.message : "Failed to save invoice to database",
          details: dbError
        });
      }
    } catch (queryError) {
      console.error("Error querying order details:", queryError);
      return res.status(500).json({
        error: "Database query error",
        message: queryError instanceof Error ? queryError.message : "Failed to query order details",
        details: queryError
      });
    }
  } catch (error) {
    console.error("Unexpected error generating invoice:", error);
    return res.status(500).json({
      error: "Unexpected error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
      details: error
    });
  }
}
