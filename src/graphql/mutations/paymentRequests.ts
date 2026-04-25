import { gql } from "graphql-request";

export const INSERT_PAYMENT_REQUEST = gql`
  mutation InsertPaymentRequest($object: payment_requests_insert_input!) {
    insert_payment_requests_one(object: $object) {
      status
      order_id
      shop_id
      transactionCode
      shopper_id
      amount
      agent_approved_id
      updated_on
    }
  }
`;

export const UPDATE_MERCHANT_WALLET = gql`
  mutation UpdateMerchantWallet(
    $balance: String = ""
    $update_at: timestamptz = ""
    $_eq: uuid = ""
  ) {
    update_merchant_wallets(
      _set: { balance: $balance, update_at: $update_at }
      where: { shop_id: { _eq: $_eq } }
    ) {
      affected_rows
    }
  }
`;

export const GET_MERCHANT_WALLET = gql`
  query GetMerchantWallet($shop_id: uuid!) {
    merchant_wallets(where: { shop_id: { _eq: $shop_id } }) {
      id
      balance
    }
  }
`;
