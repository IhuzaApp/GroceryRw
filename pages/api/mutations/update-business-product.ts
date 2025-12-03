import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const UPDATE_BUSINESS_PRODUCT = gql`
  mutation UpdateBusinessProduct(
    $product_id: uuid!
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
    $store_id: uuid = ""
  ) {
    update_PlasBusinessProductsOrSerive(
      where: { id: { _eq: $product_id } }
      _set: {
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

interface UpdateBusinessProductInput {
  product_id: string;
  name: string;
  description?: string;
  image?: string;
  price: string;
  unit?: string;
  status?: string;
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
  if (req.method !== "PUT") {
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
      product_id,
      name,
      description = "",
      image = "",
      price,
      unit = "",
      status = "active",
      minimumOrders: minOrders = "0",
      maxOrders = "",
      delveryArea = "",
      speciality = "",
      store_id = "",
      user_id = "",
      Plasbusiness_id = "",
    } = req.body as UpdateBusinessProductInput;

    // Validate required fields
    if (!product_id || !product_id.trim()) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Product name is required" });
    }

    if (!price || !price.trim()) {
      return res.status(400).json({ error: "Product price is required" });
    }

    // minimumOrders is required by the database, default to "0" if not provided
    const minimumOrders = minOrders && minOrders.trim() !== "" ? minOrders.trim() : "0";
    
    // Get user_id from session if not provided
    const final_user_id = user_id || session?.user?.id || "";

    const variables: Record<string, any> = {
      product_id: product_id.trim(),
      name: name.trim(),
      Description: description ? description.trim() : "",
      Image: image ? image.trim() : "",
      price: price.trim(),
      unit: unit ? unit.trim() : "",
      status: status ? status.trim() : "active",
      minimumOrders: minimumOrders,
      maxOrders: maxOrders ? maxOrders.trim() : "",
      delveryArea: delveryArea ? delveryArea.trim() : "",
      speciality: speciality ? speciality.trim() : "",
      store_id: store_id ? store_id.trim() : "",
      user_id: final_user_id,
      Plasbusiness_id: Plasbusiness_id ? Plasbusiness_id.trim() : "",
    };

    const result = await hasuraClient.request<{
      update_PlasBusinessProductsOrSerive: {
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
    }>(UPDATE_BUSINESS_PRODUCT, variables);

    if (
      !result.update_PlasBusinessProductsOrSerive ||
      result.update_PlasBusinessProductsOrSerive.affected_rows === 0
    ) {
      throw new Error("Failed to update business product");
    }

    const updatedProduct = result.update_PlasBusinessProductsOrSerive.returning[0];

    return res.status(200).json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.Description,
        image: updatedProduct.Image,
        price: updatedProduct.price,
        unit: updatedProduct.unit,
        status: updatedProduct.status,
        createdAt: updatedProduct.created_at,
      },
    });
  } catch (error: any) {
    const errorMessage =
      error.response?.errors?.[0]?.message || error.message || "Unknown error";
    const errorCode = error.response?.errors?.[0]?.extensions?.code;
    const errorPath = error.response?.errors?.[0]?.extensions?.path;
    const allErrors = error.response?.errors || [];

    return res.status(500).json({
      error: "Failed to update business product",
      message: errorMessage,
      code: errorCode,
      path: errorPath,
      details: allErrors,
    });
  }
}

