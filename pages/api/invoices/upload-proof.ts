import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

// GraphQL mutation to update invoice proof
const UPDATE_INVOICE_PROOF = gql`
  mutation UpdateInvoiceProof($invoice_id: uuid!, $proof: String!) {
    update_Invoices_by_pk(
      pk_columns: { id: $invoice_id }
      _set: { Proof: $proof }
    ) {
      id
      Proof
      invoice_number
    }
  }
`;

// GraphQL query to get invoice details for verification
const GET_INVOICE_DETAILS = gql`
  query GetInvoiceDetails($invoice_id: uuid!) {
    Invoices_by_pk(id: $invoice_id) {
      id
      invoice_number
      order_id
      reel_order_id
      Order {
        shopper_id
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify authentication
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { invoice_id, proof_image } = req.body;

    if (!invoice_id || !proof_image) {
      return res.status(400).json({ 
        error: "Missing required fields: invoice_id and proof_image" 
      });
    }

    if (!hasuraClient) {
      return res.status(500).json({ 
        error: "Database connection not available" 
      });
    }

    // Verify the invoice exists and belongs to the authenticated shopper
    const invoiceData = await hasuraClient.request(GET_INVOICE_DETAILS, {
      invoice_id
    }) as any;

    if (!invoiceData.Invoices_by_pk) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Check if the invoice belongs to the authenticated shopper
    const shopperId = invoiceData.Invoices_by_pk.Order?.shopper_id;
    if (shopperId !== session.user.id) {
      return res.status(403).json({ 
        error: "You can only upload proof for your own invoices" 
      });
    }

    // Update the invoice with the proof image
    const result = await hasuraClient.request(UPDATE_INVOICE_PROOF, {
      invoice_id,
      proof: proof_image
    }) as any;

    if (!result.update_Invoices_by_pk) {
      return res.status(500).json({ 
        error: "Failed to update invoice proof" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Proof uploaded successfully",
      invoice: result.update_Invoices_by_pk
    });

  } catch (error) {
    console.error("Error uploading proof:", error);
    res.status(500).json({
      error: "Failed to upload proof",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 