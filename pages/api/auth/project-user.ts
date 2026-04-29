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
        _or: [
          { email: { _eq: $identifier } }
          { username: { _eq: $identifier } }
        ]
      }
    ) {
      id
      password
      email
      role
      username
      TwoAuth_enabled
      profile
      is_active
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

        console.log("🔍 [Project Auth] Login attempt for:", identifier);
        console.log(
          "🔍 [Project Auth] User found:",
          data.ProjectUsers.length > 0 ? "YES" : "NO"
        );

        const user = data.ProjectUsers[0];

        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        if (!user.is_active) {
          console.log(
            "🔍 [Project Auth] User found but is INACTIVE:",
            user.username
          );
          return res.status(401).json({ error: "Account is inactive" });
        }

        // Verify role
        const normalizedRole = user.role?.toLowerCase();
        if (
          normalizedRole !== "projectadmin" &&
          normalizedRole !== "projectdev"
        ) {
          return res
            .status(403)
            .json({ error: "Access denied: Unauthorized role" });
        }

        // Verify password
        console.log("🔍 [Project Auth] Verifying password for:", user.username);
        let isValid = await bcrypt
          .compare(password, user.password)
          .catch(() => false);

        // Fallback for plain-text passwords (common in dev/manual setups)
        if (!isValid && password === user.password) {
          console.log("🔍 [Project Auth] Plain-text password matched!");
          isValid = true;
        }

        console.log(
          "🔍 [Project Auth] Password valid:",
          isValid ? "YES" : "NO"
        );

        if (!isValid) {
          return res.status(401).json({ error: "Invalid credentials" });
        }

        // Always require 2FA for Project Users (Setup or Verify)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Generate a temporary token containing the OTP and user ID
        const tToken = jwt.sign(
          {
            userId: user.id,
            otp,
            purpose: user.TwoAuth_enabled ? "2fa" : "setup-2fa",
          },
          JWT_SECRET,
          { expiresIn: "5m" }
        );

        // Send email
        await resend.emails.send({
          from: "Plasa Dev <no-reply@plasa.app>",
          to: user.email,
          subject: user.TwoAuth_enabled
            ? "Your Dev Login 2FA Code"
            : "Set up your Dev 2FA",
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; color: #1e293b; border-radius: 8px; border: 1px solid #e2e8f0;">
              <h2 style="color: #4f46e5;">${
                user.TwoAuth_enabled
                  ? "Security Verification"
                  : "Mandatory 2FA Setup"
              }</h2>
              <p>${
                user.TwoAuth_enabled
                  ? "Use this code to login:"
                  : "To secure your account, please verify this code to enable 2FA:"
              }</p>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #4f46e5; padding: 20px 0; font-family: monospace;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #64748b;">This code expires in 5 minutes.</p>
              ${
                !user.TwoAuth_enabled
                  ? '<p style="font-size: 11px; color: #ef4444; font-weight: bold;">Logging in will automatically enable 2FA on your account for future sessions.</p>'
                  : ""
              }
            </div>
          `,
        });

        return res.status(200).json({
          step: user.TwoAuth_enabled ? "2fa" : "setup-2fa",
          tempToken: tToken,
          message: user.TwoAuth_enabled
            ? "Verification code sent."
            : "2FA setup required.",
        });
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
        if (
          (decoded.purpose !== "2fa" && decoded.purpose !== "setup-2fa") ||
          decoded.otp !== code
        ) {
          return res.status(401).json({ error: "Invalid or expired code" });
        }

        // If it was setup, enable it in the DB
        if (decoded.purpose === "setup-2fa") {
          await hasuraClient.request(
            gql`
              mutation Enable2FA($id: uuid!) {
                update_ProjectUsers_by_pk(
                  pk_columns: { id: $id }
                  _set: { TwoAuth_enabled: true }
                ) {
                  id
                }
              }
            `,
            { id: decoded.userId }
          );
          console.log(
            "🔍 [Project Auth] 2FA Enabled for user:",
            decoded.userId
          );
        }

        // Fetch full user data again to finalize
        const data = await hasuraClient.request<any>(
          gql`
            query GetProjectUserById($id: uuid!) {
              ProjectUsers_by_pk(id: $id) {
                id
                email
                role
                username
              }
            }
          `,
          { id: decoded.userId }
        );

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
      username: user.username,
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

  return res
    .status(200)
    .json({ step: "success", user: { email: user.email, role: user.role } });
}
