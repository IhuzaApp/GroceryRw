import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invoice ID is required" });
    }

    // GraphQL query to fetch invoice details
    const query = `
      query getInvoiceDetails($id: uuid!) {
        Invoices_by_pk(id: $id) {
          id
          invoice_number
          status
          created_at
          subtotal
          tax
          discount
          delivery_fee
          service_fee
          total_amount
          invoice_items
          order_id
          reel_order_id
          customer_id
          Order {
            id
            OrderID
            status
            created_at
            updated_at
            delivery_fee
            service_fee
            total
            delivery_notes
            delivery_photo_url
            delivery_time
            shop_id
            shopper_id
            user_id
            Order_Items {
              id
              quantity
              price
              created_at
              Product {
                id
                name
                description
                price
                final_price
                measurement_unit
                image
                category
              }
            }
            Shop {
              id
              name
              address
            }
          }
          User {
            id
            name
            email
            phone
          }
        }
      }
    `;

    const variables = { id };

    if (!hasuraClient) {
      return res
        .status(500)
        .json({ message: "Database connection not available" });
    }

    const response = (await hasuraClient.request(query, variables)) as any;
    const invoice = response.Invoices_by_pk;

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    // Transform the data to match the expected format
    const transformedInvoice = {
      id: invoice.id,
      orderId: invoice.order_id || invoice.reel_order_id,
      invoiceNumber: invoice.invoice_number,
      orderNumber: invoice.Order?.OrderID || `INV-${invoice.invoice_number}`,
      status: invoice.status,
      dateCreated: new Date(invoice.created_at).toLocaleDateString(),
      dateCompleted: invoice.Order?.updated_at
        ? new Date(invoice.Order.updated_at).toLocaleDateString()
        : new Date(invoice.created_at).toLocaleDateString(),
      shop: invoice.Order?.Shop?.name || "Unknown Shop",
      shopAddress: invoice.Order?.Shop?.address || "Address not available",
      customer: invoice.User?.name || "Unknown Customer",
      customerEmail: invoice.User?.email || "Email not available",
      items:
        invoice.Order?.Order_Items?.map((item: any) => ({
          name: item.Product?.name || "Unknown Product",
          quantity: item.quantity,
          unitPrice: parseFloat(item.price) || 0,
          unit: item.Product?.measurement_unit || "unit",
          total: (parseFloat(item.price) || 0) * (item.quantity || 0),
        })) || [],
      subtotal: parseFloat(invoice.subtotal) || 0,
      serviceFee: parseFloat(invoice.service_fee) || 0,
      deliveryFee: parseFloat(invoice.delivery_fee) || 0,
      total: parseFloat(invoice.total_amount) || 0,
    };

    res.status(200).json({ invoice: transformedInvoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res.status(500).json({
      message: "Failed to fetch invoice",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
