import type { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

// GraphQL mutation to update regular order status
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus(
    $id: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_Orders_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      id
      status
      updated_at
    }
  }
`;

// GraphQL mutation to update reel order status
const UPDATE_REEL_ORDER_STATUS = gql`
  mutation UpdateReelOrderStatus(
    $id: uuid!
    $status: String!
    $updated_at: timestamptz!
  ) {
    update_reel_orders_by_pk(
      pk_columns: { id: $id }
      _set: { status: $status, updated_at: $updated_at }
    ) {
      id
      status
      updated_at
    }
  }
`;

// GraphQL query to get regular order details with fees
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($orderId: uuid!) {
    Orders_by_pk(id: $orderId) {
      id
      total
      service_fee
      delivery_fee
      shopper_id
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

  const { orderId, status } = req.body;

  if (!orderId || !status) {
    return res
      .status(400)
      .json({ error: "Missing required fields: orderId and status" });
  }

  // Validate status value
  const validStatuses = [
    "accepted",
    "shopping",
    "picked",
    "in_progress",
    "on_the_way",
    "at_customer",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    // First check if this is a regular order or reel order
    const CHECK_REGULAR_ORDER = gql`
      query CheckRegularOrder($orderId: uuid!, $shopperId: uuid!) {
        Orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
        }
      }
    `;

    const CHECK_REEL_ORDER = gql`
      query CheckReelOrder($orderId: uuid!, $shopperId: uuid!) {
        reel_orders(
          where: { id: { _eq: $orderId }, shopper_id: { _eq: $shopperId } }
        ) {
          id
          status
        }
      }
    `;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Check regular orders first
    const regularOrderCheck = await hasuraClient.request<{
      Orders: Array<{ id: string; status: string }>;
    }>(CHECK_REGULAR_ORDER, {
      orderId,
      shopperId: userId,
    });

    let isReelOrder = false;
    let orderType = "regular";

    if (regularOrderCheck.Orders && regularOrderCheck.Orders.length > 0) {
      // Found regular order assignment
    } else {
      // Check reel orders
      const reelOrderCheck = await hasuraClient.request<{
        reel_orders: Array<{ id: string; status: string }>;
      }>(CHECK_REEL_ORDER, {
        orderId,
        shopperId: userId,
      });

      if (reelOrderCheck.reel_orders && reelOrderCheck.reel_orders.length > 0) {
        // Found reel order assignment
        isReelOrder = true;
        orderType = "reel";
      } else {
        console.error(
          "Authorization failed: Shopper not assigned to this order"
        );
      return res
        .status(403)
        .json({ error: "You are not assigned to this order" });
      }
    }

    // Special handling for "shopping" status - update wallet balances and add commission revenue
    if (status === "shopping") {
      try {
        // Get order details with fees
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        let orderDetails: any;
        if (isReelOrder) {
          orderDetails = await hasuraClient.request<{
            reel_orders_by_pk: {
              id: string;
              total: string;
              service_fee: string;
              delivery_fee: string;
              shopper_id: string;
            };
          }>(GET_REEL_ORDER_DETAILS, {
            orderId,
          });
        } else {
          orderDetails = await hasuraClient.request<{
          Orders_by_pk: {
            id: string;
            total: string;
            service_fee: string;
            delivery_fee: string;
            shopper_id: string;
          };
        }>(GET_ORDER_DETAILS, {
          orderId,
        });
        }

        const order = isReelOrder 
          ? orderDetails.reel_orders_by_pk 
          : orderDetails.Orders_by_pk;

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Get shopper wallet
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        const walletData = await hasuraClient.request<{
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

        // Calculate new balances
        const orderTotal = parseFloat(order.total);
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");

        const currentAvailableBalance = parseFloat(wallet.available_balance);
        const currentReservedBalance = parseFloat(wallet.reserved_balance);

        // Only add order total to reserved balance (no change to available balance)
        const newReservedBalance = (
          currentReservedBalance + orderTotal
        ).toFixed(2);

        // Update wallet balances (only reserved balance changes)
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        await hasuraClient.request(UPDATE_WALLET_BALANCES, {
          wallet_id: wallet.id,
          available_balance: wallet.available_balance, // No change to available balance
          reserved_balance: newReservedBalance,
        });

        // Create wallet transactions (only reserved balance transaction)
        // Note: Wallet_Transactions table is designed for regular orders only
        // For reel orders, we skip transaction creation to avoid foreign key constraint issues
        if (!isReelOrder) {
          const transactions = [
            {
              wallet_id: wallet.id,
              amount: orderTotal.toFixed(2),
              type: "reserve",
              status: "completed",
              related_order_id: orderId,
              description: "Reserved balance for order goods",
            },
          ];

          if (!hasuraClient) {
            throw new Error("Hasura client is not initialized");
          }

          await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
            transactions,
          });
        }

        // Add commission revenue (product profits) when shopping starts
        if (!isReelOrder) {
          try {
            // Call the commission revenue calculation API
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

            if (commissionResponse.ok) {
              const commissionData = await commissionResponse.json();
            } else {
              console.error(
                "Failed to add commission revenue:",
                await commissionResponse.text()
              );
            }
          } catch (commissionError) {
            console.error("Error adding commission revenue:", commissionError);
            // Don't fail the order status update if commission revenue calculation fails
          }
        }
      } catch (walletError) {
        console.error("Error updating wallet balances:", walletError);
        return res.status(500).json({
          error:
            walletError instanceof Error
              ? walletError.message
              : "Unknown error",
        });
      }
    }

    // Get current timestamp for updated_at
    const currentTimestamp = new Date().toISOString();

    // Update the order status based on order type
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    let updateResult: any;
    if (isReelOrder) {
      updateResult = await hasuraClient.request<{
        update_reel_orders_by_pk: {
          id: string;
          status: string;
          updated_at: string;
        };
      }>(UPDATE_REEL_ORDER_STATUS, {
        id: orderId,
        status,
        updated_at: currentTimestamp,
      });
    } else {
      updateResult = await hasuraClient.request<{
      update_Orders_by_pk: {
        id: string;
        status: string;
        updated_at: string;
      };
    }>(UPDATE_ORDER_STATUS, {
      id: orderId,
      status,
      updated_at: currentTimestamp,
    });
    }

    const updatedOrder = isReelOrder 
      ? updateResult.update_reel_orders_by_pk 
      : updateResult.update_Orders_by_pk;

    // Special handling for "cancelled" status - process refunds
    if (status === "cancelled") {
      try {
        // Get order details
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        let orderDetails: any;
        if (isReelOrder) {
          orderDetails = await hasuraClient.request<{
            reel_orders_by_pk: {
              id: string;
              total: string;
              user_id: string;
            };
          }>(GET_REEL_ORDER_DETAILS, {
            orderId,
          });
        } else {
          orderDetails = await hasuraClient.request<{
            Orders_by_pk: {
              id: string;
              total: string;
              user_id: string;
            };
          }>(GET_ORDER_DETAILS, {
            orderId,
          });
        }

        const order = isReelOrder
          ? orderDetails.reel_orders_by_pk
          : orderDetails.Orders_by_pk;

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Get shopper wallet
        const walletData = await hasuraClient.request<{
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
        const currentReservedBalance = parseFloat(wallet.reserved_balance);

        // Decrease reserved balance by order total (refund the reserved amount)
        const newReservedBalance = (
          currentReservedBalance - orderTotal
        ).toFixed(2);

        // Update wallet balances
        await hasuraClient.request(UPDATE_WALLET_BALANCES, {
          wallet_id: wallet.id,
          available_balance: wallet.available_balance, // No change to available balance
          reserved_balance: newReservedBalance,
        });

        // Create refund record (not back to available balance, but to refund table)
        const refundRecord = {
          order_id: orderId,
          amount: orderTotal.toString(),
          status: "pending",
          reason: "Order cancelled by shopper",
          user_id: order.user_id,
          generated_by: "System",
          paid: false,
        };

        await hasuraClient.request(
          gql`
            mutation CreateRefund($refund: Refunds_insert_input!) {
              insert_Refunds_one(object: $refund) {
                id
                amount
                status
                reason
              }
            }
          `,
          {
            refund: refundRecord,
          }
        );

        // Create wallet transaction for refund
        if (!isReelOrder) {
          const transactions = [
            {
              wallet_id: wallet.id,
              amount: orderTotal.toFixed(2),
              type: "refund",
              status: "completed",
              related_order_id: orderId,
              description: "Refund for cancelled order",
            },
          ];

          await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
            transactions,
          });
        }
      } catch (cancellationError) {
        console.error("Error processing cancelled order:", cancellationError);
        return res.status(500).json({
          error:
            cancellationError instanceof Error
              ? cancellationError.message
              : "Unknown error",
        });
      }
    }

    // Special handling for "delivered" status - update wallet balances and calculate revenue
    if (status === "delivered") {
      try {
        // Get order details with fees
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        let orderDetails: any;
        if (isReelOrder) {
          orderDetails = await hasuraClient.request<{
            reel_orders_by_pk: {
              id: string;
              total: string;
              service_fee: string;
              delivery_fee: string;
              shopper_id: string;
            };
          }>(GET_REEL_ORDER_DETAILS, {
            orderId,
          });
        } else {
          orderDetails = await hasuraClient.request<{
            Orders_by_pk: {
              id: string;
              total: string;
              service_fee: string;
              delivery_fee: string;
              shopper_id: string;
            };
          }>(GET_ORDER_DETAILS, {
            orderId,
          });
        }

        const order = isReelOrder
          ? orderDetails.reel_orders_by_pk
          : orderDetails.Orders_by_pk;

        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }

        // Get system configuration for platform fee calculation
        const systemConfigResponse = await hasuraClient.request<{
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

        // Get shopper wallet
        const walletData = await hasuraClient.request<{
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

        // Calculate fees and earnings
        const orderTotal = parseFloat(order.total);
        const serviceFee = parseFloat(order.service_fee || "0");
        const deliveryFee = parseFloat(order.delivery_fee || "0");
        const totalEarnings = serviceFee + deliveryFee;

        // Calculate platform fee (commission)
        const platformFee =
          (totalEarnings * deliveryCommissionPercentage) / 100;
        const remainingEarnings = totalEarnings - platformFee;

        const currentAvailableBalance = parseFloat(wallet.available_balance);
        const currentReservedBalance = parseFloat(wallet.reserved_balance);

        // Update wallet balances according to specifications:
        // 1. Add remaining earnings to available balance (platform fee is already deducted from total earnings)
        // 2. Reserved balance was already used to pay for goods (no change needed)
        const newAvailableBalance = (
          currentAvailableBalance + remainingEarnings
        ).toFixed(2);

        // Update wallet balances (only available balance changes)
        await hasuraClient.request(UPDATE_WALLET_BALANCES, {
          wallet_id: wallet.id,
          available_balance: newAvailableBalance,
          reserved_balance: wallet.reserved_balance, // No change to reserved balance
        });

        // Create wallet transactions for delivered order (only earnings transaction)
        if (!isReelOrder) {
          const transactions = [
            {
              wallet_id: wallet.id,
              amount: remainingEarnings.toFixed(2),
              type: "earnings",
              status: "completed",
              related_order_id: orderId,
              description: "Earnings after platform fee deduction",
            },
          ];

          await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
            transactions,
          });
        }

        // Add plasa fee revenue (platform earnings) when order is delivered
        if (!isReelOrder) {
          try {
            // Call the plasa fee revenue calculation API
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

            if (plasaFeeResponse.ok) {
              const plasaFeeData = await plasaFeeResponse.json();
            } else {
              console.error(
                "Failed to add plasa fee revenue:",
                await plasaFeeResponse.text()
              );
            }
          } catch (plasaFeeError) {
            console.error("Error adding plasa fee revenue:", plasaFeeError);
            // Don't fail the order status update if plasa fee revenue calculation fails
          }
        }
      } catch (walletError) {
        console.error(
          "Error updating wallet balances for delivered order:",
          walletError
        );
        return res.status(500).json({
          error:
            walletError instanceof Error
              ? walletError.message
              : "Unknown error",
        });
      }
    }

    return res.status(200).json({
      success: true,
      order: updatedOrder,
      orderType,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Failed to update order status",
    });
  }
}
