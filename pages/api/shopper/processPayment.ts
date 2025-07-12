import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { formatCurrency } from "../../../src/lib/formatCurrency";

// GraphQL query to get regular order details
const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($order_id: uuid!) {
    Orders_by_pk(id: $order_id) {
      id
      OrderID
      user_id
      total
      service_fee
      delivery_fee
      shopper_id
      status
      Shop {
        id
        name
      }
      Order_Items {
        id
        quantity
        price
        Product {
          name
        }
      }
    }
  }
`;

// GraphQL query to get reel order details
const GET_REEL_ORDER_DETAILS = gql`
  query GetReelOrderDetails($order_id: uuid!) {
    reel_orders_by_pk(id: $order_id) {
      id
      OrderID
      user_id
      total
      shopper_id
      status
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
    }
  }
`;

// GraphQL query to get shopper's wallet
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
  mutation UpdateWalletBalances($wallet_id: uuid!, $reserved_balance: String!) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { reserved_balance: $reserved_balance }
    ) {
      id
      reserved_balance
    }
  }
`;

// GraphQL mutation to create wallet transactions
const CREATE_WALLET_TRANSACTIONS = gql`
  mutation createWalletTransactions(
    $transactions: [Wallet_Transactions_insert_input!]!
  ) {
    insert_Wallet_Transactions(objects: $transactions) {
      returning {
        id
      }
    }
  }
`;

// GraphQL mutation to create refund record
const CREATE_REFUND = gql`
  mutation CreateRefund($refund: Refunds_insert_input!) {
    insert_Refunds_one(object: $refund) {
      id
      amount
      order_id
      status
      reason
      generated_by
      paid
    }
  }
`;

// Type definitions for GraphQL responses
interface OrderDetails {
  Orders_by_pk: {
    id: string;
    OrderID: string;
    user_id: string;
    total: string;
    service_fee: string;
    delivery_fee: string;
    shopper_id: string;
    status: string;
    Shop: {
      id: string;
      name: string;
    };
    Order_Items: Array<{
      id: string;
      quantity: number;
      price: string;
      Product: {
        name: string;
      };
    }>;
  } | null;
}

interface ReelOrderDetails {
  reel_orders_by_pk: {
    id: string;
    OrderID: string;
    user_id: string;
    total: string;
    shopper_id: string;
    status: string;
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
  } | null;
}

interface WalletData {
  Wallets: Array<{
    id: string;
    available_balance: string;
    reserved_balance: string;
  }>;
}

interface RefundResponse {
  insert_Refunds_one: {
    id: string;
    amount: string;
    order_id: string;
    status: string;
    reason: string;
    generated_by: string;
    paid: boolean;
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
    // Get user session
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get request data
    const { orderId, momoCode, privateKey, orderAmount, originalOrderTotal, orderType } =
      req.body;

    // Validate required fields
    if (!orderId || !momoCode || !privateKey || orderAmount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Format order amount to ensure consistent handling
    const formattedOrderAmount = parseFloat(Number(orderAmount).toFixed(2));



    // In a real-world scenario, this would integrate with a payment processor
    // For now, we'll skip that and just update the database directly

    // Get the order details to verify it exists and get associated data
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    let orderData: any = null;
    let isReelOrder = orderType === 'reel';

    // Get order details based on order type
    if (isReelOrder) {
      const reelOrderResponse = await hasuraClient.request<ReelOrderDetails>(
        GET_REEL_ORDER_DETAILS,
        {
          order_id: orderId,
        }
      );

      orderData = reelOrderResponse.reel_orders_by_pk;
      if (!orderData) {
        return res.status(404).json({ error: "Reel order not found" });
      }
    } else {
      const orderResponse = await hasuraClient.request<OrderDetails>(
        GET_ORDER_DETAILS,
        {
          order_id: orderId,
        }
      );

      orderData = orderResponse.Orders_by_pk;
      if (!orderData) {
        return res.status(404).json({ error: "Order not found" });
      }
    }

    // Get shopper's wallet
    const shopperId = orderData.shopper_id;
    const walletResponse = await hasuraClient.request<WalletData>(
      GET_SHOPPER_WALLET,
      {
        shopper_id: shopperId,
      }
    );

    if (!walletResponse.Wallets || walletResponse.Wallets.length === 0) {
      return res
        .status(404)
        .json({ error: "Wallet not found for this shopper" });
    }

    const wallet = walletResponse.Wallets[0];
    const walletId = wallet.id;

    // Check if there's enough in the reserved balance
    const currentReserved = parseFloat(wallet.reserved_balance);
    const formattedReservedBalance = parseFloat(currentReserved.toFixed(2));

    if (formattedReservedBalance < formattedOrderAmount) {
      return res.status(400).json({
        error: `Insufficient reserved balance. You have ${formatCurrency(
          formattedReservedBalance
        )} but need ${formatCurrency(formattedOrderAmount)}`,
      });
    }

    // Calculate refund amount if needed
    let refundAmount = 0;
    let refundNeeded = false;
    let refundReason = "";
    let refundData = null;

    // If originalOrderTotal is provided, use it; otherwise get from orderData
    const totalOrderValue = originalOrderTotal || parseFloat(isReelOrder ? orderData.total : orderData.total);

    // Calculate if there's a difference between original total and found items total
    if (totalOrderValue > formattedOrderAmount) {
      refundAmount = parseFloat(
        (totalOrderValue - formattedOrderAmount).toFixed(2)
      );
      refundNeeded = true;

      // Get shop/restaurant name
      const shopName = isReelOrder 
        ? (orderData.Reel?.Restaurant?.name || "Unknown Restaurant")
        : (orderData.Shop?.name || "Unknown Shop");

      // Create detailed reason for the refund
      refundReason = `Refund for items not found during shopping at ${shopName}. `;

      if (isReelOrder) {
        // For reel orders, we don't have individual items, so just use the product name
        refundReason += `Reel order: ${orderData.Reel?.Restaurant?.name || 'Unknown Restaurant'}. `;
      } else {
        // List all order items for regular orders
        const allItems = orderData.Order_Items.map(
          (item: any) => `${item.Product.name} (${item.quantity})`
        ).join(", ");
        refundReason += `Order items: ${allItems}. `;
      }

      refundReason += `Original total: ${totalOrderValue}, found items total: ${formattedOrderAmount}, refund amount: ${refundAmount}.`;
    }

    // Handle refund creation first if needed
    if (refundNeeded && refundAmount > 0) {
      try {


        // Create refund record with all required fields
        const refundRecord = {
          order_id: orderId,
          amount: refundAmount.toString(),
          status: "pending",
          reason: refundReason,
          user_id: orderData.user_id,
          generated_by: "System",
          paid: false,
        };



        const refundResponse = await hasuraClient.request<RefundResponse>(
          CREATE_REFUND,
          {
            refund: refundRecord,
          }
        );

        if (!refundResponse || !refundResponse.insert_Refunds_one) {
          throw new Error(
            "Refund creation failed: Empty response from database"
          );
        }

        refundData = refundResponse.insert_Refunds_one;

      } catch (refundError) {
        console.error("Error creating refund record:", refundError);
        // Add more detailed error logging to help diagnose the issue
        if (refundError instanceof Error) {
          console.error("Error message:", refundError.message);
          console.error("Error stack:", refundError.stack);
        }
        // Fail the entire transaction if refund creation fails
        throw new Error(
          `Failed to create refund: ${
            refundError instanceof Error ? refundError.message : "Unknown error"
          }`
        );
      }
    }

    // Only proceed with wallet updates if we've successfully created the refund (if needed)
    // or if no refund was needed

    // Calculate the new reserved balance after deducting the full original amount
    const originalAmount = originalOrderTotal || formattedOrderAmount;
    const newReserved = currentReserved - originalAmount;



    // Update the wallet balances
    await hasuraClient.request(UPDATE_WALLET_BALANCES, {
      wallet_id: walletId,
      reserved_balance: newReserved.toString(),
    });

    // Create wallet transaction records for the payment
    // Note: Wallet_Transactions table is designed for regular orders only
    // For reel orders, we skip creating wallet transactions to avoid foreign key constraint issues
    if (!isReelOrder) {
      const transactions = [
        {
          wallet_id: walletId,
          amount: formattedOrderAmount.toFixed(2),
          type: "payment",
          status: "completed",
          related_order_id: orderId,
          description: `Payment from reserved balance for found order items. MoMo Code: ${momoCode}`,
        },
      ];

      const transactionResponse = await hasuraClient.request(
        CREATE_WALLET_TRANSACTIONS,
        {
          transactions,
        }
      );
    } else {
      // Skipping wallet transaction creation for reel order to avoid foreign key constraint issues
    }

    return res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      paymentDetails: {
        orderId,
        amount: formattedOrderAmount,
        originalTotal: originalOrderTotal,
        timestamp: new Date().toISOString(),
      },
      walletUpdate: {
        oldReservedBalance: currentReserved,
        newReservedBalance: newReserved,
        deductedAmount: originalAmount,
      },
      refund: refundData,
      refundAmount: refundAmount,
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
