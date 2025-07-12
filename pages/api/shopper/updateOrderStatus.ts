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

    console.log("Checking assignment for shopper:", userId, "order:", orderId);

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
      console.log("Found regular order assignment");
    } else {
      // Check reel orders
      const reelOrderCheck = await hasuraClient.request<{
        reel_orders: Array<{ id: string; status: string }>;
      }>(CHECK_REEL_ORDER, {
        orderId,
        shopperId: userId,
      });

      if (reelOrderCheck.reel_orders && reelOrderCheck.reel_orders.length > 0) {
        console.log("Found reel order assignment");
        isReelOrder = true;
        orderType = "reel";
      } else {
      console.error("Authorization failed: Shopper not assigned to this order");
      return res
        .status(403)
        .json({ error: "You are not assigned to this order" });
      }
    }

    // Special handling for "shopping" status - update wallet balances
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

        // Add service fee and delivery fee to available balance
        const newAvailableBalance = (
          currentAvailableBalance +
          serviceFee +
          deliveryFee
        ).toFixed(2);

        // Add order total to reserved balance
        const newReservedBalance = (
          currentReservedBalance + orderTotal
        ).toFixed(2);

        // Update wallet balances
        if (!hasuraClient) {
          throw new Error("Hasura client is not initialized");
        }

        await hasuraClient.request(UPDATE_WALLET_BALANCES, {
          wallet_id: wallet.id,
          available_balance: newAvailableBalance,
          reserved_balance: newReservedBalance,
        });

        // Create wallet transactions
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
            },
            {
              wallet_id: wallet.id,
              amount: (serviceFee + deliveryFee).toFixed(2),
              type: "earnings",
              status: "completed",
              related_order_id: orderId,
            },
          ];

          if (!hasuraClient) {
            throw new Error("Hasura client is not initialized");
          }

          await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
            transactions,
          });
        }

        console.log("Wallet balances updated for shopping status");
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

    console.log(
      "Order status updated successfully:",
      updatedOrder
    );

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
