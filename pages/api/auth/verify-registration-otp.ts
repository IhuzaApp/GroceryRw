import { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
import { otpStore } from "../../../lib/otpStore";
import bcrypt from "bcryptjs";
import { resend } from "../../../src/lib/resend";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";

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
    return res
      .status(400)
      .json({ error: "OTP expired or not found. Please request a new one." });
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(cleanPhone);
    return res
      .status(400)
      .json({ error: "OTP expired. Please request a new one." });
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
      return res
        .status(400)
        .json({ error: "An account with this email or phone already exists" });
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
      password_hash,
    });

    const newId = data.insert_Users.returning[0]?.id;

    // Remove from otpStore
    otpStore.delete(cleanPhone);

    // --- Start: Send Welcome Email via Resend ---
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #00D9A5; padding: 30px; text-align: center;">
            <img src="https://www.plas.rw/assets/logos/PlasLogoPNG.png" alt="Plas Logo" style="width: 140px; margin-bottom: 5px;">
       
            <h1 style="color: #fff; margin: 0; font-size: 26px;">Welcome , ${fullName}!</h1>
            <b style="color: #fff; margin: 0; font-size: 26px;">Plas Me to make your life easy</b>

          </div>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px;">We're thrilled to have you join our community!</p>
            <p>At Plas, we're not just about delivery—we're about the future of shopping. Here's how you can make the most of your new account:</p>
            
            <div style="display: grid; gap: 20px; margin: 25px 0;">
              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="color: #00D9A5; margin-top: 0; display: flex; align-items: center;">🤖 AI-Powered Shopping</h3>
                <p style="margin-bottom: 0;">Experience shopping like never before with our <strong>AI Assistant</strong>. Finding products and checking out has never been more interactive and effortless.</p>
              </div>

              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="color: #00D9A5; margin-top: 0;">🎥 Reel Shopping</h3>
                <p style="margin-bottom: 0;">Discover and buy products directly through <strong>curated video reels</strong>. Just watch, click, and shop!</p>
              </div>

              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="color: #00D9A5; margin-top: 0;">💼 Own a Plas Business</h3>
                <p style="margin-bottom: 0;">Ready to earn? Start your own <strong>Plas Business</strong> with a single click. Sell your items to a global audience and manage your store with ease.</p>
              </div>

              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="color: #00D9A5; margin-top: 0;">🤝 Refer & Earn</h3>
                <p style="margin-bottom: 0;">Share the love! <strong>Make money</strong> every time you refer a friend to shop or create an account on the Plas app.</p>
              </div>

              <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
                <h3 style="color: #00D9A5; margin-top: 0;">💳 Wallet & Self-Checkout</h3>
                <p style="margin-bottom: 0;">Enjoy <strong>cashless shopping</strong> with your digital wallet. Use it to shop at any store with our fast <strong>self-checkout</strong> feature.</p>
              </div>
            </div>

            <p>Your journey starts here. Click below to sign in and experience the future of commerce.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://plas.rw/Auth/Login" style="background-color: #00D9A5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Explore Plas App</a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="margin: 0;">Welcome home,</p>
              <p style="margin: 5px 0; font-weight: bold; color: #00D9A5;">Plas Support Team</p>
              <p style="margin: 0; font-size: 12px; color: #999;">Kigali, Rwanda | www.plas.rw</p>
            </div>
          </div>
        </div>
      `;

      await resend.emails.send({
        from: 'Plas App <onboarding@plas.rw>',
        to: [email],
        subject: 'Welcome to Plas - Your Account is Ready!',
        html: emailHtml,
      });

      console.log(`[Resend] Welcome email sent to ${email}`);
    } catch (emailErr) {
      console.error("[Resend] Failed to send welcome email:", emailErr);
      await logErrorToSlack("VerifyRegistrationOTP:EmailNotification", emailErr, { email, fullName });
    }
    // --- End: Send Welcome Email ---

    return res.status(200).json({
      success: true,
      userId: newId,
      message: "Account created successfully!",
    });
  } catch (error: any) {
    console.error("Error finalizing registration:", error);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
}
