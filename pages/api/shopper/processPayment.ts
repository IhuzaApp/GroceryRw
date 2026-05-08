import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { formatCurrency } from "../../../src/lib/formatCurrency";
import { sendSMS } from "../../../src/lib/pindo";
import { logger } from "../../../src/utils/logger";

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
        found
        foundQuantity
        Product {
          id
          name
          price
          final_price
          ProductName {
            name
          }
        }
      }
    }
  }
`;

const GET_USER_PHONE = gql`
  query GetUserPhone($id: uuid!) {
    Users_by_pk(id: $id) {
      phone
    }
  }
`;

const GET_SHOP_DETAILS = gql`
  query GetShopDetails($id: uuid!) {
    shops_by_pk(id: $id) {
      name
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

// GraphQL query to get system configuration for fees
const GET_SYSTEM_CONFIG_FOR_FEES = gql`
  query GetSystemConfig {
    System_configuratioins(limit: 1) {
      deliveryCommissionPercentage
    }
  }
`;

// GraphQL mutation to update wallet balances
const UPDATE_WALLET_BALANCES = gql`
  mutation UpdateWalletBalances(
    $wallet_id: uuid!
    $reserved_balance: String!
    $available_balance: String!
  ) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: {
        reserved_balance: $reserved_balance
        available_balance: $available_balance
      }
    ) {
      id
      reserved_balance
      available_balance
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
        amount
        type
        status
        created_at
        wallet_id
        related_order_id
        reference_id
        phone
        currency
      }
      affected_rows
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
      found: boolean;
      foundQuantity: number;
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
      isSameShopCombined,
      combinedOrders,
    } = req.body;

    // Validate required fields
    if (!orderId || !momoCode || !privateKey || orderAmount === undefined) {
      return res.status(400).json({
        error: "Missing required fields",
        details: {
          orderId: !!orderId,
          momoCode: !!momoCode,
          privateKey: !!privateKey,
          orderAmount: orderAmount !== undefined,
        },
      });
    }

    // Format order amount to ensure consistent handling
    const formattedOrderAmount = parseFloat(Number(orderAmount).toFixed(2));

    // Get the order details to verify it exists and get associated data
    if (!hasuraClient) {
      return res.status(500).json({ error: "Database client not available" });
    }

    let orderData: any = null;
    let isReelOrder = orderType === "reel";
    let allOrdersInBatch: any[] = [];
    let batchTotal = 0;
    let hasCombinedOrders = false;

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

      // Check if this order has combined orders
      allOrdersInBatch = [orderData];
      batchTotal = parseFloat(orderData.total);

      if (orderData.combined_order_id) {
        hasCombinedOrders = true;
        // Fetch all orders with the same combined_order_id
        const combinedOrdersResponse = await hasuraClient.request<{
          Orders: any[];
        }>(GET_COMBINED_ORDERS, {
          combined_order_id: orderData.combined_order_id,
        });

        if (
          combinedOrdersResponse.Orders &&
          combinedOrdersResponse.Orders.length > 0
        ) {
          allOrdersInBatch = combinedOrdersResponse.Orders;

          // Verify that the order being paid for exists in the batch
          const orderExistsInBatch = allOrdersInBatch.some(
            (order) => order.id === orderId
          );
          if (!orderExistsInBatch) {
            return res.status(400).json({
              error: `Order ${orderId} not found in combined orders batch with combined_order_id ${orderData.combined_order_id}`,
            });
          }

          const storedTotalSum = allOrdersInBatch.reduce(
            (sum, order) => sum + parseFloat(order.total),
            0
          );

          if (isSameShopCombined) {
            batchTotal = formattedOrderAmount;
          } else {
            batchTotal = storedTotalSum;
          }
        }
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

    let refundsData: any[] = [];
    let totalRefundAmount = 0;

    // Logic: Calculate refund based on missing items' final_price
    const calculateOrderRefund = async (
      order: any,
      paidAmount: number,
      origTotal?: number
    ) => {
      let refund = 0;
      const originalTotal = origTotal || parseFloat(order.total);

      // Calculate missing items' final_price
      order.Order_Items?.forEach((item: any) => {
        const quantity = item.quantity || 0;
        const foundQuantity = item.found ? item.foundQuantity ?? quantity : 0;
        const missingQuantity = Math.max(0, quantity - foundQuantity);

        if (missingQuantity > 0) {
          const finalPrice = parseFloat(
            item.Product?.final_price || item.price || "0"
          );
          refund += missingQuantity * finalPrice;
        }
      });

      refund = parseFloat(refund.toFixed(2));
      const amountUsed = parseFloat((originalTotal - refund).toFixed(2));

      if (refund > 0) {
        try {
          // 1. Get customer phone number
          const customerData = await hasuraClient!.request<{
            Users_by_pk: { phone: string } | null;
          }>(GET_USER_PHONE, { id: order.user_id });

          const customerPhone = customerData.Users_by_pk?.phone;

          // 2. Get shop name
          const shopName = order.Shop?.name || "Merchant";

          if (customerPhone) {
            const message = `Plas Pay: Your order #${
              order.OrderID
            } from ${shopName} has been processed. Total used: RWF ${amountUsed.toLocaleString()}. Refund of RWF ${refund.toLocaleString()} has been credited to your wallet for items not found.`;

            await sendSMS(customerPhone, message);
            console.log(
              `[Customer Refund SMS] Sent to ${customerPhone}: ${message}`
            );
          }
        } catch (smsError) {
          console.error(
            "[Customer Refund SMS] Error sending notification:",
            smsError
          );
          await logger.warn(
            `Failed to send customer refund SMS for order ${order.OrderID}: ${
              smsError instanceof Error ? smsError.message : String(smsError)
            }`,
            "CustomerNotification"
          );
        }

        // Record the refund transaction via internal API
        try {
          await fetch(
            `${process.env.NEXTAUTH_URL}/api/shopper/recordTransaction`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                shopperId: order.shopper_id,
                orderId: order.id,
                orderAmount: paidAmount, // What shopper actually paid
                originalOrderTotal: originalTotal, // What customer originally paid
                type: "refund",
              }),
            }
          );
        } catch (recordError) {
          console.error("Error calling recordTransaction:", recordError);
        }
      }

      return {
        refundAmount: refund,
        amountUsed,
        refundReason: `Refund of RWF ${refund.toLocaleString()} for items not found in order #${
          order.OrderID
        }.`,
      };
    };

    if (hasCombinedOrders && !isReelOrder) {
      if (!isSameShopCombined) {
        const currentOrder = allOrdersInBatch.find(
          (order) => order.id === orderId
        );
        if (currentOrder) {
          const result = await calculateOrderRefund(
            currentOrder,
            formattedOrderAmount,
            originalOrderTotal
          );
          totalRefundAmount = result.refundAmount;

          if (totalRefundAmount > 0) {
            refundsData.push({
              order_id: currentOrder.id,
              amount: totalRefundAmount.toString(),
              reason: result.refundReason,
              user_id: currentOrder.user_id,
              status: "pending",
              generated_by: "System",
              paid: false,
            });
          }
        }
      }
    } else {
      // Single order or Reel order
      const result = await calculateOrderRefund(
        orderData,
        formattedOrderAmount,
        originalOrderTotal
      );
      totalRefundAmount = result.refundAmount;

      if (totalRefundAmount > 0) {
        refundsData.push({
          order_id: orderId,
          amount: totalRefundAmount.toString(),
          reason: result.refundReason,
          user_id: orderData.user_id,
          status: "pending",
          generated_by: "System",
          paid: false,
        });
      }
    }

    // Handle refund creation for each refund in the array
    let createdRefunds: any[] = [];

    for (const refundRecord of refundsData) {
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
          order_id: refundRecord.order_id,
        });

        if (
          existingRefundResponse.Refunds &&
          existingRefundResponse.Refunds.length > 0
        ) {
          // Refund already exists, use the existing one
          createdRefunds.push(existingRefundResponse.Refunds[0]);
          console.log(
            `Refund already exists for order ${refundRecord.order_id}`
          );
        } else {
          // Create new refund record
          const refundResponse = await hasuraClient.request<RefundResponse>(
            CREATE_REFUND,
            {
              refund: refundRecord,
            }
          );

          if (!refundResponse || !refundResponse.insert_Refunds_one) {
            throw new Error(
              `Refund creation failed for order ${refundRecord.order_id}: Empty response from database`
            );
          }

          createdRefunds.push(refundResponse.insert_Refunds_one);
          console.log(
            `Created refund for order ${refundRecord.order_id}: ${refundResponse.insert_Refunds_one.amount}`
          );
        }
      } catch (refundError) {
        console.error(
          `Error creating refund for order ${refundRecord.order_id}:`,
          refundError
        );
        // Add more detailed error logging to help diagnose the issue
        if (refundError instanceof Error) {
          console.error("Error message:", refundError.message);
          console.error("Error stack:", refundError.stack);
        }
        // Fail the entire transaction if refund creation fails
        throw new Error(
          `Failed to create refund for order ${refundRecord.order_id}: ${
            refundError instanceof Error ? refundError.message : "Unknown error"
          }`
        );
      }
    }

    // Only proceed with wallet updates if we've successfully created the refund (if needed)
    // or if no refund was needed

    // Calculate the new reserved balance after deducting the full original amount
    // For same-shop combined orders, use the batch total; for different-shop combined orders,
    // use the specific order amount; otherwise use the individual order amount
    const originalAmount =
      hasCombinedOrders && isSameShopCombined
        ? batchTotal
        : originalOrderTotal || formattedOrderAmount;

    let newReserved = currentReserved;
    let newAvailable = parseFloat(wallet.available_balance);

    if (isSameShopCombined && hasCombinedOrders) {
      // SAME SHOP COMBINED ORDERS: Special wallet handling

      // 1. Remove found items amount from reserved balance
      // NOTE: Earnings are NOT added here - they will be added when orders are delivered
      newReserved = currentReserved - formattedOrderAmount;
    } else if (hasCombinedOrders && !isSameShopCombined) {
      // DIFFERENT SHOP COMBINED ORDERS: Process payment for specific order only
      // Find the specific order being paid for
      const currentOrder = allOrdersInBatch.find(
        (order) => order.id === orderId
      );

      if (!currentOrder) {
        return res
          .status(404)
          .json({ error: "Order not found in combined orders batch" });
      }

      // For different-shop combined orders, only deduct the specific order amount
      // Use originalOrderTotal if provided (for refund calculation), otherwise use formattedOrderAmount
      const orderOriginalTotal =
        originalOrderTotal || parseFloat(currentOrder.total);

      // Deduct the original order total from reserved balance
      // (The found items amount is already accounted for in formattedOrderAmount)
      // NOTE: Earnings are NOT added here - they will be added when orders are delivered
      newReserved = currentReserved - orderOriginalTotal;
    } else {
      // SINGLE ORDERS: Use existing logic
      newReserved = currentReserved - originalAmount;
    }

    // Update the wallet balances
    const updateResult = await hasuraClient.request(UPDATE_WALLET_BALANCES, {
      wallet_id: walletId,
      reserved_balance: newReserved.toString(),
      available_balance: newAvailable.toString(),
    });

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
        if (isSameShopCombined) {
          // For same-shop combined orders, create one transaction for the entire batch
          // Individual per-order transactions would require individual found amounts which aren't available during payment
          transactions.push({
            wallet_id: walletId,
            amount: formattedOrderAmount.toFixed(2),
            currency: "RWF",
            reference_id: momoReferenceId || null,
            phone: momoCode || null,
            type: "payment",
            status: "completed",
            related_order_id: orderId, // Primary order ID for the batch
            related_reel_orderId: null,
            related_restaurant_order_id: null,
            description: `${baseDescription} | Same-Shop Combined Order Batch (${allOrdersInBatch.length} orders)`,
          });
        } else {
          // For different-shop combined orders, create transaction only for the specific order being paid for
          transactions.push({
            wallet_id: walletId,
            amount: formattedOrderAmount.toFixed(2),
            currency: "RWF",
            reference_id: momoReferenceId || null,
            phone: momoCode || null,
            type: "payment",
            status: "completed",
            related_order_id: orderId,
            related_reel_orderId: null,
            related_restaurant_order_id: null,
            description: `${baseDescription} | Different-Shop Combined Order - Order ${orderData.OrderID}`,
          });
        }
      } else {
        // For single orders, create one transaction
        transactions.push({
          wallet_id: walletId,
          amount: formattedOrderAmount.toFixed(2),
          currency: "RWF",
          reference_id: momoReferenceId || null,
          phone: momoCode || null,
          type: "payment",
          status: "completed",
          related_order_id: orderId,
          related_reel_orderId: null,
          related_restaurant_order_id: null,
          description: baseDescription,
        });
      }

      // Add refund transactions if items were not found during payment
      // This applies to all order types (regular, combined, reel, restaurant)
      if (totalRefundAmount > 0 && createdRefunds.length > 0) {
        // Create refund wallet transactions for each refund
        for (const refund of createdRefunds) {
          transactions.push({
            wallet_id: walletId,
            amount: refund.amount,
            currency: "RWF",
            type: "refund",
            status: "completed",
            related_order_id: refund.order_id,
            related_reel_orderId: null,
            related_restaurant_order_id: null,
            description: `Refund for items not found: ${
              refund.reason || "Items not available during shopping"
            }`,
          });
        }
      }

      const transactionResponse = await hasuraClient.request(
        CREATE_WALLET_TRANSACTIONS,
        {
          transactions,
        }
      );
    } else {
      // For reel orders, create refund transactions if items were not found
      // Note: Reel orders don't create payment transactions due to foreign key constraints,
      // but we can still create refund transactions if needed
      if (totalRefundAmount > 0 && createdRefunds.length > 0) {
        const refundTransactions = createdRefunds.map((refund) => ({
          wallet_id: walletId,
          amount: refund.amount,
          currency: "RWF",
          type: "refund",
          status: "completed",
          related_order_id: refund.order_id,
          related_reel_orderId: null,
          related_restaurant_order_id: null,
          description: `Refund for items not found: ${
            refund.reason || "Items not available during shopping"
          }`,
        }));

        await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
          transactions: refundTransactions,
        });
      }
      // Skipping wallet transaction creation for reel order payment to avoid foreign key constraint issues
    }

    // NOTE: Earnings are NOT added to available balance during payment
    // Earnings will be added when orders are delivered via handleDeliveredOperation
    const feesAddedToAvailable = 0;

    const responseData = {
      success: true,
      message: isSameShopCombined
        ? "Same-shop combined orders payment processed successfully"
        : hasCombinedOrders && !isSameShopCombined
        ? "Different-shop combined order payment processed successfully"
        : hasCombinedOrders
        ? "Combined orders payment processed successfully"
        : "Payment processed successfully",
      paymentDetails: {
        orderId,
        amount: formattedOrderAmount,
        originalTotal: originalOrderTotal,
        batchTotal:
          hasCombinedOrders && isSameShopCombined ? batchTotal : undefined,
        combinedOrdersCount: hasCombinedOrders
          ? allOrdersInBatch.length
          : undefined,
        isSameShopCombined: isSameShopCombined,
        isDifferentShopCombined: hasCombinedOrders && !isSameShopCombined,
        timestamp: new Date().toISOString(),
      },
      walletUpdate: {
        oldReservedBalance: currentReserved,
        newReservedBalance: newReserved,
        oldAvailableBalance: parseFloat(wallet.available_balance),
        newAvailableBalance: newAvailable,
        deductedAmount: isSameShopCombined
          ? formattedOrderAmount
          : hasCombinedOrders && !isSameShopCombined
          ? originalOrderTotal || formattedOrderAmount
          : originalAmount,
        feesAddedToAvailable: feesAddedToAvailable,
      },
      refunds: createdRefunds,
      totalRefundAmount: totalRefundAmount,
    };

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    });
  }
}
