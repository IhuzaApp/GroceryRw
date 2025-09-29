import { GraphQLClient } from "graphql-request";
import { NextApiRequest, NextApiResponse } from "next";

const client = new GraphQLClient(process.env.HASURA_GRAPHQL_ENDPOINT!, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  },
});

// Mutation to create a restaurant order
const CREATE_RESTAURANT_ORDER = `
  mutation CreateRestaurantOrder(
    $restaurant_id: uuid!,
    $user_id: uuid!,
    $delivery_address_id: uuid!,
    $total: String!,
    $delivery_fee: String!,
    $service_fee: String!,
    $discount: String,
    $voucher_code: String,
    $delivery_time: timestamptz!,
    $delivery_notes: String,
    $status: String = "pending"
  ) {
    insert_restaurant_orders(
      objects: {
        restaurant_id: $restaurant_id,
        user_id: $user_id,
        delivery_address_id: $delivery_address_id,
        total: $total,
        delivery_fee: $delivery_fee,
        service_fee: $service_fee,
        discount: $discount,
        voucher_code: $voucher_code,
        delivery_time: $delivery_time,
        delivery_notes: $delivery_notes,
        status: $status,
        found: false
      }
    ) {
      returning {
        id
        order_number
        total
        status
        created_at
        delivery_time
      }
    }
  }
`;

// Mutation to add dishes to a restaurant order
const ADD_DISHES_TO_ORDER = `
  mutation AddDishesToOrder(
    $order_id: uuid!,
    $dish_id: uuid!,
    $quantity: Int!,
    $price: String!,
    $discount: String
  ) {
    insert_restaurant_dish_orders(
      objects: {
        order_id: $order_id,
        dish_id: $dish_id,
        quantity: $quantity,
        price: $price,
        discount: $discount
      }
    ) {
      affected_rows
      returning {
        id
        dish_id
        quantity
        price
        discount
      }
    }
  }
`;

// Mutation to get restaurant order by ID
const GET_RESTAURANT_ORDER = `
  query GetRestaurantOrder($order_id: uuid!) {
    restaurant_orders(where: { id: { _eq: $order_id } }) {
      id
      order_number
      restaurant_id
      user_id
      delivery_address_id
      total
      delivery_fee
      service_fee
      discount
      voucher_code
      delivery_time
      delivery_notes
      status
      found
      created_at
      updated_at
      restaurant {
        id
        name
        logo
        latitude
        longitude
      }
      user {
        id
        first_name
        last_name
        phone
        email
      }
      delivery_address {
        id
        street
        city
        postal_code
        latitude
        longitude
        altitude
      }
      restaurant_dish_orders {
        id
        dish_id
        quantity
        price
        discount
        restaurant_dish {
          id
          name
          description
          ingredients
          preparingTime
        }
      }
    }
  }
`;

interface RestaurantOrderInput {
  restaurant_id: string;
  user_id: string;
  delivery_address_id: string;
  total: string;
  delivery_fee: string;
  service_fee: string;
  discount?: string;
  voucher_code?: string;
  delivery_time: string;
  delivery_notes?: string;
  items: {
    dish_id: string;
    quantity: number;
    price: string;
    discount?: string;
  }[];
}

interface CreateRestaurantOrderResponse {
  insert_restaurant_orders: {
    returning: {
      id: string;
      order_number: string;
      total: string;
      status: string;
      created_at: string;
      delivery_time: string;
    }[];
  };
}

interface AddDishesResponse {
  insert_restaurant_dish_orders: {
    affected_rows: number;
    returning: {
      id: string;
      dish_id: string;
      quantity: number;
      price: string;
      discount?: string;
    }[];
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      restaurant_id,
      user_id,
      delivery_address_id,
      total,
      delivery_fee,
      service_fee,
      discount,
      voucher_code,
      delivery_time,
      delivery_notes,
      items,
    }: RestaurantOrderInput = req.body;

    // Validate required fields
    if (
      !restaurant_id ||
      !user_id ||
      !delivery_address_id ||
      !total ||
      !delivery_fee ||
      !delivery_time ||
      !items?.length
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        required: [
          "restaurant_id",
          "user_id",
          "delivery_address_id",
          "total",
          "delivery_fee",
          "delivery_time",
          "items",
        ],
      });
    }

    // Step 1: Create the restaurant order
    const orderResponse = await client.request<CreateRestaurantOrderResponse>(
      CREATE_RESTAURANT_ORDER,
      {
        restaurant_id,
        user_id,
        delivery_address_id,
        total,
        delivery_fee,
        service_fee: service_fee || "0",
        discount: discount || null,
        voucher_code: voucher_code || null,
        delivery_time,
        delivery_notes: delivery_notes || null,
      }
    );

    if (!orderResponse.insert_restaurant_orders.returning.length) {
      return res
        .status(500)
        .json({ error: "Failed to create restaurant order" });
    }

    const createdOrder = orderResponse.insert_restaurant_orders.returning[0];
    const orderId = createdOrder.id;

    // Step 2: Add dishes to the order
    const dishPromises = items.map((item) =>
      client.request<AddDishesResponse>(ADD_DISHES_TO_ORDER, {
        order_id: orderId,
        dish_id: item.dish_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || null,
      })
    );

    const dishResults = await Promise.all(dishPromises);

    // Check if all dishes were added successfully
    const totalDishesAdded = dishResults.reduce(
      (sum, result) => sum + result.insert_restaurant_dish_orders.affected_rows,
      0
    );

    if (totalDishesAdded !== items.length) {
      console.error("Not all dishes were added to the order");
    }

    // Step 3: Fetch the complete order details
    const orderDetails = await client.request(GET_RESTAURANT_ORDER, {
      order_id: orderId,
    });

    return res.status(200).json({
      success: true,
      order_id: orderId,
      order_number: createdOrder.order_number,
      total: createdOrder.total,
      status: createdOrder.status,
      delivery_time: createdOrder.delivery_time,
      dishes_added: totalDishesAdded,
      order_details: orderDetails.restaurant_orders[0],
    });
  } catch (error) {
    console.error("Error creating restaurant order:", error);
    return res.status(500).json({
      error: "Failed to create restaurant order",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Export the mutations for use in other files
export { CREATE_RESTAURANT_ORDER, ADD_DISHES_TO_ORDER, GET_RESTAURANT_ORDER };
