import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { RevenueCalculator } from "../../../src/lib/revenueCalculator";

// GraphQL query to get order details for plasa fee calculation
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      total
      service_fee
      delivery_fee
      shopper_id
      shop_id
    }
  }
`;

// GraphQL query to get shopper ID from user ID
const GET_SHOPPER_ID = gql`
  query GetShopperId($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id } }) {
      id
    }
  }
`;

// GraphQL query to get system configuration for plasa fee calculation
const GET_SYSTEM_CONFIG = gql`
  query GetSystemConfig {
    System_configuratioins {
      deliveryCommissionPercentage
    }
  }
`;

// Check if plasa fee revenue already exists for this order
const CHECK_EXISTING_PLASA_FEE_REVENUE = gql`
  query CheckExistingPlasaFeeRevenue($order_id: uuid!) {
    Revenue(where: { order_id: { _eq: $order_id }, type: { _eq: "plasa_fee" } }) {
      id
      type
    }
  }
`;

// Create plasa fee revenue record
const CREATE_PLASA_FEE_REVENUE = gql`
  mutation CreatePlasaFeeRevenue(
    $shopper_id: uuid
    $order_id: uuid
    $shop_id: uuid!
    $amount: String!
    $commission_percentage: String!
  ) {
    insert_Revenue(
      objects: {
        type: "plasa_fee"
        shopper_id: $shopper_id
        products: null
        order_id: $order_id
        shop_id: $shop_id
        amount: $amount
        commission_percentage: $commission_percentage
      }
    ) {
      affected_rows
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Authenticate user
  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "Missing orderId" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Check if plasa fee revenue already exists for this order
    const existingRevenue = await hasuraClient.request<{
      Revenue: Array<{ id: string; type: string }>;
    }>(CHECK_EXISTING_PLASA_FEE_REVENUE, { order_id: orderId });

    if (existingRevenue.Revenue && existingRevenue.Revenue.length > 0) {
      console.log(`Plasa fee revenue already exists for order ${orderId}, skipping calculation`);
      return res.status(200).json({
        success: true,
        message: "Plasa fee revenue already calculated for this order",
        data: {
          plasa_fee: "0.00",
        },
      });
    }

    // Get order details
    const orderData = await hasuraClient.request<{
      Orders_by_pk: {
        id: string;
        total: string;
        service_fee: string;
        delivery_fee: string;
        shopper_id: string;
        shop_id: string;
      };
    }>(GET_ORDER_DETAILS, { orderId });

    const order = orderData.Orders_by_pk;
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get system configuration for plasa fee calculation
    const systemConfigData = await hasuraClient.request<{
      System_configuratioins: Array<{ deliveryCommissionPercentage: string }>;
    }>(GET_SYSTEM_CONFIG);
    
    const deliveryCommissionPercentage = parseFloat(
      systemConfigData.System_configuratioins[0]?.deliveryCommissionPercentage || "0"
    );

    // Calculate plasa fee
    const serviceFeeNum = parseFloat(order.service_fee || "0");
    const deliveryFeeNum = parseFloat(order.delivery_fee || "0");
    const plasaFee = RevenueCalculator.calculatePlasaFee(
      serviceFeeNum,
      deliveryFeeNum,
      deliveryCommissionPercentage
    );

    // Get the correct shopper ID from the shoppers table
    let shopperId = null;
    if (order.shopper_id) {
      const shopperData = await hasuraClient.request<{
        shoppers: Array<{ id: string }>;
      }>(GET_SHOPPER_ID, { user_id: order.shopper_id });
      
      if (shopperData.shoppers && shopperData.shoppers.length > 0) {
        shopperId = shopperData.shoppers[0].id;
      }
    }

    // Create plasa fee revenue record (platform earnings only)
    if (plasaFee > 0) {
      await hasuraClient.request(CREATE_PLASA_FEE_REVENUE, {
        order_id: orderId,
        shop_id: order.shop_id,
        shopper_id: shopperId,
        amount: plasaFee.toFixed(2),
        commission_percentage: deliveryCommissionPercentage.toString(),
      });
    }

    return res.status(200).json({
      success: true,
      message: "Plasa fee revenue calculated and recorded successfully",
      data: {
        plasa_fee: plasaFee.toFixed(2),
        commission_percentage: deliveryCommissionPercentage,
      },
    });
  } catch (error) {
    console.error("Error calculating plasa fee revenue:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to calculate plasa fee revenue",
    });
  }
} 