import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_RESTAURANT_DISHES = gql`
  query GetRestaurantDishes($restaurant_id: uuid!) {
    restaurant_dishes(
      where: { restaurant_id: { _eq: $restaurant_id } }
      order_by: { name: asc }
    ) {
      id
      name
      description
      price
      image
      ingredients
      discount
      quantity
      restaurant_id
      is_active
      category
      SKU
      created_at
      updated_at
      promo
      promo_type
      preparingTime
    }
  }
`;

const GET_ALL_RESTAURANT_DISHES = gql`
  query GetAllRestaurantDishes {
    restaurant_dishes(order_by: { name: asc }) {
      id
      name
      description
      price
      image
      ingredients
      discount
      quantity
      restaurant_id
      is_active
      category
      SKU
      created_at
      updated_at
      promo
      promo_type
      preparingTime
    }
  }
`;

interface RestaurantDishesResponse {
  restaurant_dishes: Array<{
    id: string;
    name: string;
    description: string;
    price: string;
    image?: string;
    ingredients?: string | any; // jsonb can be string or object
    discount?: string;
    quantity: number;
    restaurant_id: string;
    is_active: boolean;
    category?: string;
    SKU?: string;
    created_at: string;
    updated_at: string;
    promo?: string;
    promo_type?: string;
    preparingTime?: string; // Preparation time as string from database (e.g., "15min", "1hr", "")
  }>;
}

// Helper function to validate UUID format
const isValidUUID = (uuid: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const { restaurant_id } = req.query;

    let data: RestaurantDishesResponse;

    if (
      restaurant_id &&
      restaurant_id !== "undefined" &&
      isValidUUID(restaurant_id as string)
    ) {
      // Fetch dishes for a specific restaurant
      data = await hasuraClient.request<RestaurantDishesResponse>(
        GET_RESTAURANT_DISHES,
        { restaurant_id }
      );
    } else {
      // If restaurant_id is invalid, log the issue and return empty dishes
      if (restaurant_id && restaurant_id !== "undefined") {
        console.warn(
          `Invalid restaurant_id provided: ${restaurant_id}. Expected valid UUID format.`
        );
      }

      // Fetch all dishes if no valid restaurant_id provided
      data = await hasuraClient.request<RestaurantDishesResponse>(
        GET_ALL_RESTAURANT_DISHES
      );
    }

    res.status(200).json({ dishes: data.restaurant_dishes });
  } catch (error) {
    console.error("Error fetching restaurant dishes:", error);
    res.status(500).json({ error: "Failed to fetch restaurant dishes" });
  }
}
