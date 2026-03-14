import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const ADD_SUBSCRIPTION_TRANSACTION = gql`
  mutation addSubscriptionTransactions(
    $amount: String = "", 
    $currency: String = "", 
    $mtn_response: String = "", 
    $phone: String = "", 
    $reference_id: String = "", 
    $status: String = "", 
    $subscription_id: uuid = "", 
    $type: String = ""
  ) {
    insert_subscription_transactions(objects: {
      amount: $amount, 
      currency: $currency, 
      mtn_response: $mtn_response, 
      phone: $phone, 
      reference_id: $reference_id, 
      status: $status, 
      subscription_id: $subscription_id, 
      type: $type
    }) {
      affected_rows
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

  const {
    amount,
    currency,
    mtn_response,
    phone,
    reference_id,
    status,
    subscription_id,
    type,
  } = req.body;

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client not initialized");
    }

    const data = await hasuraClient.request(ADD_SUBSCRIPTION_TRANSACTION, {
      amount,
      currency,
      mtn_response,
      phone,
      reference_id,
      status,
      subscription_id,
      type,
    });

    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Error adding subscription transaction:", error);
    return res.status(500).json({ error: error.message });
  }
}
