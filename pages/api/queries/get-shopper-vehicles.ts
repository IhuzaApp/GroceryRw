import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { gql } from 'graphql-request';
import { logger } from '../../../src/utils/logger';

// Define the GraphQL query
const GET_VEHICLES = gql`
  query GetVehicles($user_id: uuid!) {
    vehicles(where: {user_id: {_eq: $user_id}}) {
      id
      type
      plate_number
      model
      photo
      created_at
      update_on
      user_id
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!hasuraClient) {
      logger.error('Hasura client not initialized');
      return res.status(500).json({ error: 'Internal server error' });
    }

    console.log('Fetching vehicles for user:', user_id);
    const response = await hasuraClient.request(GET_VEHICLES, {
      user_id,
    });

    console.log('Hasura response:', response);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 