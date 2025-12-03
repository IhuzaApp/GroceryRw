import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CREATE_BUSINESS_PRODUCT = gql`
  mutation CreateBusinessProduct(
    $name: String!
    $Description: String!
    $Image: String!
    $price: String!
    $unit: String!
    $status: String!
    $query_id: String = ""
  ) {
    insert_PlasBusinessProductsOrSerive(
      objects: {
        name: $name
        Description: $Description
        Image: $Image
        price: $price
        unit: $unit
        status: $status
        query_id: $query_id
      }
    ) {
      affected_rows
      returning {
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

interface CreateBusinessProductInput {
  name: string;
  description: string;
  image: string;
  price: string;
  unit: string;
  status?: string;
  query_id: string;
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

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const {
      name,
      description,
      image,
      price,
      unit,
      status = "active",
      query_id,
    } = req.body as CreateBusinessProductInput;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Product description is required" });
    }

    if (!image || !image.trim()) {
      return res.status(400).json({ error: "Product image is required" });
    }

    if (!price || !price.trim()) {
      return res.status(400).json({ error: "Product price is required" });
    }

    if (!unit || !unit.trim()) {
      return res.status(400).json({ error: "Product unit is required" });
    }

    // Query ID is optional - if not provided, use empty string

    const variables = {
      name: name.trim(),
      Description: description.trim(),
      Image: image.trim(),
      price: price.trim(),
      unit: unit.trim(),
      status: status.trim(),
      query_id: query_id ? query_id.trim() : "",
    };

    const result = await hasuraClient.request<{
      insert_PlasBusinessProductsOrSerive: {
        affected_rows: number;
        returning: Array<{
          id: string;
          name: string;
          Description: string;
          Image: string;
          price: string;
          unit: string;
          status: string;
          created_at: string;
        }>;
      };
    }>(CREATE_BUSINESS_PRODUCT, variables);

    if (
      !result.insert_PlasBusinessProductsOrSerive ||
      result.insert_PlasBusinessProductsOrSerive.affected_rows === 0
    ) {
      throw new Error("Failed to create business product");
    }

    const createdProduct = result.insert_PlasBusinessProductsOrSerive.returning[0];

    return res.status(200).json({
      success: true,
      product: {
        id: createdProduct.id,
        name: createdProduct.name,
        description: createdProduct.Description,
        image: createdProduct.Image,
        price: createdProduct.price,
        unit: createdProduct.unit,
        status: createdProduct.status,
        queryId: query_id || "",
        createdAt: createdProduct.created_at,
      },
    });
  } catch (error: any) {
    const errorMessage =
      error.response?.errors?.[0]?.message || error.message || "Unknown error";
    const errorCode = error.response?.errors?.[0]?.extensions?.code;
    const errorPath = error.response?.errors?.[0]?.extensions?.path;
    const allErrors = error.response?.errors || [];

    return res.status(500).json({
      error: "Failed to create business product",
      message: errorMessage,
      code: errorCode,
      path: errorPath,
      details: allErrors,
    });
  }
}

