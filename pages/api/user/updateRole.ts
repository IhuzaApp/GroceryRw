import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

interface ShopperResponse {
  shoppers: Array<{
    id: string;
    status: string;
    active: boolean;
  }>;
}

interface UpdateRoleResponse {
  update_Users_by_pk: {
    id: string;
    role: string;
  } | null;
}

// Check if user is a valid shopper
const CHECK_SHOPPER_STATUS = gql`
  query CheckShopperStatus($user_id: uuid!) {
    shoppers(where: { user_id: { _eq: $user_id }, active: { _eq: true } }) {
      id
      status
      active
    }
  }
`;

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: uuid!, $role: String!) {
    update_Users_by_pk(pk_columns: { id: $id }, _set: { role: $role }) {
      id
      role
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { role } = req.body;
    if (!role || (role !== "user" && role !== "shopper")) {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // If switching to shopper role, verify they are an active shopper
    if (role === "shopper") {
      const { shoppers } = await hasuraClient.request<ShopperResponse>(
        CHECK_SHOPPER_STATUS,
        {
          user_id: session.user.id,
        }
      );

      if (!shoppers?.length || !shoppers[0].active) {
        return res.status(403).json({
          error: "User is not an active shopper",
          code: "NOT_ACTIVE_SHOPPER"
        });
      }
    }

    // Update the user's role
    const response = await hasuraClient.request<UpdateRoleResponse>(
      UPDATE_USER_ROLE,
      {
        id: session.user.id,
        role,
      }
    );

    if (!response.update_Users_by_pk) {
      throw new Error("Failed to update user role");
    }

    // Update the session user object with the new role
    const updatedUser = {
      ...session.user,
      role: role as string
    };
    
    // Update the session
    Object.assign(session.user, updatedUser);

    return res.status(200).json({
      success: true,
      role: role,
      redirectTo: role === "shopper" ? "/ShopperDashboard" : "/"
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      error: "Failed to update user role",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
