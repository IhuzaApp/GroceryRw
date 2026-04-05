import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const INSERT_USAGE_MUTATION = gql`
  mutation InsertAIUsage(
    $user_id: uuid!
    $month: String!
    $year: String!
    $count: Int!
  ) {
    insert_ai_usage(
      objects: {
        user_id: $user_id
        month: $month
        year: $year
        requests_sent: $count
        request_count: 20
        shop_id: null
        business_id: null
        restaurant_id: null
      }
    ) {
      affected_rows
    }
  }
`;

const UPDATE_USAGE_MUTATION = gql`
  mutation UpdateAIUsage(
    $user_id: uuid!
    $month: String!
    $year: String!
    $count: Int!
  ) {
    update_ai_usage(
      where: { user_id: { _eq: $user_id } }
      _set: { requests_sent: $count, month: $month, year: $year }
    ) {
      affected_rows
    }
  }
`;

const GET_CURRENT_COUNT = gql`
  query GetCount($user_id: uuid!) {
    ai_usage(where: { user_id: { _eq: $user_id } }) {
      id
      month
      year
      request_count
      requests_sent
      subscription_invoices(where: { status: { _eq: "paid" } }) {
        id
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

  const now = new Date();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear().toString();

  try {
    if (!hasuraClient) throw new Error("Hasura client not initialized");

    // Get current usage by user_id
    const data: any = await hasuraClient.request(GET_CURRENT_COUNT, {
      user_id: session.user.id,
    });

    // Logic for month rollover or same-month increment
    const currentUsage = data.ai_usage[0];
    const isSameMonth =
      currentUsage &&
      currentUsage.month === month &&
      currentUsage.year === year;
    const currentCount = isSameMonth ? currentUsage.requests_sent || 0 : 0;

    const isSubscribed = currentUsage?.subscription_invoices?.length > 0;
    const explicitLimit = currentUsage?.request_count;
    const limit =
      explicitLimit !== undefined && explicitLimit !== null
        ? explicitLimit
        : isSubscribed
        ? 100
        : 20;

    // Secure backend limit check
    if (limit !== -1 && currentCount >= limit) {
      return res
        .status(403)
        .json({ error: "Usage limit reached", isBlocked: true });
    }

    const newCount = currentCount + 1;

    if (currentUsage) {
      // Update existing
      await hasuraClient.request(UPDATE_USAGE_MUTATION, {
        user_id: session.user.id,
        month,
        year,
        count: newCount,
      });
      res.status(200).json({ success: true, newCount });
    } else {
      // Insert new
      const newCount = 1;
      await hasuraClient.request(INSERT_USAGE_MUTATION, {
        user_id: session.user.id,
        month,
        year,
        count: newCount,
      });
      res.status(200).json({ success: true, newCount });
    }
  } catch (error) {
    console.error("[AI Increment API] Error:", error);
    res.status(500).json({ error: "Failed to increment usage" });
  }
}
