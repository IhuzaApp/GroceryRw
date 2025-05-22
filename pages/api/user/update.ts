import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import type { Session } from "next-auth";

// Mutation to update user profile
const UPDATE_USER = gql`
  mutation UpdateUser($id: uuid!, $name: String!, $phone: String, $gender: String) {
    update_Users_by_pk(
      pk_columns: { id: $id }, 
      _set: { 
        name: $name, 
        phone: $phone, 
        gender: $gender,
        updated_at: "now()" 
      }
    ) {
      id
      name
      email
      phone
      gender
      updated_at
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Get user session
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    // Check if user is authenticated
    if (!session?.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user_id = (session.user as any).id as string;
    const { name, phone, gender } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: "Username is required" });
    }

    // Debug log
    console.log("Updating user profile:", { user_id, name, phone, gender });
    
    // Initialize Hasura client
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Execute update mutation
    const result = await hasuraClient.request<{
      update_Users_by_pk: {
        id: string;
        name: string;
        email: string;
        phone: string | null;
        gender: string | null;
        updated_at: string;
      };
    }>(UPDATE_USER, {
      id: user_id,
      name,
      phone: phone || null,
      gender: gender || null
    });

    console.log("Update successful:", result);

    return res.status(200).json({
      message: "Profile updated successfully",
      user: result.update_Users_by_pk,
    });
  } catch (error: any) {
    console.error("Error updating user profile:", error);
    console.error("Error details:", error.message, error.stack);
    
    if (error.response?.errors) {
      console.error("GraphQL errors:", JSON.stringify(error.response.errors));
    }

    return res.status(500).json({ 
      message: "Failed to update profile",
      error: error.message || "Unknown error"
    });
  }
}
