import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
import { otpStore } from "../../../lib/otpStore";
import { sendSMS } from "../../../src/lib/pindo";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { "x-hasura-admin-secret": HASURA_SECRET },
});

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password, phone, gender } = req.body;

  // Validate required fields
  if (!name || !email || !password || !phone || !gender) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  // Validate password strength
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  // Validate phone format (basic validation)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = phone.replace(/\D/g, "");
  // Ensure it starts with country code for Pindo (Rwandan numbers if missing prefix)
  let formattedPhone = phone;
  if (!phone.startsWith('+')) {
      if (cleanPhone.startsWith('0')) {
          formattedPhone = '+250' + cleanPhone.substring(1);
      } else if (!cleanPhone.startsWith('250')) {
          formattedPhone = '+250' + cleanPhone;
      } else {
          formattedPhone = '+' + cleanPhone;
      }
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

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store registration data + OTP in otpStore
    // We use the phone number as the key
    otpStore.set(cleanPhone, {
      otp,
      email: email.toLowerCase(),
      fullName: name,
      phone: cleanPhone,
      password, // Password will be hashed in the next step
      gender,
      expiresAt,
    });

    // Send OTP via Pindo SMS
    const message = `Welcome to Plas! Your verification code is: ${otp}. Valid for 10 minutes.`;
    await sendSMS(formattedPhone, message);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // For development, include OTP in response (remove in production)
      devOTP: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error: any) {
    console.error("Error sending registration OTP:", error);
    return res.status(500).json({ error: "Failed to send OTP. Please try again." });
  }
}
