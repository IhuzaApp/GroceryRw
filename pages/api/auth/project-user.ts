import type { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { resend } from "../../../src/lib/resend";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const JWT_SECRET = process.env.NEXTAUTH_SECRET || "dev-secret-key";

const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

const PROJECT_USER_LOGIN_QUERY = gql`
  query GetProjectUser($identifier: String!) {
    ProjectUsers(
      where: {
        _or: [{ email: { _eq: $identifier } }, { username: { _eq: $identifier } }]
        is_active: { _eq: true }
      }
    ) {
      id
      password
      email
      role
      username
      TwoAuth_enabled
      profile
    }
  }
`;

// Simple memory store for 2FA codes (Note: In production/serverless, use Redis or a DB table)
// For this dev tool, we'll use a short-lived JWT for the 2FA step instead of a memory store.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { action, identifier, password, code, tempToken } = req.body;

    if (action === "login") {
      try {
        const data = await hasuraClient.request<any>(PROJECT_USER_LOGIN_QUERY, {
          identifier,
        });

        const user = data.ProjectUsers[0];

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Verify role
        if (user.role !== "projectAdmin" && user.role !== "projectDev") {
          return res.status(403).json({ error: "Access denied: Unauthorized role" });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        if (user.TwoAuth_enabled) {
          // Generate 2FA code (6 digits)
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          
          // Generate a temporary token containing the OTP and user ID
          const tToken = jwt.sign(
            { userId: user.id, otp, purpose: "2fa" },
            JWT_SECRET,
            { expiresIn: "5m" }
          );

          // Send email
          await resend.emails.send({
            from: "Plasa Dev <no-reply@plasa.app>",
            to: user.email,
            subject: "Your Dev Login 2FA Code",
            html: `
              <div style="font-family: sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; border-radius: 8px;">
                <h2 style="color: #38bdf8;">Dev Dashboard Security</h2>
                <p>Use the following code to complete your login:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #38bdf8; padding: 10px 0;">
                  ${otp}
                </div>
                <p style="font-size: 12px; color: #94a3b8;">This code expires in 5 minutes.</p>
              </div>
            `,
          });

          return res.status(200).json({ step: "2fa", tempToken: tToken });
        }

        // Success - No 2FA
        return finalizeLogin(res, user);
      } catch (error: any) {
        console.error("Project User Login Error:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
    }

    if (action === "verify-2fa") {
      try {
        if (!tempToken || !code) {
          return res.status(400).json({ error: "Missing verification data" });
        }

        const decoded = jwt.verify(tempToken, JWT_SECRET) as any;
        if (decoded.purpose !== "2fa" || decoded.otp !== code) {
          return res.status(401).json({ error: "Invalid or expired code" });
        }

        // Fetch full user data again to finalize
        const data = await hasuraClient.request<any>(gql`
          query GetProjectUserById($id: uuid!) {
            ProjectUsers_by_pk(id: $id) {
              id
              email
              role
              username
            }
          }
        `, { id: decoded.userId });

        return finalizeLogin(res, data.ProjectUsers_by_pk);
      } catch (error: any) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }
    }
  }

  if (req.method === "GET") {
    const token = req.cookies.project_admin_session;
    if (!token) return res.status(401).json({ authenticated: false });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return res.status(200).json({ authenticated: true, user: decoded });
    } catch (error) {
      return res.status(401).json({ authenticated: false });
    }
  }

  if (req.method === "DELETE") {
    res.setHeader(
      "Set-Cookie",
      serialize("project_admin_session", "", {
        maxAge: -1,
        path: "/",
      })
    );
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

function finalizeLogin(res: NextApiResponse, user: any) {
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      username: user.username 
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.setHeader(
    "Set-Cookie",
    serialize("project_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    })
  );

  return res.status(200).json({ step: "success", user: { email: user.email, role: user.role } });
}
