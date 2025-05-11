import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { gql } from 'graphql-request';
import { hasuraClient } from '../../../src/lib/hasuraClient';

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

// Type definition for wallet data
interface WalletData {
  Wallets: Array<{
    id: string;
    available_balance: string;
    reserved_balance: string;
    shopper_id: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { shopperId, orderId, orderAmount } = req.body;

    // Validate required fields
    if (!shopperId || !orderId || orderAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify the authenticated user matches the shopperId
    if (session.user.id !== shopperId) {
      return res.status(403).json({ error: 'Not authorized to record transactions for this shopper' });
    }

    // Check if hasuraClient is available (it should be on server side)
    if (!hasuraClient) {
      return res.status(500).json({ error: 'Database client not available' });
    }

    // Get wallet information
    const walletResponse = await hasuraClient.request<WalletData>(GET_WALLET_BY_SHOPPER_ID, {
      shopper_id: shopperId,
    });

    if (!walletResponse.Wallets || walletResponse.Wallets.length === 0) {
      return res.status(404).json({ error: 'Wallet not found for this shopper' });
    }

    const wallet = walletResponse.Wallets[0];
    const walletId = wallet.id;
    
    // Calculate new reserved balance
    const currentReserved = parseFloat(wallet.reserved_balance);
    
    // The reserved balance should be sufficient for the order amount
    if (currentReserved < orderAmount) {
      return res.status(400).json({ error: 'Insufficient reserved balance' });
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
        type: 'payment',
        status: 'completed',
        related_order_id: orderId,
        description: 'Payment for found order items (excluding service and delivery fees)',
      },
    ];

    console.log(`Recording transaction for order ${orderId}, amount: ${orderAmount.toFixed(2)} (found items only)`);
    const response = await hasuraClient.request(CREATE_WALLET_TRANSACTIONS, {
      transactions,
    });

    return res.status(200).json({
      success: true,
      message: 'Transaction recorded and wallet balance updated successfully',
      data: response,
      newBalance: {
        reserved: newReserved
      }
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
  }
} 