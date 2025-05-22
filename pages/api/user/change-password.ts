import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import type { Session } from "next-auth";
import bcrypt from "bcryptjs";

// Query to get user password hash
const GET_USER_PASSWORD = gql`
  query GetUserPassword($id: uuid!) {
    Users_by_pk(id: $id) {
      id
      password
    }
  }
`;

// Mutation to update user password
const UPDATE_USER_PASSWORD = gql`
  mutation UpdateUserPassword($id: uuid!, $password: String!) {
    update_Users_by_pk(
      pk_columns: { id: $id }
      _set: { password: $password, updated_at: "now()" }
    ) {
      id
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
  const { currentPassword, newPassword } = req.body;

  // Validate required fields
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Both current and new passwords are required" });
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ message: "New password must be at least 8 characters long" });
  }

  try {
    // Initialize Hasura client
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    // Get current password hash
    const userData = await hasuraClient.request<{
      Users_by_pk: { id: string; password: string } | null;
    }>(GET_USER_PASSWORD, { id: user_id });

    if (!userData.Users_by_pk || !userData.Users_by_pk.password) {
      return res
        .status(404)
        .json({ message: "User not found or password not set" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userData.Users_by_pk.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await hasuraClient.request<{
      update_Users_by_pk: { id: string; updated_at: string };
    }>(UPDATE_USER_PASSWORD, {
      id: user_id,
      password: hashedPassword,
    });

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ message: "Failed to update password" });
  }
}
