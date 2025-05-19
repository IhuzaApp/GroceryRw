import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    // If no session, just redirect to login
    return res.redirect("/Auth/Login");
  }

  // Get the return URL from cookie or use home
  const returnTo = req.cookies.return_to || "/";
  
  // Check if this is a role switch
  const isRoleSwitch = req.cookies.role_changed === "true";

  // Clear any role switching cookies
  res.setHeader("Set-Cookie", [
    "role_changed=; Path=/; Max-Age=0; HttpOnly",
    "new_role=; Path=/; Max-Age=0; HttpOnly",
    "return_to=; Path=/; Max-Age=0; HttpOnly",
  ]);

  // Check if this request is already coming from NextAuth signout
  // to prevent redirection loops
  const referer = req.headers.referer || '';
  if (referer.includes('/api/auth/signout')) {
    // If we're already in the signout process, redirect based on whether role switch completed
    return res.redirect(isRoleSwitch ? "/" : "/Auth/Login");
  }

  // Redirect to the NextAuth signout endpoint with a callback URL
  // If role switch, go to dashboard, otherwise go to login
  const callbackUrl = isRoleSwitch ? "/" : "/Auth/Login";
  return res.redirect(
    `/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
}
