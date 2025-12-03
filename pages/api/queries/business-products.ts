import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_BUSINESS_PRODUCTS = gql`
  query GetBusinessProducts {
    PlasBusinessProductsOrSerive {
      id
      name
      Description
      Image
      price
      unit
      status
      created_at
    }
  }
`;

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
  if (req.method !== "GET") {
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

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const result = await hasuraClient.request<{
      PlasBusinessProductsOrSerive: Array<{
        id: string;
        name: string;
        Description: string;
        Image: string;
        price: string;
        unit: string;
        status: string;
        created_at: string;
      }>;
    }>(GET_BUSINESS_PRODUCTS);

    return res.status(200).json({
      products: result.PlasBusinessProductsOrSerive || [],
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Failed to fetch business products",
      message: error.message,
    });
  }
}

