import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { gql } from "graphql-request";
import { hasuraClient } from "../../../src/lib/hasuraClient";

// GraphQL query to get regular order details for invoice
const GET_ORDER_DETAILS_FOR_INVOICE = gql`
  query GetOrderDetailsForInvoice($order_id: uuid!) {
    Orders_by_pk(id: $order_id) {
      id
      OrderID
      status
      total
      service_fee
      delivery_fee
      created_at
      updated_at
      orderedBy {
        id
        name
        email
      }
      Shop {
        name
        address
        image
      }
      Order_Items {
        id
        price
        quantity
        Product {
          ProductName {
            name
          }
          price
          measurement_unit
        }
      }
      shopper_id
    }
  }
`;

// GraphQL query to get reel order details for invoice
const GET_REEL_ORDER_DETAILS_FOR_INVOICE = gql`
  query GetReelOrderDetailsForInvoice($order_id: uuid!) {
    reel_orders_by_pk(id: $order_id) {
      id
      OrderID
      status
      total
      service_fee
      delivery_fee
      created_at
      updated_at
      User {
        id
        name
        email
      }
      Reel {
        id
        title
        description
        Price
        Product
        type
        video_url
        Restaurant {
          id
          name
          location
        }
      }
      shopper_id
    }
  }
`;

// GraphQL query to get restaurant order details for invoice
const GET_RESTAURANT_ORDER_DETAILS_FOR_INVOICE = gql`
  query GetRestaurantOrderDetailsForInvoice($order_id: uuid!) {
    restaurant_orders_by_pk(id: $order_id) {
      id
      OrderID
      status
      total
      delivery_fee
      created_at
      updated_at
      User {
        id
        name
        email
      }
      Restaurant {
        id
        name
        location
        phone
        logo
      }
      restaurant_dishe_orders {
        id
        quantity
        price
        restaurant_dishes {
          id
          name
          description
          image
          price
        }
      }
      shopper_id
    }
  }
`;

// GraphQL mutation to insert invoice data into the Invoices table
const ADD_INVOICE = gql`
  mutation addInvoiceDetails(
    $customer_id: uuid = ""
    $delivery_fee: String = ""
    $discount: String = ""
    $invoice_items: jsonb = ""
    $invoice_number: String = ""
    $order_id: uuid = ""
    $service_fee: String = ""
    $status: String = ""
    $subtotal: String = ""
    $tax: String = ""
    $total_amount: String = ""
    $reel_order_id: uuid = ""
  ) {
    insert_Invoices(
      objects: {
        customer_id: $customer_id
        delivery_fee: $delivery_fee
        discount: $discount
        invoice_items: $invoice_items
        invoice_number: $invoice_number
        order_id: $order_id
        service_fee: $service_fee
        status: $status
        subtotal: $subtotal
        tax: $tax
        total_amount: $total_amount
        reel_order_id: $reel_order_id
      }
    ) {
      returning {
        id
        invoice_number
      }
      affected_rows
    }
  }
`;

// Type definition for regular order details
interface OrderDetails {
  Orders_by_pk: {
    id: string;
    OrderID: string;
    status: string;
    total: number;
    service_fee: string;
    delivery_fee: string;
    created_at: string;
    updated_at: string;
    orderedBy: {
      id: string;
      name: string;
      email: string;
    };
    Shop: {
      name: string;
      address: string;
      image?: string;
    };
    Order_Items: Array<{
      id: string;
      price: string;
      quantity: number;
      Product: {
        name: string;
        price: number;
        measurement_unit?: string;
      };
    }>;
    shopper_id: string;
  } | null;
}

// Type definition for reel order details
interface ReelOrderDetails {
  reel_orders_by_pk: {
    id: string;
    OrderID: string;
    status: string;
    total: number;
    service_fee: string;
    delivery_fee: string;
    created_at: string;
    updated_at: string;
    User: {
      id: string;
      name: string;
      email: string;
    };
    Reel: {
      id: string;
      title: string;
      description: string;
      Price: string;
      Product: string;
      type: string;
      video_url: string;
      Restaurant: {
        id: string;
        name: string;
        location: string;
      };
    };
    shopper_id: string;
  } | null;
}

// Type definition for restaurant order details
interface RestaurantOrderDetails {
  restaurant_orders_by_pk: {
    id: string;
    OrderID: string;
    status: string;
    total: number;
    delivery_fee: string;
    created_at: string;
    updated_at: string;
    User: {
      id: string;
      name: string;
      email: string;
    };
    Restaurant: {
      id: string;
      name: string;
      location: string;
      phone?: string;
      logo?: string;
    };
    restaurant_dishe_orders: Array<{
      id: string;
      quantity: number;
      price: string;
      restaurant_dishes: {
        id: string;
        name: string;
        description: string;
        image?: string;
        price: string;
      };
    }>;
    shopper_id: string;
  } | null;
}

// GraphQL mutation return type
interface AddInvoiceResult {
  insert_Invoices: {
    returning: Array<{
      id: string;
      invoice_number: string;
    }>;
    affected_rows: number;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { orderId, orderType = "regular" } = req.body;

    // Validate required fields
    if (!orderId) {
      return res.status(400).json({ error: "Missing required field: orderId" });
    }

    // Check if hasuraClient is available (it should be on server side)
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    const isReelOrder = orderType === "reel";
    const isRestaurantOrder = orderType === "restaurant";

    // Get order details for invoice based on order type
    let orderDetails: any;
    try {
      if (isReelOrder) {
        orderDetails = await hasuraClient.request<ReelOrderDetails>(
          GET_REEL_ORDER_DETAILS_FOR_INVOICE,
          {
            order_id: orderId,
          }
        );
      } else if (isRestaurantOrder) {
        orderDetails = await hasuraClient.request<RestaurantOrderDetails>(
          GET_RESTAURANT_ORDER_DETAILS_FOR_INVOICE,
          {
            order_id: orderId,
          }
        );
      } else {
        orderDetails = await hasuraClient.request<OrderDetails>(
          GET_ORDER_DETAILS_FOR_INVOICE,
          {
            order_id: orderId,
          }
        );
      }
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch order details" });
    }

    const order = isReelOrder
      ? orderDetails.reel_orders_by_pk
      : isRestaurantOrder
      ? orderDetails.restaurant_orders_by_pk
      : orderDetails.Orders_by_pk;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify the user is authorized to access this order (either as customer or shopper)
    const isShopper = order.shopper_id === session.user.id;
    const isCustomer = isReelOrder
      ? order.User.id === session.user.id
      : isRestaurantOrder
      ? order.User.id === session.user.id
      : order.orderedBy.id === session.user.id;

    if (!isShopper && !isCustomer) {
      return res
        .status(403)
        .json({ error: "Not authorized to access this order" });
    }

    // Calculate totals based on order type
    let itemsTotal: number;
    let invoiceItems: any[];
    let shopName: string;
    let shopAddress: string;

    if (isReelOrder) {
      // For reel orders, use the reel price and product info
      const reel = order.Reel;

      itemsTotal = parseFloat(reel.Price);
      shopName = reel.Restaurant?.name || "Reel Order";
      shopAddress = reel.Restaurant?.location || "From Reel Creator";

      // Create invoice items for reel orders
      invoiceItems = [
        {
          id: reel.id,
          name: reel.Product,
          quantity: 1,
          unit_price: parseFloat(reel.Price),
          total: parseFloat(reel.Price),
          unit: "item",
          description: reel.description,
          type: reel.type,
        },
      ];
    } else if (isRestaurantOrder) {
      // For restaurant orders, use the dish orders
      const dishOrders = order.restaurant_dishe_orders;

      itemsTotal = dishOrders.reduce((total: number, dishOrder: any) => {
        return total + parseFloat(dishOrder.price) * dishOrder.quantity;
      }, 0);

      shopName = order.Restaurant.name;
      shopAddress = order.Restaurant.location;

      // Create invoice items for restaurant orders
      invoiceItems = dishOrders.map((dishOrder: any) => ({
        id: dishOrder.id,
        name: dishOrder.restaurant_dishes.name,
        quantity: dishOrder.quantity,
        unit_price: parseFloat(dishOrder.price),
        total: parseFloat(dishOrder.price) * dishOrder.quantity,
        unit: "dish",
        description: dishOrder.restaurant_dishes.description,
      }));
    } else {
      // For regular orders, use the order items
      const items = order.Order_Items;

      itemsTotal = items.reduce((total: number, item: any) => {
        return total + parseFloat(item.price) * item.quantity;
      }, 0);

      shopName = order.Shop.name;
      shopAddress = order.Shop.address;

      // Create invoice items for regular orders
      invoiceItems = items.map((item: any) => ({
        id: item.id,
        name: item.Product.ProductName?.name || "Unknown Product",
        quantity: item.quantity,
        unit_price: parseFloat(item.price),
        total: parseFloat(item.price) * item.quantity,
        unit: item.Product.measurement_unit || "item",
      }));
    }

    const serviceFee = isRestaurantOrder
      ? 0
      : parseFloat(order.service_fee || "0");
    const deliveryFee = parseFloat(order.delivery_fee);

    // Create a unique invoice number
    const invoiceNumber = `INV-${
      order.OrderID || order.id.slice(-8)
    }-${new Date().getTime().toString().slice(-6)}`;

    // Format values for database storage
    const subtotalStr = itemsTotal.toFixed(2);
    const serviceFeeStr = serviceFee.toFixed(2);
    const deliveryFeeStr = deliveryFee.toFixed(2);
    const discountStr = "0.00"; // Assuming no discount for now
    const taxStr = "0.00"; // Assuming no tax for now
    const totalAmount = (itemsTotal + serviceFee + deliveryFee).toFixed(2);

    // Save invoice data to the database
    let saveResult;
    try {
      saveResult = await hasuraClient.request<AddInvoiceResult>(ADD_INVOICE, {
        customer_id: isReelOrder
          ? order.User.id
          : isRestaurantOrder
          ? order.User.id
          : order.orderedBy.id,
        delivery_fee: deliveryFeeStr,
        discount: discountStr,
        invoice_items: invoiceItems,
        invoice_number: invoiceNumber,
        order_id: isReelOrder || isRestaurantOrder ? null : order.id,
        reel_order_id: isReelOrder ? order.id : null,
        service_fee: serviceFeeStr,
        status: "completed",
        subtotal: subtotalStr,
        tax: taxStr,
        total_amount: totalAmount,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Failed to save invoice to database" });
    }

    // Generate invoice data for the response
    const invoiceData = {
      id: saveResult.insert_Invoices.returning[0]?.id || `inv_${Date.now()}`,
      invoiceNumber: invoiceNumber,
      orderId: order.id,
      orderNumber: order.OrderID || order.id.slice(-8),
      customer: isReelOrder
        ? order.User.name
        : isRestaurantOrder
        ? order.User.name
        : order.orderedBy.name,
      customerEmail: isReelOrder
        ? order.User.email
        : isRestaurantOrder
        ? order.User.email
        : order.orderedBy.email,
      shop: shopName,
      shopAddress: shopAddress,
      dateCreated: new Date(order.created_at).toLocaleString(),
      dateCompleted: new Date(order.updated_at).toLocaleString(),
      status: order.status,
      items: invoiceItems,
      subtotal: itemsTotal,
      serviceFee,
      deliveryFee,
      // When in shopping mode, the displayed total should match the subtotal without fees
      // For other modes, include the fees
      total:
        order.status === "shopping"
          ? itemsTotal
          : itemsTotal + serviceFee + deliveryFee,
      orderType: isReelOrder
        ? "reel"
        : isRestaurantOrder
        ? "restaurant"
        : "regular",
      isReelOrder,
      isRestaurantOrder,
    };

    return res.status(200).json({
      success: true,
      invoice: invoiceData,
      dbRecord: saveResult.insert_Invoices.returning[0] || null,
    });
  } catch (error) {
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
