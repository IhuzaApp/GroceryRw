import type { NextApiRequest, NextApiResponse } from 'next';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { gql } from 'graphql-request';

// Fetch orders unassigned older than 20 minutes, with shop name and delivery address
const GET_PENDING_ORDERS = gql`
  query GetPendingOrders($createdBefore: timestamptz!) {
    Orders(
      where: { shopper_id: { _is_null: true }, created_at: { _lte: $createdBefore } }
    ) {
      id
      service_fee
      delivery_fee
      shop: Shop {
        name
      }
      address: Address {
        latitude
        longitude
      }
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Cutoff timestamp: 20 minutes ago
    const cutoff = new Date(Date.now() - 20 * 60 * 1000).toISOString();

    const data = await hasuraClient.request<{
      Orders: Array<{
        id: string;
        service_fee: string;
        delivery_fee: string;
        shop: { name: string };
        address: { latitude: string; longitude: string };
      }>;
    }>(GET_PENDING_ORDERS, { createdBefore: cutoff });

    const pending = data.Orders.map((o) => ({
      id: o.id,
      latitude: parseFloat(o.address.latitude),
      longitude: parseFloat(o.address.longitude),
      earnings:
        parseFloat(o.service_fee || '0') + parseFloat(o.delivery_fee || '0'),
      shopName: o.shop.name,
    }));

    res.status(200).json(pending);
  } catch (error) {
    console.error('Error fetching pending orders:', error);
    res.status(500).json({ error: 'Failed to fetch pending orders' });
  }
} 