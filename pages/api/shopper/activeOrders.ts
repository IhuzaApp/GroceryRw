import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { gql } from 'graphql-request';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { logger } from '../../../src/utils/logger';

interface OrdersResponse {
  Orders: Array<{
    id: string;
    status: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getSession({ req });
    const userId = session?.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const GET_ACTIVE_ORDERS = gql`
      query GetActiveOrders($shopperId: uuid!) {
        Orders(
          where: {
            shopper_id: { _eq: $shopperId }
            _and: [
              { status: { _nin: ["PENDING", "delivered", "null"] } }
              { status: { _is_null: false } }
            ]
          }
        ) {
          id
          status
        }
      }
    `;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<OrdersResponse>(
      GET_ACTIVE_ORDERS,
      { shopperId: userId }
    );

    logger.info('Active orders query result:', 'ActiveOrdersAPI', {
      userId,
      orderCount: data.Orders.length
    });

    return res.status(200).json({
      orders: data.Orders
    });

  } catch (error) {
    logger.error('Error fetching active orders:', 'ActiveOrdersAPI', error);
    return res.status(500).json({ error: 'Failed to fetch active orders' });
  }
} 