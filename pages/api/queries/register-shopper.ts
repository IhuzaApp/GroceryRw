import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]";

const REGISTER_SHOPPER = gql`
  mutation RegisterShopper(
    $full_name: String!
    $address: String!
    $phone_number: String!
    $national_id: String!
    $driving_license: String
    $transport_mode: String!
    $profile_photo: String
    $user_id: uuid!
  ) {
    insert_shoppers_one(
      object: {
        full_name: $full_name
        address: $address
        phone_number: $phone_number
        national_id: $national_id
        driving_license: $driving_license
        transport_mode: $transport_mode
        profile_photo: $profile_photo
        status: "pending"
        active: false
        background_check_completed: false
        onboarding_step: "application_submitted"
        user_id: $user_id
      }
    ) {
      id
      status
      active
      onboarding_step
    }
  }
`;

// Update an existing shopper
const UPDATE_SHOPPER = gql`
  mutation UpdateShopper(
    $shopper_id: uuid!
    $full_name: String!
    $address: String!
    $phone_number: String!
    $national_id: String!
    $driving_license: String
    $transport_mode: String!
    $profile_photo: String
  ) {
    update_shoppers_by_pk(
      pk_columns: {id: $shopper_id}
      _set: {
        full_name: $full_name
        address: $address
        phone_number: $phone_number
        national_id: $national_id
        driving_license: $driving_license
        transport_mode: $transport_mode
        profile_photo: $profile_photo
        status: "pending"
        updated_at: "now()"
      }
    ) {
      id
      status
      active
      onboarding_step
    }
  }
`;

// Check if shopper already exists
const CHECK_SHOPPER_EXISTS = gql`
  query CheckShopperExists($user_id: uuid!) {
    shoppers(where: {user_id: {_eq: $user_id}}) {
      id
      status
      full_name
      address
      phone_number
      national_id
      driving_license
      transport_mode
      profile_photo
    }
  }
`;

interface RegisterShopperInput {
  full_name: string;
  address: string;
  phone_number: string;
  national_id: string;
  driving_license?: string;
  transport_mode: string;
  profile_photo?: string;
  user_id: string;
  force_update?: boolean; // Optional parameter to force update even if already registered
}

interface RegisterShopperResponse {
  insert_shoppers_one: {
    id: string;
    status: string;
    active: boolean;
    onboarding_step: string;
  };
}

interface UpdateShopperResponse {
  update_shoppers_by_pk: {
    id: string;
    status: string;
    active: boolean;
    onboarding_step: string;
  };
}

interface CheckShopperResponse {
  shoppers: Array<{
    id: string;
    status: string;
    full_name: string;
    address: string;
    phone_number: string;
    national_id: string;
    driving_license: string | null;
    transport_mode: string;
    profile_photo: string | null;
  }>;
}

// Define the session user type
interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

// Define the session type
interface Session {
  user: SessionUser;
  expires: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify the user is authenticated
    const session = await getServerSession(req, res, authOptions as any) as Session | null;
    
    if (!session || !session.user) {
      return res.status(401).json({ error: "You must be authenticated to register as a shopper" });
    }
    
    if (!hasuraClient) {
      console.error("Hasura client is not initialized. Check environment variables.");
      console.log("HASURA_GRAPHQL_URL:", process.env.HASURA_GRAPHQL_URL || "Not set");
      throw new Error("Hasura client is not initialized. Please check server configuration.");
    }

    const {
      full_name,
      address,
      phone_number,
      national_id,
      driving_license,
      transport_mode,
      profile_photo,
      user_id,
      force_update = false, // Default to false if not provided
    } = req.body as RegisterShopperInput;

    // Validate required fields
    if (!full_name || !address || !phone_number || !national_id || !transport_mode || !user_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Verify the user ID in the request matches the authenticated user
    if (user_id !== session.user.id) {
      console.error("User ID mismatch:", {
        requestUserId: user_id,
        sessionUserId: session.user.id
      });
      return res.status(403).json({ error: "User ID mismatch. You can only register yourself as a shopper." });
    }

    // Check if the user is already registered as a shopper
    const existingShopperData = await hasuraClient.request<CheckShopperResponse>(
      CHECK_SHOPPER_EXISTS,
      { user_id }
    );

    if (existingShopperData.shoppers.length > 0) {
      const existingShopper = existingShopperData.shoppers[0];
      
      // If force_update is true, update the existing shopper
      if (force_update) {
        console.log(`Updating existing shopper record for user ${user_id} with ID ${existingShopper.id}`);
        
        const updateData = await hasuraClient.request<UpdateShopperResponse>(
          UPDATE_SHOPPER,
          {
            shopper_id: existingShopper.id,
            full_name,
            address,
            phone_number,
            national_id,
            driving_license,
            transport_mode,
            profile_photo,
          }
        );
        
        return res.status(200).json({ 
          shopper: updateData.update_shoppers_by_pk,
          updated: true
        });
      }
      
      // Otherwise, return that they're already registered
      return res.status(409).json({ 
        error: "Already registered as a shopper", 
        message: `You are already registered as a shopper with status: ${existingShopper.status}`,
        shopper: existingShopper
      });
    }

    console.log("Registering new shopper with data:", {
      full_name,
      address,
      phone_number: phone_number.substring(0, 4) + "****", // Log partial for privacy
      national_id: national_id.substring(0, 4) + "****", // Log partial for privacy
      transport_mode,
      user_id,
    });

    const data = await hasuraClient.request<RegisterShopperResponse>(
      REGISTER_SHOPPER,
      {
        full_name,
        address,
        phone_number,
        national_id,
        driving_license,
        transport_mode,
        profile_photo,
        user_id,
      }
    );

    console.log("Shopper registration successful:", data.insert_shoppers_one.id);
    res.status(200).json({ shopper: data.insert_shoppers_one });
  } catch (error: any) {
    console.error("Error registering shopper:", error);
    // Return a more detailed error message
    res.status(500).json({ 
      error: "Failed to register shopper", 
      message: error.message,
      details: error.response?.errors || "No additional details available"
    });
  }
} 