import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// Define type for GraphQL response
interface OrderDetailsResponse {
  Orders_by_pk: {
    id: string;
    OrderID: string;
    created_at: string;
    updated_at: string;
    status: string;
    service_fee: string;
    delivery_fee: string;
    shop: {
      name: string;
      address: string;
      latitude: string;
      longitude: string;
    } | null;
    address: {
      latitude: string;
      longitude: string;
      street: string;
      city: string;
    } | null;
    Order_Items: Array<{
      id: string;
      product_id: string;
      quantity: number;
      price: string;
      Product: {
        id: string;
        image: string;
        final_price: string;
        ProductName: {
          id: string;
          name: string;
          description: string;
          barcode: string;
          sku: string;
          image: string;
          create_at: string;
        } | null;
      } | null;
    }>;
    Order_Items_aggregate: {
      aggregate: {
        count: number;
      };
    };
    orderedBy: {
      created_at: string;
      email: string;
      gender: string;
      id: string;
      is_active: boolean;
      name: string;
      password_hash: string;
      phone: string;
      profile_picture: string;
      updated_at: string;
      role: string;
    } | null;
    Shoppers: {
      id: string;
      name: string;
      email: string;
      phone: string;
      profile_picture: string;
    } | null;
    shop_id: string;
    shopper_id: string | null;
    total: string;
    user_id: string;
    voucher_code: string | null;
  } | null;
}

// Define session type
interface UserSession {
  user?: {
    name?: string;
    email?: string;
  };
}

// Query to fetch regular order details by ID
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      OrderID
      created_at
      updated_at
      status
      service_fee
      delivery_fee
      shop: Shop {
        id
        name
        address
        image
        phone
        latitude
        longitude
        operating_hours
      }
      address: Address {
        id
        latitude
        longitude
        street
        city
        postal_code
        created_at
        updated_at
        user_id
        is_default
      }
      Order_Items {
        id
        product_id
        quantity
        price
        Product {
          id
          image
          final_price
          measurement_unit
          ProductName {
            id
            name
            description
            barcode
            sku
            image
            create_at
          }
        }
      }
      Order_Items_aggregate {
        aggregate {
          count
        }
      }
      orderedBy {
        created_at
        email
        gender
        id
        is_active
        name
        password_hash
        phone
        profile_picture
        updated_at
        role
      }
      Shoppers {
        id
        name
        email
        phone
        profile_picture
      }
      shop_id
      shopper_id
      total
      user_id
      voucher_code
    }
  }
`;

// Query to fetch reel order details by ID
const GET_REEL_ORDER_DETAILS = gql`
  query GetReelOrderDetails($orderId: uuid!) {
    reel_orders(where: { id: { _eq: $orderId } }) {
      id
      OrderID
      created_at
      updated_at
      status
      service_fee
      delivery_fee
      total
      quantity
      delivery_note
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
        restaurant_id
        user_id
        Restaurant {
          id
          name
          location
          lat
          long
          created_at
          email
          is_active
          phone
          profile
          relatedTo
          tin
          ussd
          verified
        }
        category
        created_on
        delivery_time
        isLiked
        is_active
        likes
        restaurant_id
        shop_id
        user_id
      }
      user: User {
        id
        name
        email
        phone
        profile_picture
      }
      Shoppers {
        id
        name
        email
        phone
        profile_picture
      }
      address: Address {
        latitude
        longitude
        street
        city
        postal_code
        created_at
        id
        updated_at
        user_id
      }
      assigned_at
      combined_order_id
      delivery_address_id
      delivery_photo_url
      delivery_time
      discount
      found
      reel_id
      shopper_id
      voucher_code
      user_id
    }
  }
`;

// Query to fetch restaurant order details by ID
const GET_RESTAURANT_ORDER_DETAILS = gql`
  query GetRestaurantOrderDetails($orderId: uuid!) {
    restaurant_orders(where: { id: { _eq: $orderId } }) {
      id
      OrderID
      created_at
      updated_at
      status
      delivery_fee
      total
      delivery_time
      delivery_notes
      discount
      found
      restaurant_id
      shopper_id
      user_id
      voucher_code
      assigned_at
      combined_order_id
      delivery_address_id
      delivery_photo_url
      Restaurant {
        id
        name
        location
        lat
        long
        phone
        logo
        email
        is_active
        tin
        ussd
        verified
        profile
        relatedTo
        created_at
      }
      orderedBy {
        id
        name
        phone
        email
        profile_picture
        gender
        password_hash
        updated_at
        created_at
        is_active
        role
      }
      address: Address {
        id
        street
        city
        postal_code
        latitude
        longitude
        created_at
        updated_at
        user_id
        is_default
      }
      restaurant_dishe_orders {
        id
        quantity
        price
        dish_id
        order_id
        created_at
        restaurant_dishes {
          id
          name
          description
          image
          price
          SKU
          category
          created_at
          discount
          ingredients
          is_active
          preparingTime
          promo
          promo_type
          quantity
          restaurant_id
          updated_at
        }
      }
      shopper {
        id
        name
        profile_picture
        email
        phone
        gender
        is_active
        password_hash
        role
        created_at
        updated_at
        orders: Orders_aggregate {
          aggregate {
            count
          }
        }
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle only GET requests
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Get orderId from query params
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Missing or invalid order ID" });
      return;
    }

    // Get user session for authentication
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as UserSession | null;

    if (!session || !session.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Fetch order details from Hasura
    if (!hasuraClient) {
      res.status(500).json({ error: "Failed to initialize Hasura client" });
      return;
    }

    let orderData: any = null;
    let orderType: "regular" | "reel" | "restaurant" = "regular";

    try {
      // First try to fetch as a regular order
      const regularOrderData = await hasuraClient.request<OrderDetailsResponse>(
        GET_ORDER_DETAILS,
        {
          orderId: id,
        }
      );

      if (regularOrderData.Orders_by_pk) {
        orderData = regularOrderData.Orders_by_pk;
        orderType = "regular";
      } else {
        // If regular order not found, try reel order
        try {
          const reelOrderData = await hasuraClient.request<any>(
            GET_REEL_ORDER_DETAILS,
            {
              orderId: id,
            }
          );

          if (
            reelOrderData.reel_orders &&
            reelOrderData.reel_orders.length > 0
          ) {
            orderData = reelOrderData.reel_orders[0];
            orderType = "reel";
          } else {
            // If reel order not found, try restaurant order
            try {
              const restaurantOrderData = await hasuraClient.request<any>(
                GET_RESTAURANT_ORDER_DETAILS,
                {
                  orderId: id,
                }
              );

              if (
                restaurantOrderData.restaurant_orders &&
                restaurantOrderData.restaurant_orders.length > 0
              ) {
                orderData = restaurantOrderData.restaurant_orders[0];
                orderType = "restaurant";
              }
            } catch (restaurantError) {
              console.error("❌ [API] Error fetching restaurant order:", {
                error: restaurantError,
                message:
                  restaurantError instanceof Error
                    ? restaurantError.message
                    : "Unknown error",
                orderId: id,
              });
            }
          }
        } catch (reelError) {
          console.error("❌ [API] Error fetching reel order:", {
            error: reelError,
            message:
              reelError instanceof Error ? reelError.message : "Unknown error",
            orderId: id,
          });
        }
      }
    } catch (error) {
      console.error("❌ [API] Error fetching regular order:", {
        error: error,
        message: error instanceof Error ? error.message : "Unknown error",
        orderId: id,
      });

      // If regular order query fails, try reel order
      try {
        const reelOrderData = await hasuraClient.request<any>(
          GET_REEL_ORDER_DETAILS,
          {
            orderId: id,
          }
        );

        if (reelOrderData.reel_orders && reelOrderData.reel_orders.length > 0) {
          orderData = reelOrderData.reel_orders[0];
          orderType = "reel";
        } else {
          // If reel order not found, try restaurant order
          try {
            const restaurantOrderData = await hasuraClient.request<any>(
              GET_RESTAURANT_ORDER_DETAILS,
              {
                orderId: id,
              }
            );

            if (
              restaurantOrderData.restaurant_orders &&
              restaurantOrderData.restaurant_orders.length > 0
            ) {
              orderData = restaurantOrderData.restaurant_orders[0];
              orderType = "restaurant";
            }
          } catch (restaurantError) {
            console.error(
              "❌ [API] Error fetching restaurant order on retry:",
              {
                error: restaurantError,
                message:
                  restaurantError instanceof Error
                    ? restaurantError.message
                    : "Unknown error",
                orderId: id,
              }
            );
          }
        }
      } catch (reelError) {
        console.error("❌ [API] Error fetching reel order on retry:", {
          error: reelError,
          message:
            reelError instanceof Error ? reelError.message : "Unknown error",
          orderId: id,
        });
      }
    }

    if (!orderData) {
      console.log("❌ [API] No order data found for ID:", { orderId: id });
      res.status(404).json({ error: "Order not found" });
      return;
    }

    // Format the order data for the frontend based on order type
    let formattedOrder: any;

    if (orderType === "regular") {
      // Handle regular orders

      const formattedOrderItems = orderData.Order_Items.map((item: any) => {
        const formattedItem = {
          id: item.id,
          name: item.Product?.ProductName?.name || "Unknown Product",
          quantity: item.quantity,
          price: parseFloat(item.price) || 0,
          measurement_unit: item.Product?.measurement_unit || null,
          barcode: item.Product?.ProductName?.barcode || null,
          sku: item.Product?.ProductName?.sku || null,
          productImage:
            item.Product?.ProductName?.image || item.Product?.image || null,
        };

        return formattedItem;
      });

      // Calculate totals
      const subTotal = formattedOrderItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      const serviceFee = parseFloat(orderData.service_fee || "0");
      const deliveryFee = parseFloat(orderData.delivery_fee || "0");
      const totalEarnings = serviceFee + deliveryFee;

      formattedOrder = {
        id: orderData.id,
        OrderID: orderData.OrderID || orderData.id, // Add OrderID field
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at,
        status: orderData.status,
        orderType: "regular",
        shopName: orderData.shop?.name || "Unknown Shop",
        shopAddress: orderData.shop?.address || "No Address",
        shopLatitude: orderData.shop?.latitude
          ? parseFloat(orderData.shop.latitude)
          : null,
        shopLongitude: orderData.shop?.longitude
          ? parseFloat(orderData.shop.longitude)
          : null,
        address: orderData.address, // Include raw address object
        customerAddress: orderData.address
          ? `${orderData.address.street || ""}, ${orderData.address.city || ""}`
          : "No Address",
        customerLatitude: orderData.address?.latitude
          ? parseFloat(orderData.address.latitude)
          : null,
        customerLongitude: orderData.address?.longitude
          ? parseFloat(orderData.address.longitude)
          : null,
        items: formattedOrderItems,
        itemCount: orderData.Order_Items_aggregate?.aggregate?.count || 0,
        subTotal,
        serviceFee,
        deliveryFee,
        total: subTotal + serviceFee + deliveryFee,
        estimatedEarnings: totalEarnings,
        orderedBy: orderData.orderedBy, // Include orderedBy data (actual customer)
        assignedTo: orderData.Shoppers, // Include assignedTo data (shopper)
        customerId: orderData.orderedBy?.id, // Customer is ALWAYS from orderedBy
        shop: orderData.shop, // Include shop data
      };
    } else if (orderType === "reel") {
      // Handle reel orders

      const serviceFee = parseFloat(orderData.service_fee || "0");
      const deliveryFee = parseFloat(orderData.delivery_fee || "0");
      const totalEarnings = serviceFee + deliveryFee;
      const reelPrice = parseFloat(orderData.Reel?.Price || "0");
      const quantity = parseInt(orderData.quantity || "1");
      const subTotal = reelPrice * quantity;

      formattedOrder = {
        id: orderData.id,
        OrderID: orderData.OrderID || orderData.id, // Add OrderID field
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at,
        status: orderData.status,
        orderType: "reel",
        shopName: orderData.Reel?.Restaurant?.name || "Reel Order",
        shopAddress:
          orderData.Reel?.Restaurant?.location || "From Reel Creator",
        shopLatitude: orderData.Reel?.Restaurant?.lat || null,
        shopLongitude: orderData.Reel?.Restaurant?.long || null,
        address: orderData.address, // Include raw address object
        customerAddress: orderData.address
          ? `${orderData.address.street || ""}, ${orderData.address.city || ""}`
          : "No Address",
        customerLatitude: orderData.address?.latitude
          ? parseFloat(orderData.address.latitude)
          : null,
        customerLongitude: orderData.address?.longitude
          ? parseFloat(orderData.address.longitude)
          : null,
        items: [
          {
            id: orderData.Reel?.id || orderData.id,
            name: orderData.Reel?.Product || "Reel Product",
            quantity: quantity,
            price: reelPrice,
          },
        ],
        itemCount: 1,
        subTotal,
        serviceFee,
        deliveryFee,
        total: parseFloat(orderData.total || "0"),
        estimatedEarnings: totalEarnings,
        reel: {
          ...orderData.Reel,
          restaurant_id: orderData.Reel?.restaurant_id,
          user_id: orderData.Reel?.user_id,
        },
        quantity: quantity,
        deliveryNote: orderData.delivery_note,
        deliveryNotes: orderData.delivery_note, // Add deliveryNotes for compatibility
        customerName: orderData.user?.name,
        customerPhone: orderData.user?.phone,
        user: orderData.user, // Include full user data
        orderedBy: orderData.user, // Add orderedBy for compatibility
        assignedTo: orderData.Shoppers, // Include assignedTo data (shopper)
        customerId: orderData.user?.id, // Add customerId for compatibility
        discount: orderData.discount || 0, // Add discount field
        deliveryPhotoUrl: orderData.delivery_photo_url, // Add delivery photo URL
      };
    } else if (orderType === "restaurant") {
      // Handle restaurant orders

      const deliveryFee = parseFloat(orderData.delivery_fee || "0");
      const totalEarnings = deliveryFee; // Restaurant orders don't have service fee

      // Format dish items
      const formattedDishItems = orderData.restaurant_dishe_orders.map(
        (dishOrder: any) => ({
          id: dishOrder.id,
          name: dishOrder.restaurant_dishes?.name || "Unknown Dish",
          quantity: dishOrder.quantity,
          price: parseFloat(dishOrder.price) || 0,
          description: dishOrder.restaurant_dishes?.description || null,
          image: dishOrder.restaurant_dishes?.image || null,
          category: dishOrder.restaurant_dishes?.category || null,
          ingredients: dishOrder.restaurant_dishes?.ingredients || null,
          preparingTime: dishOrder.restaurant_dishes?.preparingTime || null,
        })
      );

      // Calculate subtotal from dish orders
      const subTotal = formattedDishItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      formattedOrder = {
        id: orderData.id,
        OrderID: orderData.OrderID || orderData.id,
        createdAt: orderData.created_at,
        updatedAt: orderData.updated_at,
        status: orderData.status,
        orderType: "restaurant",
        shopName: orderData.Restaurant?.name || "Unknown Restaurant",
        shopAddress: orderData.Restaurant?.location || "No Address",
        shopLatitude: orderData.Restaurant?.lat
          ? parseFloat(orderData.Restaurant.lat)
          : null,
        shopLongitude: orderData.Restaurant?.long
          ? parseFloat(orderData.Restaurant.long)
          : null,
        address: orderData.address,
        customerAddress: orderData.address
          ? `${orderData.address.street || ""}, ${orderData.address.city || ""}`
          : "No Address",
        customerLatitude: orderData.address?.latitude
          ? parseFloat(orderData.address.latitude)
          : null,
        customerLongitude: orderData.address?.longitude
          ? parseFloat(orderData.address.longitude)
          : null,
        items: formattedDishItems,
        itemCount: formattedDishItems.length,
        subTotal,
        serviceFee: 0, // Restaurant orders don't have service fee
        deliveryFee,
        total: parseFloat(orderData.total || "0"),
        estimatedEarnings: totalEarnings,
        restaurant: orderData.Restaurant,
        deliveryNote: orderData.delivery_notes,
        deliveryNotes: orderData.delivery_notes,
        customerName: orderData.orderedBy?.name,
        customerPhone: orderData.orderedBy?.phone,
        user: orderData.orderedBy,
        orderedBy: orderData.orderedBy,
        assignedTo: orderData.shopper,
        customerId: orderData.orderedBy?.id,
        discount: orderData.discount || 0,
        deliveryPhotoUrl: orderData.delivery_photo_url,
        deliveryTime: orderData.delivery_time,
      };
    }

    res.status(200).json({
      success: true,
      order: formattedOrder,
    });
  } catch (error) {
    console.error("❌ [API] Error fetching order details:", {
      error: error,
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      orderId: req.query.id,
    });
    res.status(500).json({ error: "Failed to fetch order details" });
  }
}
