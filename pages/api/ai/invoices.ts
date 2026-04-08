import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const GET_AI_INVOICES_QUERY = gql`
  query GetAIInvoices($user_id: uuid!) {
    ai_usage(
      where: { user_id: { _eq: $user_id } }
      order_by: { year: desc, month: desc }
    ) {
      id
      month
      year
      request_count
      requests_sent
      subscription_invoices(order_by: { issued_at: desc }) {
        id
        invoice_number
        plan_name
        plan_price
        subtotal_amount
        tax_amount
        currency
        status
        issued_at
        due_date
        payment_method
        is_overdue
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    if (!hasuraClient) throw new Error("Hasura client not initialized");

    const data: any = await hasuraClient.request(GET_AI_INVOICES_QUERY, {
      user_id: session.user.id,
    });

    const usageRecords: any[] = data.ai_usage || [];

    // Flatten all invoices across all usage periods, attach period info
    const invoices = usageRecords.flatMap((u: any) =>
      (u.subscription_invoices || []).map((inv: any) => ({
        ...inv,
        month: u.month,
        year: u.year,
      }))
    );

    // Current month usage stats
    const now = new Date();
    const currentMonth = now.toLocaleString("default", { month: "long" });
    const currentYear = now.getFullYear().toString();

    const current = usageRecords.find(
      (u) => u.month === currentMonth && u.year === currentYear
    );

    const usageCount = current?.requests_sent || 0;
    const requestLimit = current?.request_count;
    const isSubscribed = (current?.subscription_invoices || []).some(
      (inv: any) => inv.status === "paid"
    );
    const limit =
      requestLimit !== undefined && requestLimit !== null
        ? requestLimit
        : isSubscribed
        ? 100
        : 20;

    res.status(200).json({
      invoices,
      usageCount,
      limit,
      isSubscribed,
      currentMonth,
      currentYear,
    });
  } catch (error) {
    console.error("[AI Invoices API] Error:", error);
    res.status(500).json({ error: "Failed to fetch AI invoices" });
  }
}
