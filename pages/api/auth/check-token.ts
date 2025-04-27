import { NextApiRequest, NextApiResponse } from 'next';
import { getAuthCookie, verifyToken } from '../../../src/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const token = getAuthCookie(req);
    
    if (!token) {
      return res.status(200).json({ user: null });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(200).json({ user: null });
    }

    return res.status(200).json({
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
    });
  } catch (error) {
    console.error('Token check error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 