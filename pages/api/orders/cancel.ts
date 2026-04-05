import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_ORDER = gql`
  query GetOrder($id: uuid!) {
    Orders_by_pk(id: $id) {
      id
      total
      service_fee
      delivery_fee
      status
      user_id
      shopper_id
    }
  }
`;

const GET_REEL_ORDER = gql`
  query GetReelOrder($id: uuid!) {
    reel_orders_by_pk(id: $id) {
      id
      total
      service_fee
      delivery_fee
      status
      user_id
      shopper_id
    }
  }
`;

const GET_RESTAURANT_ORDER = gql`
  query GetRestaurantOrder($id: uuid!) {
    restaurant_orders_by_pk(id: $id) {
      id
      total
      service_fee
      delivery_fee
      status
      user_id
      shopper_id
    }
  }
`;

const GET_PACKAGE_ORDER = gql`
  query GetPackageOrder($id: uuid!) {
    package_delivery_by_pk(id: $id) {
      id
      delivery_fee
      status
      user_id
      shopper_id
    }
  }
`;

const UPDATE_ORDER_STATUS = (table: string) => gql`
  mutation UpdateOrderStatus($id: uuid!, $status: String!) {
    update_${table}_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: "now()" }) {
      id
      status
    }
  }
`;

const GET_USER_WALLET = gql`
  query GetUserWallet($user_id: uuid!) {
    personalWallet(where: { user_id: { _eq: $user_id } }) {
      id
      balance
    }
  }
`;

const UPDATE_USER_WALLET = gql`
  mutation UpdateUserWallet($user_id: uuid!, $balance: String!) {
    update_personalWallet_by_pk(
      pk_columns: { user_id: $user_id }
      _set: { balance: $balance, updated_at: "now()" }
    ) {
      id
      balance
    }
  }
`;

const GET_SHOPPER_WALLET = gql`
  query GetShopperWallet($shopper_id: uuid!) {
    Wallets(where: { shopper_id: { _eq: $shopper_id } }) {
      id
      available_balance
    }
  }
`;

const UPDATE_SHOPPER_WALLET = gql`
  mutation UpdateShopperWallet($wallet_id: uuid!, $available_balance: String!) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { available_balance: $available_balance, last_updated: "now()" }
    ) {
      id
      available_balance
    }
  }
`;

const CREATE_REFUND_RECORD = gql`
  mutation CreateRefundRecord($object: Refunds_insert_input!) {
    insert_Refunds_one(object: $object) {
      id
    }
  }
`;

const CREATE_SHOPPER_TRANSACTION = gql`
  mutation CreateShopperTransaction($object: Wallet_Transactions_insert_input!) {
    insert_Wallet_Transactions_one(object: $object) {
      id
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!hasuraClient) {
    return res.status(500).json({ error: "Hasura client not initialized" });
  }

  const session = (await getServerSession(req, res, authOptions as any)) as any;
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId, orderType } = req.body;
  if (!orderId || !orderType) {
    return res.status(400).json({ error: "Missing orderId or orderType" });
  }

  try {
    let order: any;
    let table: string;

    // 1. Fetch order details based on type
    switch (orderType) {
      case "regular":
        order = (await hasuraClient.request<any>(GET_ORDER, { id: orderId })).Orders_by_pk;
        table = "Orders";
        break;
      case "reel":
        order = (await hasuraClient.request<any>(GET_REEL_ORDER, { id: orderId })).reel_orders_by_pk;
        table = "reel_orders";
        break;
      case "restaurant":
        order = (await hasuraClient.request<any>(GET_RESTAURANT_ORDER, { id: orderId })).restaurant_orders_by_pk;
        table = "restaurant_orders";
        break;
      case "package":
        order = (await hasuraClient.request<any>(GET_PACKAGE_ORDER, { id: orderId })).package_delivery_by_pk;
        table = "package_delivery";
        break;
      default:
        return res.status(400).json({ error: "Invalid order type" });
    }

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // 2. Validate ownership and status
    if (order.user_id !== session.user.id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const currentStatus = order.status.toUpperCase();
    if (currentStatus !== "PENDING" && currentStatus !== "ACCEPTED") {
      return res.status(400).json({ error: `Cannot cancel order in ${currentStatus} status` });
    }

    // 3. Calculate refund and payout
    const total = parseFloat(order.total || order.delivery_fee || "0");
    const deliveryFee = parseFloat(order.delivery_fee || "0");
    const serviceFee = parseFloat(order.service_fee || "0");
    const totalFees = deliveryFee + serviceFee;
    const subtotal = total - totalFees;

    let userRefundAmount = 0;
    let shopperPayoutAmount = 0;

    if (currentStatus === "PENDING") {
      userRefundAmount = total;
      shopperPayoutAmount = 0;
    } else if (currentStatus === "ACCEPTED") {
      userRefundAmount = subtotal + (0.7 * totalFees);
      shopperPayoutAmount = 0.3 * totalFees;
    }

    // 4. Perform Updates
    // A. Update Order Status
    await hasuraClient.request(UPDATE_ORDER_STATUS(table), { id: orderId, status: "CANCELLED" });

    // B. Refund User
    if (userRefundAmount > 0) {
      const walletData = await hasuraClient.request<any>(GET_USER_WALLET, { user_id: order.user_id });
      const wallet = walletData.personalWallet?.[0];
      if (wallet) {
        const newBalance = (parseFloat(wallet.balance) + userRefundAmount).toFixed(2);
        await hasuraClient.request(UPDATE_USER_WALLET, { user_id: order.user_id, balance: newBalance });
        
        // Record refund
        await hasuraClient.request(CREATE_REFUND_RECORD, {
          object: {
            user_id: order.user_id,
            order_id: orderType === 'regular' ? orderId : null,
            reel_order_id: orderType === 'reel' ? orderId : null,
            restaurant_order_id: orderType === 'restaurant' ? orderId : null,
            package_delivery_id: orderType === 'package' ? orderId : null,
            amount: userRefundAmount.toString(),
            status: "COMPLETED",
            reason: `Order cancelled by user (${currentStatus})`,
            paid: true,
            generated_by: "System"
          }
        });
      }
    }

    // C. Payout Shopper
    if (shopperPayoutAmount > 0 && order.shopper_id) {
      const shopperWalletData = await hasuraClient.request<any>(GET_SHOPPER_WALLET, { shopper_id: order.shopper_id });
      const shopperWallet = shopperWalletData.Wallets?.[0];
      if (shopperWallet) {
        const newBalance = (parseFloat(shopperWallet.available_balance) + shopperPayoutAmount).toFixed(2);
        await hasuraClient.request(UPDATE_SHOPPER_WALLET, { wallet_id: shopperWallet.id, available_balance: newBalance });

        // Record payout
        await hasuraClient.request(CREATE_SHOPPER_TRANSACTION, {
          object: {
            wallet_id: shopperWallet.id,
            amount: shopperPayoutAmount.toFixed(2),
            currency: "RWF",
            type: "earnings",
            status: "completed",
            related_order_id: orderType === 'regular' ? orderId : null,
            related_reel_orderId: orderType === 'reel' ? orderId : null,
            related_restaurant_order_id: orderType === 'restaurant' ? orderId : null,
            description: `Compensation for cancelled order (${orderId})`
          }
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      refundAmount: userRefundAmount,
      shopperPayout: shopperPayoutAmount
    });

  } catch (error: any) {
    console.error("Cancellation error:", error);
    return res.status(500).json({ error: error.message || "Failed to cancel order" });
  }
}
