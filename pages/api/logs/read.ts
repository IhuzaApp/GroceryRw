import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { LogEntry } from '../../../src/utils/types';

const LOG_DIR = path.join(process.cwd(), 'logs');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${date}.log`);

    if (!fs.existsSync(logFile)) {
      return res.status(200).json({ logs: [] });
    }

    const content = await fs.promises.readFile(logFile, 'utf-8');
    const logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          const log = JSON.parse(line);
          return {
            ...log,
            details: log.details ? (
              typeof log.details === 'string' ? log.details : JSON.stringify(log.details)
            ) : undefined
          };
        } catch (error) {
          console.error('Error parsing log line:', error);
          return null;
        }
      })
      .filter((log): log is LogEntry => log !== null);

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ error: 'Failed to read logs' });
  }
} 