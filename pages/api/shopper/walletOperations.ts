import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL query to get regular order details with fees
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      total
      service_fee
      delivery_fee
      shopper_id
      user_id
    }
  }
`;

// GraphQL query to get reel order details with fees
const GET_REEL_ORDER_DETAILS = gql`
  query GetReelOrderDetails($orderId: uuid!) {
    reel_orders_by_pk(id: $orderId) {
      id
      total
      service_fee
      delivery_fee
      shopper_id
      user_id
    }
  }
`;

// GraphQL query to get restaurant order details with fees
const GET_RESTAURANT_ORDER_DETAILS = gql`
  query GetRestaurantOrderDetails($orderId: uuid!) {
    restaurant_orders_by_pk(id: $orderId) {
      id
      total
      delivery_fee
      shopper_id
      user_id
    }
  }
`;

// GraphQL query to get shopper wallet
const GET_SHOPPER_WALLET = gql`
  query GetShopperWallet($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
      reserved_balance
    }
  }
`;

// GraphQL mutation to update wallet balances
const UPDATE_WALLET_BALANCES = gql`
  mutation UpdateWalletBalances(
    $wallet_id: uuid!
    $available_balance: String!
    $reserved_balance: String!
  ) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: {
        available_balance: $available_balance
        reserved_balance: $reserved_balance
        last_updated: "now()"
      }
    ) {
      id
      available_balance
      reserved_balance
      last_updated
    }
  }
`;

// GraphQL mutation to create wallet transactions
const CREATE_WALLET_TRANSACTIONS = gql`
  mutation CreateWalletTransactions(
    $transactions: [Wallet_Transactions_insert_input!]!
  ) {
    insert_Wallet_Transactions(objects: $transactions) {
      affected_rows
    }
  }
`;

// GraphQL mutation to create refund record
const CREATE_REFUND = gql`
  mutation CreateRefund($refund: Refunds_insert_input!) {
    insert_Refunds_one(object: $refund) {
      id
      amount
      status
      reason
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Authenticate the shopper
  const session = await getServerSession(req, res, authOptions as any);
  const userId = (session as any)?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    orderId,
    operation,
    isReelOrder = false,
    isRestaurantOrder = false,
  } = req.body;

  if (!orderId || !operation) {
    return res
      .status(400)
      .json({ error: "Missing required fields: orderId and operation" });
  }

  // Validate operation type
  const validOperations = ["shopping", "delivered", "cancelled"];
  if (!validOperations.includes(operation)) {
    return res.status(400).json({ error: "Invalid operation type" });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get order details with fees
    let orderDetails: any;
    if (isReelOrder) {
      orderDetails = await hasuraClient!.request<{
        reel_orders_by_pk: {
          id: string;
          total: string;
          service_fee: string;
          delivery_fee: string;
          shopper_id: string;
          user_id: string;
        };
      }>(GET_REEL_ORDER_DETAILS, {
        orderId,
      });
    } else if (isRestaurantOrder) {
      orderDetails = await hasuraClient!.request<{
        restaurant_orders_by_pk: {
          id: string;
          total: string;
          delivery_fee: string;
          shopper_id: string;
          user_id: string;
        };
      }>(GET_RESTAURANT_ORDER_DETAILS, {
        orderId,
      });
    } else {
      orderDetails = await hasuraClient!.request<{
        Orders_by_pk: {
          id: string;
          total: string;
          service_fee: string;
          delivery_fee: string;
          shopper_id: string;
          user_id: string;
        };
      }>(GET_ORDER_DETAILS, {
        orderId,
      });
    }

    const order = isReelOrder
      ? orderDetails.reel_orders_by_pk
      : isRestaurantOrder
      ? orderDetails.restaurant_orders_by_pk
      : orderDetails.Orders_by_pk;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get shopper wallet
    const walletData = await hasuraClient!.request<{
      Wallets: Array<{
        id: string;
        available_balance: string;
        reserved_balance: string;
      }>;
    }>(GET_SHOPPER_WALLET, {
      shopper_id: userId,
    });

    if (!walletData.Wallets || walletData.Wallets.length === 0) {
      return res.status(400).json({ error: "Shopper wallet not found" });
    }

    const wallet = walletData.Wallets[0];
    const orderTotal = parseFloat(order.total);
    const currentAvailableBalance = parseFloat(wallet.available_balance);
    const currentReservedBalance = parseFloat(wallet.reserved_balance);

    let result: any = {};

    // Handle different wallet operations
    switch (operation) {
      case "shopping":
        result = await handleShoppingOperation(
          wallet,
          orderTotal,
          orderId,
          isReelOrder,
          isRestaurantOrder,
          req
        );
        break;

      case "delivered":
        result = await handleDeliveredOperation(
          wallet,
          order,
          orderId,
          isReelOrder,
          isRestaurantOrder,
          req
        );
        break;

      case "cancelled":
        result = await handleCancelledOperation(
          wallet,
          order,
          orderTotal,
          orderId,
          isReelOrder,
          isRestaurantOrder
        );
        break;

      default:
        return res.status(400).json({ error: "Invalid operation" });
    }

    return res.status(200).json({
      success: true,
      operation,
      orderId,
      ...result,
    });
  } catch (error) {
    console.error(`Error processing wallet operation ${operation}:`, error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to process wallet operation",
    });
  }
}

// Handle shopping operation - add to reserved balance
async function handleShoppingOperation(
  wallet: any,
  orderTotal: number,
  orderId: string,
  isReelOrder: boolean,
  isRestaurantOrder: boolean,
  req: NextApiRequest
) {
  const currentReservedBalance = parseFloat(wallet.reserved_balance);
  const newReservedBalance = (currentReservedBalance + orderTotal).toFixed(2);

  // Update wallet balances (only reserved balance changes)
  await hasuraClient!.request(UPDATE_WALLET_BALANCES, {
    wallet_id: wallet.id,
    available_balance: wallet.available_balance,
    reserved_balance: newReservedBalance,
  });

  // Create wallet transactions
  if (!isReelOrder && !isRestaurantOrder) {
    const transactions = [
      {
        wallet_id: wallet.id,
        amount: orderTotal.toFixed(2),
        type: "reserve",
        status: "completed",
        related_order_id: orderId,
        related_reel_orderId: null,
        related_restaurant_order_id: null,
        description: "Reserved balance for order goods",
      },
    ];

    await hasuraClient!.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });
  }

  // Add commission revenue when shopping starts
  if (!isReelOrder && !isRestaurantOrder) {
    try {
      const commissionResponse = await fetch(
        `${
          req.headers.host
            ? `http://${req.headers.host}`
            : "http://localhost:3000"
        }/api/shopper/calculateCommissionRevenue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.cookie || "",
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!commissionResponse.ok) {
        console.error(
          "Failed to add commission revenue:",
          await commissionResponse.text()
        );
      }
    } catch (commissionError) {
      console.error("Error adding commission revenue:", commissionError);
    }
  }

  return {
    newReservedBalance,
    reservedBalanceChange: orderTotal,
    message: "Reserved balance updated for shopping",
  };
}

// Handle delivered operation - calculate earnings and update balances
async function handleDeliveredOperation(
  wallet: any,
  order: any,
  orderId: string,
  isReelOrder: boolean,
  isRestaurantOrder: boolean,
  req: NextApiRequest
) {
  // Get system configuration for platform fee calculation
  const systemConfigResponse = await hasuraClient!.request<{
    System_configuratioins: Array<{
      deliveryCommissionPercentage: string;
    }>;
  }>(gql`
    query GetSystemConfiguration {
      System_configuratioins {
        deliveryCommissionPercentage
      }
    }
  `);

  const deliveryCommissionPercentage = parseFloat(
    systemConfigResponse.System_configuratioins[0]
      ?.deliveryCommissionPercentage || "20"
  );

  // Calculate fees and earnings
  const orderTotal = parseFloat(order.total);
  const serviceFee = parseFloat(order.service_fee || "0");
  const deliveryFee = parseFloat(order.delivery_fee || "0");

  // For restaurant orders, only delivery fee is earned (no service fee)
  const totalEarnings = isRestaurantOrder
    ? deliveryFee
    : serviceFee + deliveryFee;
  const platformFee = (totalEarnings * deliveryCommissionPercentage) / 100;
  const remainingEarnings = totalEarnings - platformFee;

  const currentAvailableBalance = parseFloat(wallet.available_balance);
  const currentReservedBalance = parseFloat(wallet.reserved_balance);

  const newAvailableBalance = (
    currentAvailableBalance + remainingEarnings
  ).toFixed(2);

  // Calculate reserved balance: never go below 0
  let newReservedBalance = wallet.reserved_balance; // Keep existing for restaurant orders
  let refundAmount = 0;

  // Only adjust reserved balance for regular orders (not restaurant or reel orders)
  if (!isRestaurantOrder && !isReelOrder) {
    if (currentReservedBalance >= orderTotal) {
      newReservedBalance = (currentReservedBalance - orderTotal).toFixed(2);
    } else {
      newReservedBalance = "0.00";
      refundAmount = orderTotal - currentReservedBalance;
    }
  }

  // Update wallet balances
  await hasuraClient!.request(UPDATE_WALLET_BALANCES, {
    wallet_id: wallet.id,
    available_balance: newAvailableBalance,
    reserved_balance: newReservedBalance,
  });

  // Create wallet transactions for delivered order
  if (!isReelOrder && !isRestaurantOrder) {
    const transactions = [
      {
        wallet_id: wallet.id,
        amount: remainingEarnings.toFixed(2),
        type: "earnings",
        status: "completed",
        related_order_id: orderId,
        related_reel_orderId: null,
        related_restaurant_order_id: null,
        description: "Earnings after platform fee deduction",
      },
      {
        wallet_id: wallet.id,
        amount: (
          currentReservedBalance - parseFloat(newReservedBalance)
        ).toFixed(2),
        type: "expense",
        status: "completed",
        related_order_id: orderId,
        related_reel_orderId: null,
        related_restaurant_order_id: null,
        description: "Reserved balance used for order goods",
      },
    ];

    if (refundAmount > 0) {
      transactions.push({
        wallet_id: wallet.id,
        amount: refundAmount.toFixed(2),
        type: "refund",
        status: "completed",
        related_order_id: orderId,
        related_reel_orderId: null,
        related_restaurant_order_id: null,
        description: "Refund for excess reserved balance",
      });
    }

    await hasuraClient!.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });
  } else if (isRestaurantOrder) {
    // For restaurant orders, create earnings transaction for delivery fee
    const transactions = [
      {
        wallet_id: wallet.id,
        amount: remainingEarnings.toFixed(2),
        type: "earnings",
        status: "completed",
        related_order_id: null,
        related_reel_orderId: null,
        related_restaurant_order_id: orderId,
        description: "Delivery fee earnings after platform fee deduction",
      },
    ];

    await hasuraClient!.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });
  }

  // Add plasa fee revenue when order is delivered
  if (!isReelOrder && !isRestaurantOrder) {
    try {
      const plasaFeeResponse = await fetch(
        `${
          req.headers.host
            ? `http://${req.headers.host}`
            : "http://localhost:3000"
        }/api/shopper/calculatePlasaFeeRevenue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.cookie || "",
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!plasaFeeResponse.ok) {
        console.error(
          "Failed to add plasa fee revenue:",
          await plasaFeeResponse.text()
        );
      }
    } catch (plasaFeeError) {
      console.error("Error adding plasa fee revenue:", plasaFeeError);
    }
  }

  return {
    newAvailableBalance,
    newReservedBalance,
    earningsAdded: remainingEarnings,
    platformFeeDeducted: platformFee,
    refundAmount,
    message: "Wallet updated for delivered order",
  };
}

// Handle cancelled operation - process refunds
async function handleCancelledOperation(
  wallet: any,
  order: any,
  orderTotal: number,
  orderId: string,
  isReelOrder: boolean,
  isRestaurantOrder: boolean
) {
  const currentReservedBalance = parseFloat(wallet.reserved_balance);
  const newReservedBalance = (currentReservedBalance - orderTotal).toFixed(2);

  // Update wallet balances
  await hasuraClient!.request(UPDATE_WALLET_BALANCES, {
    wallet_id: wallet.id,
    available_balance: wallet.available_balance,
    reserved_balance: newReservedBalance,
  });

  // Create refund record
  const refundRecord = {
    order_id: orderId,
    amount: orderTotal.toString(),
    status: "pending",
    reason: "Order cancelled by shopper",
    user_id: order.user_id,
    generated_by: "System",
    paid: false,
  };

  await hasuraClient!.request(CREATE_REFUND, {
    refund: refundRecord,
  });

  // Create wallet transaction for refund
  if (!isReelOrder && !isRestaurantOrder) {
    const transactions = [
      {
        wallet_id: wallet.id,
        amount: orderTotal.toFixed(2),
        type: "refund",
        status: "completed",
        related_order_id: orderId,
        related_reel_orderId: null,
        related_restaurant_order_id: null,
        description: "Refund for cancelled order",
      },
    ];

    await hasuraClient!.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });
  }

  return {
    newReservedBalance,
    refundAmount: orderTotal,
    message: "Refund processed for cancelled order",
  };
}
