import { gql } from "graphql-request";
import { hasuraClient } from "./hasuraClient";

// Helper to determine if code is running on client or server
const isClient = typeof window !== 'undefined';

// GraphQL mutation to create wallet transactions
const CREATE_WALLET_TRANSACTIONS = gql`
  mutation createMultipleWalletTransactions(
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
      }
      affected_rows
    }
  }
`;

// GraphQL mutation to update wallet balances
const UPDATE_WALLET_BALANCES = gql`
  mutation UpdateWalletBalances($wallet_id: uuid!, $reserved_balance: String!) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }, 
      _set: { 
        reserved_balance: $reserved_balance 
      }
    ) {
      id
      reserved_balance
    }
  }
`;

// GraphQL query to get wallet information
const GET_WALLET_BY_SHOPPER_ID = gql`
  query GetWalletByShopperId($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
      reserved_balance
      shopper_id
    }
  }
`;

// GraphQL query to get order details for invoice
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
      userByUserId {
        name
        email
      }
      Shop {
        name
        address
      }
      Order_Items {
        id
        price
        quantity
        Product {
          name
          price
          measurement_unit
        }
      }
    }
  }
`;

// Function to record wallet transactions
export const recordPaymentTransactions = async (
  shopperId: string,
  orderId: string,
  orderAmount: number
) => {
  try {
    // On client-side, use the API route instead of direct Hasura access
    if (isClient) {
      const response = await fetch("/api/shopper/recordTransaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shopperId,
          orderId,
          orderAmount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to record transaction");
      }

      return await response.json();
    }
    
    // Server-side implementation
    if (!hasuraClient) {
      throw new Error("Hasura client is not available on the client side");
    }

    // Get wallet information
    const walletResponse = await hasuraClient.request<{
      Wallets: Array<{
        id: string;
        available_balance: string;
        reserved_balance: string;
      }>;
    }>(GET_WALLET_BY_SHOPPER_ID, {
      shopper_id: shopperId,
    });

    if (!walletResponse.Wallets || walletResponse.Wallets.length === 0) {
      throw new Error("Wallet not found for this shopper");
    }

    const wallet = walletResponse.Wallets[0];
    const walletId = wallet.id;
    
    // Calculate new reserved balance
    const currentReserved = parseFloat(wallet.reserved_balance);
    
    // The reserved balance should be sufficient for the order amount
    if (currentReserved < orderAmount) {
      throw new Error("Insufficient reserved balance");
    }
    
    // Calculate the new reserved balance after deducting only the order amount 
    // (excluding service fee and delivery fee which were already added to available balance)
    const newReserved = currentReserved - orderAmount;
    console.log(`Updating reserved balance: ${currentReserved} - ${orderAmount} = ${newReserved}`);

    // Update the wallet balances - only change the reserved balance
    await hasuraClient.request(UPDATE_WALLET_BALANCES, {
      wallet_id: walletId,
      reserved_balance: newReserved.toString(),
    });

    // Create wallet transaction records
    const transactions = [
      {
        wallet_id: walletId,
        amount: orderAmount.toFixed(2),
        type: "payment",
        status: "completed",
        related_order_id: orderId,
        description: "Payment for found order items (excluding service and delivery fees)",
      },
    ];

    const response = await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });

    return {
      transactionResponse: response,
      newBalance: {
        reserved: newReserved
      }
    };
  } catch (error) {
    console.error("Error recording wallet transactions:", error);
    throw error;
  }
};

// Function to generate invoice
export const generateInvoice = async (orderId: string) => {
  try {
    // On client-side, use the API route instead of direct Hasura access
    if (isClient) {
      const response = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate invoice");
      }

      const data = await response.json();
      return data.invoice;
    }
    
    // Server-side implementation
    if (!hasuraClient) {
      throw new Error("Hasura client is not available on the client side");
    }

    // Get order details for invoice
    const orderDetails = await hasuraClient.request<{
      Orders_by_pk: {
        id: string;
        OrderID: string;
        status: string;
        total: number;
        service_fee: string;
        delivery_fee: string;
        created_at: string;
        updated_at: string;
        userByUserId: {
          name: string;
          email: string;
        };
        Shop: {
          name: string;
          address: string;
        };
        Order_Items: Array<{
          id: string;
          price: number;
          quantity: number;
          Product: {
            name: string;
            price: number;
            measurement_unit?: string;
          };
        }>;
      };
    }>(GET_ORDER_DETAILS_FOR_INVOICE, {
      order_id: orderId,
    });

    if (!orderDetails.Orders_by_pk) {
      throw new Error("Order not found");
    }

    const order = orderDetails.Orders_by_pk;
    
    // Calculate totals
    // Use the actual items from the order and calculate based on quantities 
    const items = order.Order_Items;
    const itemsTotal = items.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    const serviceFee = parseFloat(order.service_fee);
    const deliveryFee = parseFloat(order.delivery_fee);
    
    // Generate invoice data that matches what's shown in the Order Summary
    const invoiceData = {
      invoiceNumber: `INV-${order.OrderID}-${new Date().getTime().toString().slice(-6)}`,
      orderId: order.id,
      orderNumber: order.OrderID,
      customer: order.userByUserId.name,
      customerEmail: order.userByUserId.email,
      shop: order.Shop.name,
      shopAddress: order.Shop.address,
      dateCreated: new Date(order.created_at).toLocaleString(),
      dateCompleted: new Date(order.updated_at).toLocaleString(),
      status: order.status,
      items: items.map(item => ({
        name: item.Product.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: parseFloat(item.price) * item.quantity,
        unit: item.Product.measurement_unit || 'item'
      })),
      subtotal: itemsTotal,
      serviceFee,
      deliveryFee,
      // When in shopping mode, the displayed total should match the subtotal without fees
      // For other modes, include the fees
      total: order.status === "shopping" ? itemsTotal : (itemsTotal + serviceFee + deliveryFee)
    };

    return invoiceData;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw error;
  }
}; 