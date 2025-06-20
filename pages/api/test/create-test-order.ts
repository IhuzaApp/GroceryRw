import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

interface Shop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface ShopsResponse {
  Shops: Shop[];
}

interface CreateOrderResponse {
  insert_Orders_one: {
    id: string;
    created_at: string;
  };
}

const CREATE_TEST_ORDER = gql`
  mutation CreateTestOrder(
    $shop_id: uuid!
    $user_id: uuid!
    $total_amount: numeric!
    $status: String!
  ) {
    insert_Orders_one(
      object: {
        shop_id: $shop_id
        user_id: $user_id
        total_amount: $total_amount
        status: $status
      }
    ) {
      id
      created_at
    }
  }
`;

// Get a random shop near the test location
const GET_NEARBY_SHOP = gql`
  query GetNearbyShop {
    Shops(limit: 1) {
      id
      name
      latitude
      longitude
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
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get a random shop
    const { Shops } = await hasuraClient.request<ShopsResponse>(
      GET_NEARBY_SHOP
    );
    if (!Shops?.length) {
      return res.status(404).json({ error: "No shops found" });
    }

    // Create a test order
    const testOrder = await hasuraClient.request<CreateOrderResponse>(
      CREATE_TEST_ORDER,
      {
        shop_id: Shops[0].id,
        user_id: "00000000-0000-0000-0000-000000000000", // Test user ID
        total_amount: Math.floor(Math.random() * 100) + 10, // Random amount between 10 and 110
        status: "PENDING",
      }
    );

    return res.status(200).json({
      success: true,
      order: testOrder.insert_Orders_one,
    });
  } catch (error) {
    console.error("Error creating test order:", error);
    return res.status(500).json({
      error: "Failed to create test order",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
