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
    const response = await hasuraClient.request<{
      update_Users_by_pk: { id: string; role: string };
    }>(mutation, {
      id: session.user.id,
      role,
    });
    const updated = response.update_Users_by_pk;
    return res.status(200).json({ role: updated.role });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({ error: "Failed to update user role" });
  }
}
