import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CREATE_BUSINESS_PRODUCT = gql`
  mutation CreateBusinessProduct(
    $Description: String = ""
    $Image: String = ""
    $Plasbusiness_id: uuid = ""
    $delveryArea: String = ""
    $maxOrders: String = ""
    $minimumOrders: String = ""
    $name: String!
    $price: String!
    $speciality: String = ""
    $status: String = ""
    $unit: String = ""
    $user_id: uuid = ""
    $store_id: uuid
    $query_id: String = ""
  ) {
    insert_PlasBusinessProductsOrSerive(
      objects: {
        Description: $Description
        Image: $Image
        Plasbusiness_id: $Plasbusiness_id
        delveryArea: $delveryArea
        maxOrders: $maxOrders
        minimumOrders: $minimumOrders
        name: $name
        price: $price
        speciality: $speciality
        status: $status
        unit: $unit
        user_id: $user_id
        store_id: $store_id
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
  description?: string;
  image?: string;
  price: string;
  unit?: string;
  status?: string;
  query_id?: string;
  minimumOrders?: string;
  maxOrders?: string;
  delveryArea?: string;
  speciality?: string;
  store_id?: string;
  user_id?: string;
  Plasbusiness_id?: string;
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
      description = "",
      image = "",
      price,
      unit = "",
      status = "active",
      query_id = "",
      minimumOrders: minOrders,
      maxOrders,
      delveryArea,
      speciality,
      store_id,
      user_id = "",
      Plasbusiness_id = "",
    } = req.body as CreateBusinessProductInput;

    // Validate required fields
    if (!name || (typeof name === "string" && !name.trim())) {
      return res.status(400).json({ error: "Product name is required" });
    }

    // Convert price to string and validate
    const priceStr =
      price !== null && price !== undefined ? String(price).trim() : "";
    if (!priceStr) {
      return res.status(400).json({ error: "Product price is required" });
    }

    // minimumOrders is required by the database, default to "0" if not provided
    // Convert to string first to handle numbers or other types
    const minimumOrders =
      minOrders !== null && minOrders !== undefined
        ? String(minOrders).trim() !== ""
          ? String(minOrders).trim()
          : "0"
        : "0";

    // Get user_id from session if not provided
    const final_user_id = user_id || session?.user?.id || "";

    const variables: Record<string, any> = {
      name: typeof name === "string" ? name.trim() : String(name || ""),
      Description:
        description !== null && description !== undefined
          ? String(description).trim()
          : "",
      Image: image !== null && image !== undefined ? String(image).trim() : "",
      price: priceStr,
      unit: unit !== null && unit !== undefined ? String(unit).trim() : "",
      status:
        status !== null && status !== undefined
          ? String(status).trim()
          : "active",
      query_id:
        query_id !== null && query_id !== undefined
          ? String(query_id).trim()
          : "",
      minimumOrders: minimumOrders,
      maxOrders:
        maxOrders !== null && maxOrders !== undefined
          ? String(maxOrders).trim()
          : "",
      delveryArea:
        delveryArea !== null && delveryArea !== undefined
          ? String(delveryArea).trim()
          : "",
      speciality:
        speciality !== null && speciality !== undefined
          ? String(speciality).trim()
          : "",
      user_id: final_user_id,
      Plasbusiness_id:
        Plasbusiness_id !== null && Plasbusiness_id !== undefined
          ? String(Plasbusiness_id).trim()
          : "",
    };

    // Handle store_id: null for services, or a valid UUID for products
    if (store_id === null || store_id === undefined) {
      variables.store_id = null;
    } else if (typeof store_id === "string" && store_id.trim() !== "") {
      variables.store_id = store_id.trim();
    } else {
      variables.store_id = null;
    }

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

    const createdProduct =
      result.insert_PlasBusinessProductsOrSerive.returning[0];

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
