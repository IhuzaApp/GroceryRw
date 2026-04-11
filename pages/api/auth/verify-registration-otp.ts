import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
import { otpStore } from "../../../lib/otpStore";
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
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Missing phone or OTP" });
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const storedData = otpStore.get(cleanPhone);

  if (!storedData) {
    return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(cleanPhone);
    return res.status(400).json({ error: "OTP expired. Please request a new one." });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP code" });
  }

  // OTP is valid, proceed with registration
  try {
    const { fullName, email, password, gender } = storedData;

    // Check one last time if user exists (to prevent race conditions)
    const checkUserQuery = gql`
      query CheckExistingUser($email: String!, $phone: String!) {
        Users(
          where: {
            _or: [{ email: { _eq: $email } }, { phone: { _eq: $phone } }]
          }
        ) {
          id
        }
      }
    `;

    const existingUsers = await hasuraClient.request<{
      Users: Array<{ id: string }>;
    }>(checkUserQuery, { email, phone: cleanPhone });

    if (existingUsers.Users.length > 0) {
      otpStore.delete(cleanPhone);
      return res.status(400).json({ error: "An account with this email or phone already exists" });
    }

    const password_hash = await bcrypt.hash(password!, 10);
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
    }>(mutation, { 
      name: fullName, 
      email, 
      phone: cleanPhone, 
      gender, 
      password_hash 
    });

    const newId = data.insert_Users.returning[0]?.id;

    // Remove from otpStore
    otpStore.delete(cleanPhone);

    return res.status(200).json({ 
      success: true, 
      userId: newId,
      message: "Account created successfully!" 
    });
  } catch (error: any) {
    console.error("Error finalizing registration:", error);
    return res.status(500).json({ error: "Registration failed. Please try again." });
  }
}
