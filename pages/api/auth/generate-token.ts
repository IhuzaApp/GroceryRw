import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken, setAuthCookie } from '../../../src/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const token = generateToken(userId, role);
    setAuthCookie(res, token);

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 