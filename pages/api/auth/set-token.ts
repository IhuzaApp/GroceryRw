import { NextApiRequest, NextApiResponse } from 'next';
import { setAuthCookie, verifyToken } from '../../../src/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    setAuthCookie(res, token);

    return res.status(200).json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error('Set token error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 