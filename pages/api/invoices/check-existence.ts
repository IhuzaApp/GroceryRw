import { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

const CHECK_INVOICE_EXISTENCE = gql`
  query CheckInvoiceExistence($orderId: uuid!) {
    Invoices(where: { order_id: { _eq: $orderId } }, limit: 1) {
      id
      invoice_number
      status
      created_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { orderId } = req.query;

    if (!orderId || typeof orderId !== "string") {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Check if invoice exists for this order using GraphQL
    const data = await hasuraClient.request(CHECK_INVOICE_EXISTENCE, {
      orderId: orderId,
    });

    const invoice = data.Invoices && data.Invoices.length > 0 ? data.Invoices[0] : null;

    return res.status(200).json({
      hasInvoice: !!invoice,
      invoice: invoice ? {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        createdAt: invoice.created_at,
      } : null,
    });
  } catch (error) {
    console.error("Error checking invoice existence:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}