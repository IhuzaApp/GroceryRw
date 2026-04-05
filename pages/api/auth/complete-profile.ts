import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
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

  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { phone, gender } = req.body;

  if (!phone || !gender) {
    return res.status(400).json({ error: "Missing phone or gender" });
  }

  // Clean phone number
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const mutation = gql`
      mutation UpdateProfile($id: uuid!, $phone: String!, $gender: String!) {
        update_Users_by_pk(
          pk_columns: { id: $id }
          _set: { phone: $phone, gender: $gender }
        ) {
          id
        }
      }
    `;

    await hasuraClient.request(mutation, {
      id: (session.user as any).id,
      phone: cleanPhone,
      gender,
    });

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
