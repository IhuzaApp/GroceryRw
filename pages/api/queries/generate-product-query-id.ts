import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { v4 as uuidv4 } from "uuid";

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Generate a unique query ID for product verification
    const queryId = uuidv4();

    return res.status(200).json({
      success: true,
      queryId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to generate query ID",
      message: error.message,
    });
  }
}

