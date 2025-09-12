import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get token using middleware method
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NEXTAUTH_SECURE_COOKIES === "true",
    });

    // Get session using NextAuth method
    const session = await getServerSession(req, res, authOptions as any);

    // Get cookies info
    const cookies = req.cookies;
    const sessionCookie = cookies['next-auth.session-token'] || cookies['__Secure-next-auth.session-token'];
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECURE_COOKIES: process.env.NEXTAUTH_SECURE_COOKIES,
        HASURA_URL: process.env.HASURA_GRAPHQL_URL ? 'Set' : 'Not set',
      },
      token: token ? {
        id: token.sub,
        name: token.name,
        email: token.email,
        role: token.role,
        exp: token.exp,
        expDate: token.exp ? new Date(token.exp * 1000).toISOString() : null,
        iat: token.iat,
        iatDate: token.iat ? new Date(token.iat * 1000).toISOString() : null,
      } : null,
      session: session ? {
        user: session.user,
        expires: session.expires,
      } : null,
      cookies: {
        hasSessionCookie: !!sessionCookie,
        sessionCookieLength: sessionCookie?.length || 0,
        allCookies: Object.keys(cookies),
      },
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
      },
    };

    res.status(200).json(debugInfo);
  } catch (error) {
    res.status(500).json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
}
