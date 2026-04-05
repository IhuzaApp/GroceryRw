import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { momoService } from "../../../src/lib/momoService";

const GET_TRANSACTION_STATUS = gql`
  query GetTransactionStatus($reference_id: String!) {
    subscription_transactions(where: { reference_id: { _eq: $reference_id } }) {
      id
      user_id
    }
  }
`;

const GET_PENDING_INVOICE = gql`
  query GetPendingInvoice($user_id: uuid!) {
    ai_usage(where: { user_id: { _eq: $user_id } }) {
      id
      subscription_invoices(
        where: { status: { _eq: "pending" } }
        order_by: { issued_at: desc }
        limit: 1
      ) {
        id
        plan_price
      }
    }
  }
`;

const UPDATE_SUBSCRIPTION_SUCCESS = gql`
  mutation UpdateSubscriptionSuccess(
    $invoice_id: uuid!
    $transaction_id: uuid!
    $ai_usage_id: uuid!
    $mtn_response: String!
    $paid_at: timestamptz!
    $subtotal: String!
    $tax: String!
  ) {
    # 1. Update Invoice
    update_subscription_invoices_by_pk(
      pk_columns: { id: $invoice_id }
      _set: {
        status: "paid"
        paid_at: $paid_at
        subtotal_amount: $subtotal
        tax_amount: $tax
      }
    ) {
      id
    }
    # 2. Update Transaction
    update_subscription_transactions_by_pk(
      pk_columns: { id: $transaction_id }
      _set: {
        status: "SUCCESSFUL"
        mtn_response: $mtn_response
        update_at: $paid_at
      }
    ) {
      id
    }
    # 3. Grant AI Requests (Set to 100 for the month)
    update_ai_usage_by_pk(
      pk_columns: { id: $ai_usage_id }
      _set: { request_count: 100 }
    ) {
      id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  const { referenceId } = req.body;
  if (!referenceId)
    return res.status(400).json({ error: "referenceId is required" });

  try {
    if (!hasuraClient) throw new Error("Hasura client not initialized");

    // 1. Get payment status from MoMo
    const momoStatus = await momoService.getPaymentStatus(referenceId);

    if (momoStatus.status !== "SUCCESSFUL") {
      return res.status(200).json({
        success: false,
        status: momoStatus.status,
        message: "Payment is not successful yet.",
      });
    }

    // 2. Find internal transaction record
    const transData: any = await hasuraClient.request(GET_TRANSACTION_STATUS, {
      reference_id: referenceId,
    });
    const transaction = transData.subscription_transactions[0];
    if (!transaction) throw new Error("Internal transaction record not found");

    // 3. Find pending invoice via AI usage
    const invoiceData: any = await hasuraClient.request(GET_PENDING_INVOICE, {
      user_id: session.user.id,
    });

    const aiUsage = invoiceData.ai_usage[0];
    const invoice = aiUsage?.subscription_invoices[0];

    if (!invoice) throw new Error("No pending invoice found for this user");

    // 4. Calculate Tax Slit (VAT 18%)
    const planPrice = parseFloat(invoice.plan_price || "1000");
    const subtotal = Math.round((planPrice / 1.18) * 100) / 100;
    const tax = Math.round((planPrice - subtotal) * 100) / 100;

    // 5. Finalize everything
    await hasuraClient.request(UPDATE_SUBSCRIPTION_SUCCESS, {
      invoice_id: invoice.id,
      transaction_id: transaction.id,
      ai_usage_id: aiUsage.id,
      mtn_response: JSON.stringify(momoStatus),
      paid_at: new Date().toISOString(),
      subtotal: String(subtotal),
      tax: String(tax),
    });

    res.status(200).json({
      success: true,
      message: "Subscription activated! You now have 100 AI requests.",
    });
  } catch (error) {
    console.error("[AI Verify API] Error:", error);
    res.status(500).json({ error: "Failed to verify subscription" });
  }
}
