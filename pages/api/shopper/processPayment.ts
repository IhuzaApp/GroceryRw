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
      combined_order_id
      Shop {
        id
        name
      }
      Order_Items {
        id
        quantity
        price
        Product {
          ProductName {
            name
          }
        }
      }
    }
  }
`;

// GraphQL query to get combined orders by combined_order_id
const GET_COMBINED_ORDERS = gql`
  query GetCombinedOrders($combined_order_id: uuid!) {
    Orders(where: { combined_order_id: { _eq: $combined_order_id } }) {
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

// GraphQL query to check existing refund
const CHECK_EXISTING_REFUND = gql`
  query CheckExistingRefund($order_id: uuid!) {
    Refunds(where: { order_id: { _eq: $order_id } }) {
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
    combined_order_id: string | null;
    Shop: {
      id: string;
      name: string;
    };
    Order_Items: Array<{
      id: string;
      quantity: number;
      price: string;
      Product: {
        ProductName: {
          name: string;
        };
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
  console.log("🔍 BACKEND: processPayment API called");
  console.log("🔍 BACKEND: Request method:", req.method);
  console.log("🔍 BACKEND: Request body:", req.body);

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
    const {
      orderId,
      momoCode,
      privateKey,
      orderAmount,
      originalOrderTotal,
      orderType,
      momoReferenceId,
      momoSuccess,
    } = req.body;

    console.log("🔍 BACKEND: Extracted request data:");
    console.log("🔍 BACKEND: orderId:", orderId);
    console.log("🔍 BACKEND: orderAmount:", orderAmount);
    console.log("🔍 BACKEND: originalOrderTotal:", originalOrderTotal);
    console.log("🔍 BACKEND: orderType:", orderType);

    // Validate required fields
    if (!orderId || !momoCode || !privateKey || orderAmount === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Format order amount to ensure consistent handling
    const formattedOrderAmount = parseFloat(Number(orderAmount).toFixed(2));

    console.log("🔍 Backend: Received payment request");
    console.log("🔍 Backend: orderId:", orderId);
    console.log("🔍 Backend: orderAmount received:", orderAmount);
    console.log("🔍 Backend: formattedOrderAmount:", formattedOrderAmount);

    // In a real-world scenario, this would integrate with a payment processor
    // For now, we'll skip that and just update the database directly

    // Get the order details to verify it exists and get associated data
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    let orderData: any = null;
    let isReelOrder = orderType === "reel";
    let allOrdersInBatch: any[] = [];
    let batchTotal = 0;
    let hasCombinedOrders = false;

    console.log("🔍 Backend: Fetching order details for:", orderId);
    console.log("🔍 Backend: Order type:", orderType);

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
      allOrdersInBatch = [orderData];
      batchTotal = parseFloat(orderData.total);
      console.log("🔍 Backend: Reel order found, total:", batchTotal);
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

      console.log("🔍 Backend: Main order found:", {
        id: orderData.id,
        total: orderData.total,
        combined_order_id: orderData.combined_order_id
      });

      // Check if this order has combined orders
      allOrdersInBatch = [orderData];
      batchTotal = parseFloat(orderData.total);

      if (orderData.combined_order_id) {
        hasCombinedOrders = true;
        console.log("🔍 Backend: Order has combined_order_id:", orderData.combined_order_id);

        // Fetch all orders with the same combined_order_id
        const combinedOrdersResponse = await hasuraClient.request<{
          Orders: any[];
        }>(GET_COMBINED_ORDERS, {
          combined_order_id: orderData.combined_order_id,
        });

        console.log("🔍 Backend: Combined orders response:", combinedOrdersResponse);

        if (combinedOrdersResponse.Orders && combinedOrdersResponse.Orders.length > 0) {
          allOrdersInBatch = combinedOrdersResponse.Orders;
          console.log("🔍 Backend: Found combined orders details:");
        allOrdersInBatch.forEach((order: any, index: number) => {
          console.log(`🔍 Backend: Combined order ${index + 1}:`, {
            id: order.id,
            OrderID: order.OrderID,
            total: order.total,
            status: order.status,
            shop: order.Shop?.name
          });
        });

          // Use the frontend calculated amount (base item total, not stored totals with fees)
          console.log("🔍 Backend: Using frontend calculated base items total:", formattedOrderAmount);
          console.log("🔍 Backend: Stored totals with fees would be:");
          allOrdersInBatch.forEach((order: any, index: number) => {
            console.log(`🔍 Backend: Order ${index + 1} (${order.id}): stored total ${order.total}`);
          });
          const storedTotalSum = allOrdersInBatch.reduce((sum, order) => sum + parseFloat(order.total), 0);
          console.log("🔍 Backend: Stored totals sum (with fees):", storedTotalSum);
          console.log("🔍 Backend: Using base items total instead:", formattedOrderAmount);

          batchTotal = formattedOrderAmount;
        } else {
          console.log("🔍 Backend: No combined orders found");
        }
      } else {
        console.log("🔍 Backend: No combined_order_id found");
      }
    }

    console.log("🔍 Backend: ===== FINAL PROCESSING SUMMARY =====");
    console.log("🔍 Backend: hasCombinedOrders:", hasCombinedOrders);
    console.log("🔍 Backend: allOrdersInBatch count:", allOrdersInBatch.length);
    console.log("🔍 Backend: Individual order totals:", allOrdersInBatch.map(o => ({
      id: o.id,
      OrderID: o.OrderID,
      total: o.total
    })));
    console.log("🔍 Backend: Calculated batchTotal:", batchTotal);
    console.log("🔍 Backend: Received formattedOrderAmount:", formattedOrderAmount);
    console.log("🔍 Backend: Match check - batchTotal === formattedOrderAmount:", batchTotal === formattedOrderAmount);

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

    console.log("🔍 Backend: Wallet found:", {
      id: walletId,
      available_balance: wallet.available_balance,
      reserved_balance: wallet.reserved_balance
    });

    // Check if there's enough in the reserved balance
    const currentReserved = parseFloat(wallet.reserved_balance);
    const formattedReservedBalance = parseFloat(currentReserved.toFixed(2));

    console.log("🔍 Backend: Balance check:");
    console.log("🔍 Backend: Current reserved balance:", currentReserved);
    console.log("🔍 Backend: Formatted reserved balance:", formattedReservedBalance);
    console.log("🔍 Backend: Required amount:", formattedOrderAmount);

    if (formattedReservedBalance < formattedOrderAmount) {
      console.log("🔍 Backend: Insufficient balance!");
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

    // For combined orders, use the batch total; otherwise use individual order total
    const totalOrderValue = hasCombinedOrders
      ? batchTotal
      : (originalOrderTotal || parseFloat(isReelOrder ? orderData.total : orderData.total));

    // Calculate if there's a difference between original total and found items total
    if (totalOrderValue > formattedOrderAmount) {
      refundAmount = parseFloat(
        (totalOrderValue - formattedOrderAmount).toFixed(2)
      );
      refundNeeded = true;

      // Get shop/restaurant name
      const shopName = isReelOrder
        ? orderData.Reel?.Restaurant?.name || "Unknown Restaurant"
        : hasCombinedOrders
        ? "Multiple Shops (Combined Order)"
        : orderData.Shop?.name || "Unknown Shop";

      // Create detailed reason for the refund
      refundReason = `Refund for items not found during shopping at ${shopName}. `;

      if (isReelOrder) {
        // For reel orders, we don't have individual items, so just use the product name
        refundReason += `Reel order: ${
          orderData.Reel?.Restaurant?.name || "Unknown Restaurant"
        }. `;
      } else if (hasCombinedOrders) {
        // For combined orders, list all shops and their items
        const allShops = allOrdersInBatch.map(order =>
          `${order.Shop?.name || "Unknown Shop"} (${order.OrderID})`
        ).join(", ");
        refundReason += `Combined orders from shops: ${allShops}. `;

        // List all items from all orders
        const allItems = allOrdersInBatch.flatMap(order =>
          order.Order_Items?.map((item: any) =>
            `${item.Product.ProductName?.name || "Unknown Product"} (${
              item.quantity
            }) from ${order.Shop?.name || "Unknown Shop"}`
          ) || []
        ).join(", ");
        if (allItems) {
          refundReason += `Order items: ${allItems}. `;
        }
      } else {
        // List all order items for regular single orders
        const allItems = orderData.Order_Items.map(
          (item: any) =>
            `${item.Product.ProductName?.name || "Unknown Product"} (${
              item.quantity
            })`
        ).join(", ");
        refundReason += `Order items: ${allItems}. `;
      }

      refundReason += `Original total: ${totalOrderValue}, found items total: ${formattedOrderAmount}, refund amount: ${refundAmount}.`;
    }

    // Handle refund creation first if needed
    if (refundNeeded && refundAmount > 0) {
      try {
        // Check if refund already exists for this order
        const existingRefundResponse = await hasuraClient.request<{
          Refunds: Array<{
            id: string;
            amount: string;
            order_id: string;
            status: string;
            reason: string;
            generated_by: string;
            paid: boolean;
          }>;
        }>(CHECK_EXISTING_REFUND, {
          order_id: orderId,
        });

        if (
          existingRefundResponse.Refunds &&
          existingRefundResponse.Refunds.length > 0
        ) {
          // Refund already exists, use the existing one
          refundData = existingRefundResponse.Refunds[0];
        } else {
          // Create new refund record with all required fields
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
        }
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
    // For combined orders, use the batch total; otherwise use the individual order amount
    const originalAmount = hasCombinedOrders
      ? batchTotal
      : (originalOrderTotal || formattedOrderAmount);

    console.log("🔍 Backend: Wallet update calculation:");
    console.log("🔍 Backend: hasCombinedOrders:", hasCombinedOrders);
    console.log("🔍 Backend: batchTotal:", batchTotal);
    console.log("🔍 Backend: originalOrderTotal:", originalOrderTotal);
    console.log("🔍 Backend: formattedOrderAmount:", formattedOrderAmount);
    console.log("🔍 Backend: originalAmount to deduct:", originalAmount);

    const newReserved = currentReserved - originalAmount;

    console.log("🔍 BACKEND: ===== WALLET UPDATE CALCULATION =====");
    console.log("🔍 BACKEND: hasCombinedOrders:", hasCombinedOrders);
    console.log("🔍 BACKEND: batchTotal:", batchTotal);
    console.log("🔍 BACKEND: originalOrderTotal:", originalOrderTotal);
    console.log("🔍 BACKEND: formattedOrderAmount:", formattedOrderAmount);
    console.log("🔍 BACKEND: Current reserved balance:", currentReserved);
    console.log("🔍 BACKEND: Amount to deduct:", originalAmount);
    console.log("🔍 BACKEND: New reserved balance will be:", newReserved);

    // Update the wallet balances
    console.log("🔍 BACKEND: Executing wallet update...");
    const updateResult = await hasuraClient.request(UPDATE_WALLET_BALANCES, {
      wallet_id: walletId,
      reserved_balance: newReserved.toString(),
    });
    console.log("🔍 BACKEND: Wallet update result:", updateResult);
    console.log("🔍 BACKEND: Wallet update completed successfully");

    // Create wallet transaction records for the payment
    // Note: Wallet_Transactions table is designed for regular orders only
    // For reel orders, we skip creating wallet transactions to avoid foreign key constraint issues
    if (!isReelOrder) {
      // Build description with MoMo payment details
      let baseDescription = `Payment from reserved balance for found order items. MoMo Code: ${momoCode}`;

      if (momoReferenceId && momoSuccess !== undefined) {
        const momoStatus = momoSuccess ? "SUCCESSFUL" : "FAILED";
        baseDescription += ` | MoMo Payment: ${momoStatus} | Reference ID: ${momoReferenceId}`;
      }

      const transactions = [];

      if (hasCombinedOrders) {
        // For combined orders, create transactions for each order in the batch
        for (const order of allOrdersInBatch) {
          const orderAmount = parseFloat(order.total);
          transactions.push({
            wallet_id: walletId,
            amount: orderAmount.toFixed(2),
            type: "payment",
            status: "completed",
            related_order_id: order.id,
            related_reel_orderId: null,
            related_restaurant_order_id: null,
            description: `${baseDescription} | Combined Order Batch - Order ${order.OrderID}`,
          });
        }
      } else {
        // For single orders, create one transaction
        transactions.push({
          wallet_id: walletId,
          amount: formattedOrderAmount.toFixed(2),
          type: "payment",
          status: "completed",
          related_order_id: orderId,
          related_reel_orderId: null,
          related_restaurant_order_id: null,
          description: baseDescription,
        });
      }

      const transactionResponse = await hasuraClient.request(
        CREATE_WALLET_TRANSACTIONS,
        {
          transactions,
        }
      );
    } else {
      // Skipping wallet transaction creation for reel order to avoid foreign key constraint issues
    }

    const responseData = {
      success: true,
      message: hasCombinedOrders
        ? "Combined orders payment processed successfully"
        : "Payment processed successfully",
      paymentDetails: {
        orderId,
        amount: formattedOrderAmount,
        originalTotal: originalOrderTotal,
        batchTotal: hasCombinedOrders ? batchTotal : undefined,
        combinedOrdersCount: hasCombinedOrders ? allOrdersInBatch.length : undefined,
        timestamp: new Date().toISOString(),
      },
      walletUpdate: {
        oldReservedBalance: currentReserved,
        newReservedBalance: newReserved,
        deductedAmount: originalAmount,
      },
      refund: refundData,
      refundAmount: refundAmount,
    };

    console.log("🔍 Backend: Sending response:", responseData);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
