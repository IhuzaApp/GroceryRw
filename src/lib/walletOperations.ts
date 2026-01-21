import { hasuraClient } from "./hasuraClient";
import { gql } from "graphql-request";
import type { NextApiRequest } from "next";

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
      combined_order_id
      shop_id
    }
  }
`;

// GraphQL query to get combined orders from same shop
const GET_COMBINED_ORDERS_SAME_SHOP = gql`
  query GetCombinedOrdersSameShop($combinedId: uuid!, $shopId: uuid!) {
    Orders(where: {
      combined_order_id: { _eq: $combinedId }
      shop_id: { _eq: $shopId }
      shopper_id: { _is_null: false }
    }) {
      id
      total
      shop_id
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

// Handle shopping operation - add to reserved balance
export async function handleShoppingOperation(
  wallet: any,
  orderTotal: number,
  orderId: string,
  isReelOrder: boolean,
  isRestaurantOrder: boolean,
  req?: NextApiRequest
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
  if (!isReelOrder && !isRestaurantOrder && req) {
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
export async function handleDeliveredOperation(
  wallet: any,
  order: any,
  orderId: string,
  isReelOrder: boolean,
  isRestaurantOrder: boolean,
  req?: NextApiRequest
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
  if (!isReelOrder && !isRestaurantOrder && req) {
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
export async function handleCancelledOperation(
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

// Main function to process wallet operations
export async function processWalletOperation(
  userId: string,
  orderId: string,
  operation: "shopping" | "delivered" | "cancelled",
  isReelOrder: boolean = false,
  isRestaurantOrder: boolean = false,
  req?: NextApiRequest
) {
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
    throw new Error("Order not found");
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
    throw new Error("Shopper wallet not found");
  }

  const wallet = walletData.Wallets[0];

  // Calculate order total - for same-shop combined orders, calculate from Order_Items
  let orderTotal = parseFloat(order.total);

  // Check if this is a same-shop combined order for shopping operation
  if (operation === "shopping" && !isReelOrder && !isRestaurantOrder && order.combined_order_id) {
    try {
      // Query to get order items for combined orders
      const GET_COMBINED_ORDER_ITEMS = gql`
        query GetCombinedOrderItems($combinedId: uuid!, $shopId: uuid!) {
          Orders(where: {
            combined_order_id: { _eq: $combinedId }
            shop_id: { _eq: $shopId }
            shopper_id: { _is_null: false }
          }) {
            id
            Order_Items {
              price
              quantity
            }
          }
        }
      `;

      const combinedOrdersData = await hasuraClient!.request<{
        Orders: Array<{
          id: string;
          Order_Items: Array<{
            price: string;
            quantity: string;
          }>;
        }>;
      }>(GET_COMBINED_ORDER_ITEMS, {
        combinedId: order.combined_order_id,
        shopId: order.shop_id,
      });

      if (combinedOrdersData.Orders && combinedOrdersData.Orders.length > 0) {
        // Calculate total from all Order_Items across the batch
        orderTotal = combinedOrdersData.Orders.reduce((batchTotal, combinedOrder) => {
          const orderItemsTotal = combinedOrder.Order_Items.reduce((orderTotal, item) => {
            const price = parseFloat(item.price || "0");
            const quantity = parseFloat(item.quantity || "0");
            return orderTotal + (price * quantity);
          }, 0);
          return batchTotal + orderItemsTotal;
        }, 0);

        console.log("🔍 WALLET OPERATION - Same shop batch total from items:", orderTotal);
      }
    } catch (error) {
      console.error("Error fetching combined order items for wallet operation:", error);
      // Fall back to single order total if combined order query fails
    }
  }

  // Handle different wallet operations
  switch (operation) {
    case "shopping":
      return await handleShoppingOperation(
        wallet,
        orderTotal,
        orderId,
        isReelOrder,
        isRestaurantOrder,
        req
      );

    case "delivered":
      return await handleDeliveredOperation(
        wallet,
        order,
        orderId,
        isReelOrder,
        isRestaurantOrder,
        req
      );

    case "cancelled":
      // For cancelled operations, we need to handle combined orders differently
      // since the cancellation might affect the entire batch
      if (!isReelOrder && !isRestaurantOrder && order.combined_order_id) {
        // For same-shop combined orders, calculate the batch total from items for refund
        try {
          const GET_COMBINED_ORDER_ITEMS = gql`
            query GetCombinedOrderItems($combinedId: uuid!, $shopId: uuid!) {
              Orders(where: {
                combined_order_id: { _eq: $combinedId }
                shop_id: { _eq: $shopId }
                shopper_id: { _is_null: false }
              }) {
                id
                Order_Items {
                  price
                  quantity
                }
              }
            }
          `;

          const combinedOrdersData = await hasuraClient!.request<{
            Orders: Array<{
              id: string;
              Order_Items: Array<{
                price: string;
                quantity: string;
              }>;
            }>;
          }>(GET_COMBINED_ORDER_ITEMS, {
            combinedId: order.combined_order_id,
            shopId: order.shop_id,
          });

          if (combinedOrdersData.Orders && combinedOrdersData.Orders.length > 0) {
            orderTotal = combinedOrdersData.Orders.reduce((batchTotal, combinedOrder) => {
              const orderItemsTotal = combinedOrder.Order_Items.reduce((orderTotal, item) => {
                const price = parseFloat(item.price || "0");
                const quantity = parseFloat(item.quantity || "0");
                return orderTotal + (price * quantity);
              }, 0);
              return batchTotal + orderItemsTotal;
            }, 0);
          }
        } catch (error) {
          console.error("Error fetching combined order items for cancellation:", error);
        }
      }

      return await handleCancelledOperation(
        wallet,
        order,
        orderTotal,
        orderId,
        isReelOrder,
        isRestaurantOrder
      );

    default:
      throw new Error("Invalid operation");
  }
}
