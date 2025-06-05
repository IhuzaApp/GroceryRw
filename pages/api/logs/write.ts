import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { LogEntry } from '../../../src/utils/types';

const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logs } = req.body;
    if (!Array.isArray(logs)) {
      return res.status(400).json({ error: 'Invalid logs format' });
    }

    // Ensure details are properly stringified
    const processedLogs = logs.map((log: LogEntry) => ({
      ...log,
      details: log.details ? (
        typeof log.details === 'string' ? log.details : JSON.stringify(log.details)
      ) : undefined
    }));

    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${date}.log`);
    const logString = processedLogs.map(entry => JSON.stringify(entry)).join('\n') + '\n';

    await fs.promises.appendFile(logFile, logString);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error writing logs:', error);
    res.status(500).json({ error: 'Failed to write logs' });
  }
} 