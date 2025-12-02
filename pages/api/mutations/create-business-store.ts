import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const CREATE_BUSINESS_STORE = gql`
  mutation CreateBusinessStore(
    $business_id: uuid!
    $category_id: uuid = ""
    $description: String = ""
    $image: String = ""
    $latitude: String = ""
    $longitude: String = ""
    $name: String!
    $operating_hours: json = ""
  ) {
    insert_business_stores(
      objects: {
        business_id: $business_id
        category_id: $category_id
        description: $description
        image: $image
        is_active: false
        latitude: $latitude
        longitude: $longitude
        name: $name
        operating_hours: $operating_hours
      }
    ) {
      affected_rows
      returning {
        id
        name
        description
        business_id
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

interface CreateBusinessStoreInput {
  name: string;
  description?: string;
  category_id?: string;
  image?: string;
  latitude?: string;
  longitude?: string;
  operating_hours?: any;
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

    const user_id = session.user.id;
    const {
      name,
      description,
      category_id,
      image,
      latitude,
      longitude,
      operating_hours,
    } = req.body as CreateBusinessStoreInput;

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Store name is required" });
    }

    // Get the business account for this user
    const businessAccountQuery = gql`
      query GetBusinessAccount($user_id: uuid!) {
        business_accounts(where: { user_id: { _eq: $user_id } }) {
          id
        }
      }
    `;

    const businessAccountResult = await hasuraClient.request<{
      business_accounts: Array<{ id: string }>;
    }>(businessAccountQuery, { user_id });

    if (!businessAccountResult.business_accounts || businessAccountResult.business_accounts.length === 0) {
      return res.status(400).json({ error: "Business account not found" });
    }

    const business_id = businessAccountResult.business_accounts[0].id;

    // Note: Business wallet creation is skipped here because the foreign key
    // business_wallet_business_id_fkey references PlasBusinessProductsOrSerive.id,
    // not business_accounts.id. The wallet should be created separately when
    // a product/service is created, or the foreign key constraint needs to be updated.

    // Prepare operating hours - convert to JSON if it's a string
    // Use empty object {} instead of null for GraphQL json type
    let operatingHoursJson: any = {};
    if (operating_hours) {
      if (typeof operating_hours === "string") {
        try {
          operatingHoursJson = JSON.parse(operating_hours);
        } catch {
          // If parsing fails, use empty object
          operatingHoursJson = {};
        }
      } else if (typeof operating_hours === "object" && operating_hours !== null) {
        operatingHoursJson = operating_hours;
      }
    }

    const result = await hasuraClient.request<{
      insert_business_stores: {
        affected_rows: number;
        returning: Array<{
          id: string;
          name: string;
          description: string | null;
          business_id: string;
          created_at: string;
        }>;
      };
    }>(CREATE_BUSINESS_STORE, {
      business_id,
      name: name.trim(),
      description: description?.trim() || "",
      category_id: category_id || "",
      image: image || "",
      latitude: latitude || "",
      longitude: longitude || "",
      operating_hours: operatingHoursJson,
    });

    if (!result.insert_business_stores || result.insert_business_stores.affected_rows === 0) {
      throw new Error("Failed to create business store");
    }

    const createdStore = result.insert_business_stores.returning[0];

    return res.status(200).json({
      success: true,
      store: {
        id: createdStore.id,
        name: createdStore.name,
        description: createdStore.description,
        businessId: createdStore.business_id,
        createdAt: createdStore.created_at,
      },
    });
  } catch (error: any) {
    console.error("Error creating business store:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response,
      errors: error.response?.errors,
    });

    const errorMessage = error.response?.errors?.[0]?.message || error.message || "Unknown error";
    const errorCode = error.response?.errors?.[0]?.extensions?.code;

    return res.status(500).json({
      error: "Failed to create business store",
      message: errorMessage,
      code: errorCode,
      details: error.response?.errors || undefined,
    });
  }
}

