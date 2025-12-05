import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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

// Generate a user-friendly product verification ID
// Format: PB + 6 alphanumeric characters (e.g., PB0384BD, PB59483CF, PB7K9M2N)
function generateProductQueryId(): string {
  const prefix = "PB";
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = prefix;

  // Generate 6 random alphanumeric characters (numbers and uppercase letters)
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return id;
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
    // Format: PB + 6 alphanumeric characters (e.g., PB0384BD, PB59483CF)
    const queryId = generateProductQueryId();

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
