import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
import bcrypt from "bcryptjs";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email, password, phone, gender } = req.body;
  if (!name || !email || !password || !phone || !gender) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const mutation = gql`
      mutation RegisterUser(
        $name: String!
        $email: String!
        $phone: String!
        $gender: String!
        $password_hash: String!
      ) {
        insert_Users(
          objects: {
            name: $name
            email: $email
            phone: $phone
            gender: $gender
            role: "user"
            password_hash: $password_hash
            is_active: true
          }
        ) {
          returning {
            id
          }
        }
      }
    `;
    const data = await hasuraClient.request<{
      insert_Users: { returning: { id: string }[] };
    }>(mutation, { name, email, phone, gender, password_hash });
    const newId = data.insert_Users.returning[0]?.id;
    return res.status(200).json({ success: true, userId: newId });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Registration failed" });
  }
}
