import { NextApiRequest, NextApiResponse } from 'next';
import { hasuraClient } from '../../../src/lib/hasuraClient';
import { gql } from 'graphql-request';

interface ClearSystemLogsResponse {
  delete_System_Logs: {
    affected_rows: number;
  };
}

const CLEAR_SYSTEM_LOGS = gql`
  mutation clearSystemLogs {
    delete_System_Logs(where: {}) {
      affected_rows
    }
  }
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const data = await hasuraClient.request<ClearSystemLogsResponse>(CLEAR_SYSTEM_LOGS);
    res.status(200).json({ 
      success: true,
      deletedRows: data.delete_System_Logs.affected_rows 
    });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
} 