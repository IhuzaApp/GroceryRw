import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  const { role } = req.body;
  if (!role || (role !== "user" && role !== "shopper")) {
    return res.status(400).json({ error: "Invalid role" });
  }
  try {
    const mutation = gql`
      mutation UpdateUserRole($id: uuid!, $role: String!) {
        update_Users_by_pk(pk_columns: { id: $id }, _set: { role: $role }) {
          id
          role
        }
      }
    `;

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const response = await hasuraClient.request<{
      update_Users_by_pk: { id: string; role: string };
    }>(mutation, {
      id: session.user.id,
      role,
    });
    const updated = response.update_Users_by_pk;

    // Set a cookie to indicate role has been changed
    // This will be used by our middleware to force session refresh
    res.setHeader("Set-Cookie", [
      `role_changed=true; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`,
      `new_role=${role}; Path=/; HttpOnly; SameSite=Lax; Max-Age=60`,
    ]);

    return res.status(200).json({
      role: updated.role,
      success: true,
      message:
        "Role updated successfully. Please sign out and sign in again to apply changes.",
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ error: "Failed to update user role" });
  }
}
