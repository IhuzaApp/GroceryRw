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

  // Clear any role switching cookies
  res.setHeader("Set-Cookie", [
    "role_changed=; Path=/; Max-Age=0; HttpOnly",
    "new_role=; Path=/; Max-Age=0; HttpOnly",
    "return_to=; Path=/; Max-Age=0; HttpOnly",
  ]);

  // Redirect to the NextAuth signout endpoint with a callback
  return res.redirect(
    `/api/auth/signout?callbackUrl=${encodeURIComponent(
      `${
        process.env.NEXTAUTH_URL || ""
      }/Auth/Login?callbackUrl=${encodeURIComponent(returnTo)}`
    )}`
  );
}
