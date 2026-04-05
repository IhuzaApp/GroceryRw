import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: uuid!) {
    Orders_by_pk(id: $id) {
      id
      user_id
      total
      status
    }
  }
`;

const GET_WALLET_BALANCE = gql`
  query GetPersonalWalletBalance($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
    }
  }
`;

const UPDATE_WALLET_BALANCE = gql`
  mutation UpdatePersonalWalletBalance($id: uuid!, $balance: String!) {
    update_personalWallet(
      where: { id: { _eq: $id } }
      _set: { balance: $balance, updated_at: "now()" }
    ) {
      affected_rows
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: uuid!, $status: String!) {
    update_Orders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
      id
    }
  }
`;

const UPDATE_COMBINED_ORDER_STATUS = gql`
  mutation UpdateCombinedOrderStatus($combined_id: uuid!, $status: String!) {
    update_Orders(
      where: { combined_order_id: { _eq: $combined_id } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`;

const INSERT_ORDER_TRANSACTION = gql`
  mutation InsertOrderTransaction(
    $order_id: uuid!
    $amount: numeric!
    $status: String!
    $user_id: uuid!
    $type: String!
    $wallet_id: uuid
  ) {
    insert_order_transactions_one(
      object: {
        order_id: $order_id
        amount: $amount
        status: $status
        user_id: $user_id
        type: $type
        wallet_id: $wallet_id
      }
    ) {
      id
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const user_id = session.user.id;
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId is required" });
  }

  try {
    if (!hasuraClient) throw new Error("No hasura client");

    // 1. Get Order
    const orderData = await hasuraClient.request<{ Orders_by_pk: any }>(
      GET_ORDER_DETAILS,
      { id: orderId }
    );
    const order = orderData.Orders_by_pk;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.user_id !== user_id) {
      return res.status(403).json({ error: "Not your order" });
    }

    if (order.status !== "AWAITING_PAYMENT") {
      return res.status(400).json({ error: "Order is not awaiting payment" });
    }

    const orderTotal = parseFloat(order.total || "0");

    // 2. Get Wallet Balance
    const walletData = await hasuraClient.request<{ personalWallet: any[] }>(
      GET_WALLET_BALANCE,
      { user_id }
    );
    const wallet = walletData.personalWallet?.[0];

    if (!wallet) {
      return res.status(400).json({ error: "Wallet not found" });
    }

    const currentBalance = parseFloat(wallet.balance || "0");
    if (currentBalance < orderTotal) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    const newBalance = (currentBalance - orderTotal).toFixed(2);

    // 3. Deduct Wallet
    await hasuraClient.request(UPDATE_WALLET_BALANCE, {
      id: wallet.id,
      balance: newBalance,
    });

    // 4. Update Order Status
    await hasuraClient.request(UPDATE_ORDER_STATUS, {
      id: orderId,
      status: "PENDING",
    });

    // Also update combined if needed
    await hasuraClient.request(UPDATE_COMBINED_ORDER_STATUS, {
      combined_id: orderId,
      status: "PENDING",
    });

    // 5. Record Transaction
    await hasuraClient.request(INSERT_ORDER_TRANSACTION, {
      order_id: orderId,
      amount: orderTotal,
      status: "SUCCESSFUL",
      user_id: user_id,
      type: "PAYMENT",
      wallet_id: wallet.id,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Wallet payment error:", error);
    return res.status(500).json({ error: error.message || "Payment failed" });
  }
}
