import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";

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

    const { name, email, phone, gender, image } = req.body;

    if (!name || !email || !phone || !gender) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
        return res.status(400).json({ error: "Invalid phone number format" });
    }

    try {
        // Check if user already exists
        const checkUserQuery = gql`
      query CheckExistingUser($email: String!, $phone: String!) {
        Users(
          where: {
            _or: [{ email: { _eq: $email } }, { phone: { _eq: $phone } }]
          }
        ) {
          id
          email
          phone
        }
      }
    `;

        const existingUsers = await hasuraClient.request<{
            Users: Array<{ id: string; email: string; phone: string }>;
        }>(checkUserQuery, { email, phone: cleanPhone });

        if (existingUsers.Users.length > 0) {
            const existingUser = existingUsers.Users[0];
            if (existingUser.email === email) {
                return res
                    .status(400)
                    .json({ error: "An account with this email already exists" });
            }
            if (existingUser.phone === cleanPhone) {
                return res
                    .status(400)
                    .json({ error: "An account with this phone number already exists" });
            }
        }

        const mutation = gql`
      mutation InsertUser($email: String!, $name: String!, $phone: String!, $gender: String!, $image: String) {
        insert_Users_one(
          object: {
            email: $email
            name: $name
            phone: $phone
            gender: $gender
            profile_picture: $image
            role: "user"
            is_active: true
          }
        ) {
          id
        }
      }
    `;

        const data = await hasuraClient.request<{
            insert_Users_one: { id: string };
        }>(mutation, {
            email,
            name,
            phone: cleanPhone,
            gender,
            image: image || null,
        });

        return res.status(200).json({ success: true, userId: data.insert_Users_one.id });
    } catch (error: any) {
        console.error("Error registering Google user:", error);
        return res.status(500).json({ error: "Registration failed. Please try again." });
    }
}
