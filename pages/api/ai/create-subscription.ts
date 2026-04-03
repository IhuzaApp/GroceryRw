import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { momoService } from "../../../src/lib/momoService";
import { randomUUID } from "crypto";

const INSERT_INVOICE_MUTATION = gql`
  mutation InsertInvoice(
    $user_id: uuid!,
    $aiUsage_id: uuid,
    $invoice_number: String!,
    $plan_price: String!,
    $status: String!,
    $issued_at: timestamptz!,
    $due_date: timestamptz!
  ) {
    insert_subscription_invoices(objects: {
      aiUsage_id: $aiUsage_id,
      invoice_number: $invoice_number,
      plan_name: "AI Assistant Plus (100 Requests)",
      plan_price: $plan_price,
      subtotal_amount: $plan_price,
      currency: "RWF",
      status: $status,
      issued_at: $issued_at,
      due_date: $due_date,
      payment_method: "MTN MoMo",
      deleted: false,
      is_overdue: false
    }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

const GET_AI_USAGE_ID = gql`
  query GetAIUsageId($user_id: uuid!, $month: String!, $year: String!) {
    ai_usage(where: { user_id: { _eq: $user_id }, month: { _eq: $month }, year: { _eq: $year } }) {
      id
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Phone number is required for MoMo" });

  const now = new Date();
  const month = (now.getMonth() + 1).toString();
  const year = now.getFullYear().toString();
  const dueDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days later

  try {
    if (!hasuraClient) throw new Error("Hasura client not initialized");

    // 1. Get or create AI usage record ID to link the invoice
    const usageData: any = await hasuraClient.request(GET_AI_USAGE_ID, {
      user_id: session.user.id,
      month,
      year
    });
    
    let aiUsageId = usageData.ai_usage[0]?.id;

    // 2. Initiate MoMo Payment
    const externalId = `AI-SUB-${Date.now()}`;
    const { referenceId } = await momoService.requestToPay({
      amount: 1000,
      currency: "RWF",
      externalId,
      payerNumber: phone,
      payerMessage: "Subscription for AI Assistant Plus",
      payeeNote: "PLAS AI Service"
    });

    // 3. Create Pending Invoice
    const invoiceNumber = `INV-AI-${Date.now()}`;
    await hasuraClient.request(INSERT_INVOICE_MUTATION, {
      user_id: session.user.id,
      aiUsage_id: aiUsageId,
      invoice_number: invoiceNumber,
      plan_price: "1000",
      status: "pending",
      issued_at: now.toISOString(),
      due_date: dueDate.toISOString()
    });

    res.status(200).json({ 
      success: true, 
      referenceId,
      message: "Payment initiated. Please check your phone." 
    });

  } catch (error) {
    console.error("[AI Subscribe API] Error:", error);
    res.status(500).json({ error: "Failed to process subscription" });
  }
}
