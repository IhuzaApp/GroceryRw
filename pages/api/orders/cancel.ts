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

const GET_BUSINESS_ORDER = gql`
  query GetBusinessOrder($id: uuid!) {
    businessProductOrders_by_pk(id: $id) {
      id
      total
      service_fee
      transportation_fee
      status
      ordered_by
      shopper_id
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: uuid!, $status: String!) {
    update_Orders_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: "now()" }) {
      id
      status
    }
  }
`;

const UPDATE_REEL_ORDER_STATUS = gql`
  mutation UpdateReelOrderStatus($id: uuid!, $status: String!) {
    update_reel_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: "now()" }) {
      id
      status
    }
  }
`;

const UPDATE_RESTAURANT_ORDER_STATUS = gql`
  mutation UpdateRestaurantOrderStatus($id: uuid!, $status: String!) {
    update_restaurant_orders_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: "now()" }) {
      id
      status
    }
  }
`;

const UPDATE_PACKAGE_ORDER_STATUS = gql`
  mutation UpdatePackageOrderStatus($id: uuid!, $status: String!) {
    update_package_delivery_by_pk(pk_columns: { id: $id }, _set: { status: $status, updated_at: "now()" }) {
      id
      status
    }
  }
`;

const UPDATE_BUSINESS_ORDER_STATUS = gql`
  mutation UpdateBusinessOrderStatus($id: uuid!, $status: String!) {
    update_businessProductOrders_by_pk(pk_columns: { id: $id }, _set: { status: $status }) {
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
      reserved_balance
    }
  }
`;

const UPDATE_SHOPPER_WALLET = gql`
  mutation UpdateShopperWallet($wallet_id: uuid!, $available_balance: String!, $reserved_balance: String!) {
    update_Wallets_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { 
        available_balance: $available_balance, 
        reserved_balance: $reserved_balance, 
        last_updated: "now()" 
      }
    ) {
      id
      available_balance
      reserved_balance
    }
  }
`;

const UPSERT_REFUND_RECORD = gql`
  mutation UpsertRefundRecord($object: Refunds_insert_input!) {
    insert_Refunds_one(
      object: $object
      on_conflict: {
        constraint: Refunds_order_id_key
        update_columns: [amount, status, reason, paid]
      }
    ) {
      id
    }
  }
`;

const CHECK_EXISTING_PERSONAL_TX = gql`
  query CheckExistingPersonalTx($order_suffix: String!) {
    personalWalletTransactions(where: { reference_id: { _like: $order_suffix } }) {
      id
      reference_id
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

const CREATE_PERSONAL_WALLET_TRANSACTION = gql`
  mutation CreatePersonalWalletTransaction($object: personalWalletTransactions_insert_input!) {
    insert_personalWalletTransactions_one(object: $object) {
      id
    }
  }
`;

const CREATE_ORDER_TRANSACTION = gql`
  mutation CreateOrderTransaction($object: order_transactions_insert_input!) {
    insert_order_transactions_one(object: $object) {
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

  const { orderId } = req.body;
  const orderType = (req.body.orderType || "").toLowerCase();
  
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
      case "business":
        order = (await hasuraClient.request<any>(GET_BUSINESS_ORDER, { id: orderId })).businessProductOrders_by_pk;
        table = "businessProductOrders";
        if (order) {
          // Map business fields to standard ones for the rest of the logic
          order.user_id = order.ordered_by;
          order.delivery_fee = order.transportation_fee;
        }
        break;
      default:
        return res.status(400).json({ error: `Invalid order type: ${orderType}` });
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
    const deliveryFee = parseFloat(order.delivery_fee || "0");
    const serviceFee = parseFloat(order.service_fee || "0");
    const totalFees = deliveryFee + serviceFee;
    
    let grandTotal = 0;
    let subtotal = 0;

    if (orderType === "regular") {
      // For regular orders, the 'total' field in the database is the subtotal (items only)
      subtotal = parseFloat(order.total || "0");
      grandTotal = subtotal + totalFees;
    } else {
      // For reel, restaurant, and business, 'total' is the grand total
      grandTotal = parseFloat(order.total || order.delivery_fee || "0");
      subtotal = grandTotal - totalFees;
    }

    let userRefundAmount = 0;
    let shopperPayoutAmount = 0;

    if (currentStatus === "PENDING") {
      userRefundAmount = grandTotal;
      shopperPayoutAmount = 0;
    } else if (currentStatus === "ACCEPTED") {
      userRefundAmount = subtotal + (0.7 * totalFees);
      shopperPayoutAmount = 0.3 * totalFees;
    }

    const refundRef = `REFUND-${orderId.slice(-8)}-${Date.now()}`;
    const payoutRef = `PAYOUT-${orderId.slice(-8)}-${Date.now()}`;

    // ─── STEP A: Mark order as cancelled FIRST ────────────────────────────────
    // This is the idempotency gate. If anything below fails and the user retries,
    // the status check above (PENDING/ACCEPTED) will block further money operations.
    let updateMutation: any;
    let resultKey = "";
    switch (orderType) {
      case "regular": updateMutation = UPDATE_ORDER_STATUS; resultKey = "update_Orders_by_pk"; break;
      case "reel": updateMutation = UPDATE_REEL_ORDER_STATUS; resultKey = "update_reel_orders_by_pk"; break;
      case "restaurant": updateMutation = UPDATE_RESTAURANT_ORDER_STATUS; resultKey = "update_restaurant_orders_by_pk"; break;
      case "package": updateMutation = UPDATE_PACKAGE_ORDER_STATUS; resultKey = "update_package_delivery_by_pk"; break;
      case "business": updateMutation = UPDATE_BUSINESS_ORDER_STATUS; resultKey = "update_businessProductOrders_by_pk"; break;
    }
    const updateResult = await hasuraClient!.request<any>(updateMutation, { id: orderId, status: "cancelled" });
    if (!updateResult[resultKey]) {
      return res.status(404).json({ error: `${orderType} order not found` });
    }

    // ─── STEP B: Refund User ──────────────────────────────────────────────────
    if (userRefundAmount > 0) {
      // Idempotency: skip if already refunded (e.g. previous partial success)
      const orderSuffix = `REFUND-${orderId.slice(-8)}%`;
      const existingTx = await hasuraClient.request<any>(CHECK_EXISTING_PERSONAL_TX, { order_suffix: orderSuffix });
      const alreadyRefunded = existingTx.personalWalletTransactions?.length > 0;

      if (!alreadyRefunded) {
        const walletData = await hasuraClient.request<any>(GET_USER_WALLET, { user_id: order.user_id });
        const wallet = walletData.personalWallet?.[0];
        if (wallet) {
          const newBalance = (parseFloat(wallet.balance) + userRefundAmount).toFixed(2);
          await hasuraClient.request(UPDATE_USER_WALLET, { user_id: order.user_id, balance: newBalance });
          
          // Upsert refund record
          await hasuraClient!.request(UPSERT_REFUND_RECORD, {
            object: {
              user_id: order.user_id,
              order_id: orderType === 'regular' ? orderId : null,
              reel_order_id: orderType === 'reel' ? orderId : null,
              restaurant_order_id: orderType === 'restaurant' ? orderId : null,
              package_id: orderType === 'package' ? orderId : null,
              business_order_id: orderType === 'business' ? orderId : null,
              amount: userRefundAmount.toFixed(0),
              status: "COMPLETED",
              reason: `Order cancelled by user (${currentStatus}) - ${orderType}: ${orderId}`,
              paid: true,
              generated_by: "System"
            }
          });

          // Personal wallet transaction log
          await hasuraClient.request(CREATE_PERSONAL_WALLET_TRANSACTION, {
            object: {
              wallet_id: wallet.id,
              received_wallet: wallet.id,
              amount: userRefundAmount.toString(),
              currency: "RWF",
              action: "Refund",
              status: "Completed",
              doneBy: session.user.id,
              reference_id: refundRef
            }
          });

          // Order transaction log — wallet_id MUST be a personalWallet id (which wallet.id is here)
          await hasuraClient.request(CREATE_ORDER_TRANSACTION, {
            object: {
              user_id: order.user_id,
              wallet_id: wallet.id,
              amount: userRefundAmount.toString(),
              currency: "RWF",
              type: "Refund",
              status: "Completed",
              order_id: orderType === 'regular' ? orderId : null,
              reel_order_id: orderType === 'reel' ? orderId : null,
              restaurant_order_id: orderType === 'restaurant' ? orderId : null,
              package_id: orderType === 'package' ? orderId : null,
              business_order_id: orderType === 'business' ? orderId : null,
              reference_id: refundRef,
              mtn_response: JSON.stringify({ type: "system_refund", reason: "order_cancellation" })
            }
          });
        }
      }
    }

    // ─── STEP C: Payout Shopper ───────────────────────────────────────────────
    if (order.shopper_id) {
      const shopperWalletData = await hasuraClient.request<any>(GET_SHOPPER_WALLET, { shopper_id: order.shopper_id });
      const shopperWallet = shopperWalletData.Wallets?.[0];
      if (shopperWallet) {
        let newAvailable = parseFloat(shopperWallet.available_balance);
        let newReserved = parseFloat(shopperWallet.reserved_balance);
        let updated = false;

        // Payout 30% Earnings (If ACCEPTED)
        if (shopperPayoutAmount > 0) {
          newAvailable += shopperPayoutAmount;
          updated = true;

          // Shopper wallet transaction (Wallet_Transactions — references Wallets.id, not personalWallet)
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
              relate_business_order_id: orderType === 'business' ? orderId : null,
              description: `Compensation for cancelled order (${orderId})`
            }
          });

          // Order transaction log — wallet_id FK references personalWallet, NOT Wallets.
          // Shopper payouts don't have a personalWallet, so we pass null here to avoid the FK violation.
          await hasuraClient.request(CREATE_ORDER_TRANSACTION, {
            object: {
              user_id: session.user.id,
              wallet_id: null,
              amount: shopperPayoutAmount.toFixed(2),
              currency: "RWF",
              type: "Payout",
              status: "Completed",
              order_id: orderType === 'regular' ? orderId : null,
              reel_order_id: orderType === 'reel' ? orderId : null,
              restaurant_order_id: orderType === 'restaurant' ? orderId : null,
              package_id: orderType === 'package' ? orderId : null,
              business_order_id: orderType === 'business' ? orderId : null,
              reference_id: payoutRef,
              mtn_response: JSON.stringify({ type: "system_payout", reason: "order_cancellation_compensation" })
            }
          });
        }

        // Float Reversal (Reels Only - added during assignment)
        if (orderType === "reel" && currentStatus === "ACCEPTED") {
          newReserved -= grandTotal;
          updated = true;

          await hasuraClient.request(CREATE_SHOPPER_TRANSACTION, {
            object: {
              wallet_id: shopperWallet.id,
              amount: grandTotal.toFixed(2),
              currency: "RWF",
              type: "reserve_reversal",
              status: "completed",
              related_reel_orderId: orderId,
              description: `Float reversal for cancelled reel order (${orderId})`
            }
          });
        }

        if (updated) {
          await hasuraClient.request(UPDATE_SHOPPER_WALLET, {
            wallet_id: shopperWallet.id,
            available_balance: newAvailable.toFixed(2),
            reserved_balance: newReserved.toFixed(2)
          });
        }
      }
    }

    return res.status(200).json({ success: true, message: `Order cancelled and ${userRefundAmount} refunded to wallet` });
  } catch (error: any) {
    console.error("Cancellation error:", error);
    return res.status(500).json({ error: "Cancellation and refund process failed", details: error.message });
  }
}
