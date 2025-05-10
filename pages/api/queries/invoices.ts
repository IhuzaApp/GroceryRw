import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL query to get a single invoice by ID
const GET_INVOICE_BY_ID = gql`
  query GetInvoiceById($id: uuid!) {
    Invoices_by_pk(id: $id) {
      id
      invoice_number
      created_at
      total_amount
      subtotal
      tax
      service_fee
      delivery_fee
      discount
      status
      invoice_items
      customer_id
      User {
        id
        name
        email
        profile_picture
      }
      order: Order {
        id
        OrderID
        created_at
        shop: Shop {
          id
          name
          address
        }
      }
    }
  }
`;

// GraphQL query to get all invoices for a user
const GET_USER_INVOICES = gql`
  query GetUserInvoices($userId: uuid!) {
    Invoices(
      where: { customer_id: { _eq: $userId } }
      order_by: { created_at: desc }
    ) {
      id
      invoice_number
      created_at
      total_amount
      status
      order: Order {
        id
        OrderID
        shop: Shop {
          name
        }
      }
    }
  }
`;

// GraphQL mutation to create a new invoice
const CREATE_INVOICE = gql`
  mutation CreateInvoice(
    $order_id: uuid!
    $invoice_number: String!
    $customer_id: uuid!
    $total_amount: String!
    $subtotal: String!
    $tax: String!
    $service_fee: String!
    $delivery_fee: String!
    $discount: String!
    $invoice_items: jsonb!
    $status: String!
  ) {
    insert_Invoices(
      objects: [
        {
          order_id: $order_id
          invoice_number: $invoice_number
          customer_id: $customer_id
          total_amount: $total_amount
          subtotal: $subtotal
          tax: $tax
          service_fee: $service_fee
          delivery_fee: $delivery_fee
          discount: $discount
          invoice_items: $invoice_items
          status: $status
        }
      ]
    ) {
      returning {
        id
        invoice_number
        created_at
      }
    }
  }
`;

// Helper function to generate invoice number
const generateInvoiceNumber = (orderId: string): string => {
  const timestamp = new Date().getTime();
  const shortOrderId = orderId.substring(0, 6);
  return `INV-${shortOrderId}-${timestamp}`;
};

// Handler for retrieving invoices
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { id, userId } = req.query;

  try {
    // Get a single invoice by ID
    if (id && typeof id === "string") {
      const data = await hasuraClient.request<{
        Invoices_by_pk: any;
      }>(GET_INVOICE_BY_ID, { id });

      if (!data.Invoices_by_pk) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      return res.status(200).json(data.Invoices_by_pk);
    }

    // Get all invoices for a user
    if (userId && typeof userId === "string") {
      const data = await hasuraClient.request<{
        Invoices: any[];
      }>(GET_USER_INVOICES, { userId });

      return res.status(200).json(data.Invoices);
    }

    return res
      .status(400)
      .json({ error: "Missing required parameter: id or userId" });
  } catch (error) {
    console.error("Error fetching invoice(s):", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "Failed to fetch invoice(s)",
    });
  }
}

// Export the queries and helpers for use in other files
export {
  GET_INVOICE_BY_ID,
  GET_USER_INVOICES,
  CREATE_INVOICE,
  generateInvoiceNumber,
};
