import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

const INSERT_USAGE_MUTATION = gql`
  mutation InsertAIUsage($user_id: uuid!, $month: String!, $year: String!, $count: Int!) {
    insert_ai_usage(
      objects: {
        user_id: $user_id,
        month: $month,
        year: $year,
        request_count: $count,
        shop_id: null,
        business_id: null,
        restaurant_id: null
      }
    ) {
      affected_rows
    }
  }
`;

const UPDATE_USAGE_MUTATION = gql`
  mutation UpdateAIUsage($user_id: uuid!, $month: String!, $year: String!, $count: Int!) {
    update_ai_usage(
      where: { user_id: { _eq: $user_id }, month: { _eq: $month }, year: { _eq: $year } },
      _set: { request_count: $count }
    ) {
      affected_rows
    }
  }
`;

const GET_CURRENT_COUNT = gql`
  query GetCount($user_id: uuid!, $month: String!, $year: String!) {
    ai_usage(where: { user_id: { _eq: $user_id }, month: { _eq: $month }, year: { _eq: $year } }) {
      id
      request_count
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });

  const now = new Date();
  const month = (now.getMonth() + 1).toString();
  const year = now.getFullYear().toString();

  try {
    if (!hasuraClient) throw new Error("Hasura client not initialized");

    // Get current count first
    const data: any = await hasuraClient.request(GET_CURRENT_COUNT, {
      user_id: session.user.id,
      month,
      year
    });

    const currentUsage = data.ai_usage[0];
    const currentCount = currentUsage?.request_count || 0;
    const newCount = currentCount + 1;
    
    if (currentUsage) {
      // Update existing
      await hasuraClient.request(UPDATE_USAGE_MUTATION, {
        user_id: session.user.id,
        month,
        year,
        count: newCount
      });
    } else {
      // Insert new
      await hasuraClient.request(INSERT_USAGE_MUTATION, {
        user_id: session.user.id,
        month,
        year,
        count: newCount
      });
    }

    res.status(200).json({ success: true, newCount });
  } catch (error) {
    console.error("[AI Increment API] Error:", error);
    res.status(500).json({ error: "Failed to increment usage" });
  }
}
