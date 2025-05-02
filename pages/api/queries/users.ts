import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_USERS = gql`
  query GetUsers {
    Users {
      id
      name
      email
      created_at
      updated_at
      gender
      is_active
      password_hash
      phone
      profile_picture
      role
    }
  }
`;

interface UsersResponse {
  Users: Array<{
    id: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const data = await hasuraClient.request<UsersResponse>(GET_USERS);
    res.status(200).json({ users: data.Users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
