import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const GET_USAGE_QUERY = gql`
  query GetAIUsage(
    $user_id: uuid!
    $month: String!
    $year: String!
    $p256dh: String!
  ) {
    ai_usage(
      where: {
        user_id: { _eq: $user_id }
        month: { _eq: $month }
        year: { _eq: $year }
      }
    ) {
      id
      request_count
      requests_sent
      subscription_invoices(where: { status: { _eq: "paid" } }) {
        id
        status
      }
    }
    # Check if this device has used its trial on ANY account
    push_subscriptions(where: { p256dh: { _eq: $p256dh } }) {
      user_id
      User {
        ai_usages(where: { month: { _eq: $month }, year: { _eq: $year } }) {
          request_count
          requests_sent
        }
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

  const { p256dh } = req.body;
  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear().toString();

  try {
    if (!hasuraClient) throw new Error("Hasura client not initialized");

    const data: any = await hasuraClient.request(GET_USAGE_QUERY, {
      user_id: session.user.id,
      month,
      year,
      p256dh: p256dh || "",
    });

    const usage = data.ai_usage[0];
    const isSubscribed = usage?.subscription_invoices?.length > 0;

    const userRequestsSent = usage?.requests_sent || 0;
    const explicitLimit = usage?.request_count;

    // Device-level check: Calculate total requests sent from this device across all users this month
    let deviceRequestsSent = 0;
    if (p256dh) {
      const deviceUsages = data.push_subscriptions.flatMap(
        (p: any) => p.User?.ai_usages || []
      );
      deviceRequestsSent = deviceUsages.reduce(
        (acc: number, u: any) => acc + (u.requests_sent || 0),
        0
      );
    }

    const currentCount = Math.max(userRequestsSent, deviceRequestsSent);

    // If not set, default limit is 100 for subscribed, 20 for non-subscribed
    const limit =
      explicitLimit !== undefined && explicitLimit !== null
        ? explicitLimit
        : isSubscribed
        ? 100
        : 20;

    const isBlocked = limit === -1 ? false : currentCount >= limit;

    res.status(200).json({
      usageCount: currentCount,
      limit,
      isSubscribed,
      isBlocked,
    });
  } catch (error) {
    console.error("[AI Usage API] Error:", error);
    res.status(500).json({ error: "Failed to fetch usage status" });
  }
}
