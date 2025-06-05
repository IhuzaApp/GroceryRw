import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const date = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOG_DIR, `${date}.log`);

    if (fs.existsSync(logFile)) {
      await fs.promises.unlink(logFile);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error clearing logs:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
} 