import { NextApiRequest, NextApiResponse } from "next";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";

const GET_USERS = gql`
  query GetUsers($ids: [uuid!]) {
    Users(where: { id: { _in: $ids } }) {
      id
      name
      email
      profile_picture
      phone
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const { ids } = req.query;
    let variables = {};
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : (ids as string).split(",");
      variables = { ids: idArray };
    }

    const data = await hasuraClient.request<any>(GET_USERS, variables);
    res.status(200).json({ users: data.Users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}
