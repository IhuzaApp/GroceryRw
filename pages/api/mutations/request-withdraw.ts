import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { hasuraClient } from "../../../src/lib/hasuraClient";
import { gql } from "graphql-request";
import { otpStore } from "../../../lib/otpStore";
import { momoService } from "../../../src/lib/momoService";
import bcrypt from "bcryptjs";
import { sendSMS } from "../../../src/lib/pindo";
import { sendWithdrawalInvoice } from "../../../src/lib/resend";
import { insertSystemLog } from "../queries/system-logs";
import { logErrorToSlack } from "../../../src/lib/slackErrorReporter";
import { sendLargeWithdrawalRequestToSlack } from "../../../src/lib/slackSupportNotifier";

const WITHDRAW_OTP_KEY_PREFIX = "withdraw-";

const REQUEST_WITHDRAW = gql`
  mutation RequestWithDraw(
    $amount: String!
    $businessWallet_id: uuid!
    $business_id: uuid!
    $phoneNumber: String
    $shopperWallet_id: uuid
    $shopper_id: uuid
    $status: String!
    $update_at: timestamptz!
    $verification_image: String!
  ) {
    insert_withDraweRequest(
      objects: {
        amount: $amount
        businessWallet_id: $businessWallet_id
        business_id: $business_id
        phoneNumber: $phoneNumber
        shopperWallet_id: $shopperWallet_id
        shopper_id: $shopper_id
        status: $status
        update_at: $update_at
        verification_image: $verification_image
      }
    ) {
      affected_rows
    }
  }
`;

const GET_USER_AND_WALLET_AND_CONFIG = gql`
  query GetUserAndWalletAndConfig($user_id: uuid!, $wallet_id: uuid!) {
    Users_by_pk(id: $user_id) {
      password_hash
      name
      email
    }
    business_wallet_by_pk(id: $wallet_id) {
      amount
    }
    System_configuratioins(limit: 1) {
      withDrawCharges
    }
  }
`;

const PROCESS_AUTO_DISBURSEMENT = gql`
  mutation ProcessAutoDisbursement(
    $wallet_id: uuid!
    $new_amount: String!
    $transaction_obj: businessTransactions_insert_input!
  ) {
    update_business_wallet_by_pk(
      pk_columns: { id: $wallet_id }
      _set: { amount: $new_amount }
    ) {
      id
      amount
    }
    insert_businessTransactions_one(object: $transaction_obj) {
      id
    }
  }
`;

interface SessionUser {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface Session {
  user: SessionUser;
  expires: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = (await getServerSession(
      req,
      res,
      authOptions as any
    )) as Session | null;

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!hasuraClient) {
      throw new Error("Hasura client is not initialized");
    }

    const {
      amount,
      business_id,
      businessWallet_id,
      phoneNumber = "",
      verification_image = "",
      otp: otpCode,
      password,
    } = req.body;

    if (!amount || amount === "" || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    if (!business_id) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    if (!businessWallet_id) {
      return res.status(400).json({
        error: "Business wallet ID is required",
      });
    }

    if (!verification_image || typeof verification_image !== "string") {
      return res.status(400).json({
        error: "Verification image is required",
      });
    }

    if (!otpCode || String(otpCode).length !== 6) {
      return res.status(400).json({
        error: "Valid 6-digit OTP is required",
      });
    }

    const userId = session.user.id;
    const stored = otpStore.get(`${WITHDRAW_OTP_KEY_PREFIX}${userId}`);

    if (!stored) {
      return res.status(400).json({
        error: "OTP not found or expired. Please request a new one.",
      });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`${WITHDRAW_OTP_KEY_PREFIX}${userId}`);
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    if (stored.otp !== String(otpCode)) {
      return res.status(400).json({
        error: "Invalid OTP. Please try again.",
      });
    }

    otpStore.delete(`${WITHDRAW_OTP_KEY_PREFIX}${userId}`);

    const numericAmount = parseFloat(amount);
    let finalStatus = "pending";

    // Fetch user hash, wallet balance and config in one query
    const dataRes = await hasuraClient.request<any>(
      GET_USER_AND_WALLET_AND_CONFIG,
      {
        user_id: userId,
        wallet_id: businessWallet_id,
      }
    );

    const user = dataRes.Users_by_pk;
    const wallet = dataRes.business_wallet_by_pk;
    const config = dataRes.System_configuratioins?.[0] || {};

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    if (!wallet) {
      return res.status(400).json({ error: "Business wallet not found" });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // Calculate fee
    const feePct = parseFloat(config.withDrawCharges || "0");
    const feeAmount = (numericAmount * feePct) / 100;
    const totalDeduction = numericAmount + feeAmount;
    const currentBalance = parseFloat(wallet.amount);

    if (currentBalance < totalDeduction) {
      return res
        .status(400)
        .json({ error: "Insufficient balance including service fee" });
    }

    // Auto-disburse via MoMo Disbursement API for withdrawals < 200,000
    if (numericAmount < 200000 && phoneNumber) {
      try {
        const momoRefId = `WITHDRAW-${Date.now()}`;
        await momoService.transfer({
          amount: numericAmount,
          currency: "RWF", // MoMo disbursement format
          payeeId: phoneNumber,
          partyIdType: "MSISDN",
          externalId: momoRefId,
          payerMessage: "Plas payout",
          payeeNote: "Thank you",
        });
        console.log("✅ [Withdrawal] Auto-disbursement initiated.");

        finalStatus = "completed"; // Mark success

        // Calculate new balance
        const newBalance = currentBalance - totalDeduction;

        // Process deduction and transaction logging
        await hasuraClient.request(PROCESS_AUTO_DISBURSEMENT, {
          wallet_id: businessWallet_id,
          new_amount: newBalance.toString(),
          transaction_obj: {
            action: "Withdrawal",
            amount: numericAmount.toString(),
            description: `Auto-disbursement withdrawal of ${numericAmount} RWF. Fee: ${feeAmount} RWF.`,
            mtn_response: "SUCCESSFUL",
            phone: phoneNumber,
            reference_id: momoRefId,
            status: "SUCCESSFUL",
            type: "debit",
            wallet_id: businessWallet_id,
            related_order: null,
          },
        });

        // Send SMS
        try {
          const shortRef = momoRefId.slice(-5);
          const smsText = `Plas Wallet : your witthdrwal of ${numericAmount} RWF was successfullt. fee ${feeAmount} RWF. new balance is ${newBalance} RWF. tracking code ${shortRef}. thank you`;
          await sendSMS(phoneNumber, smsText);
        } catch (smsErr) {
          console.error("Failed to send withdrawal SMS", smsErr);
        }

        // Send Email Invoice
        try {
          const emailToSend = user.email || session.user.email;
          if (emailToSend) {
            console.log(`Sending withdrawal invoice to email: ${emailToSend}`);
            await sendWithdrawalInvoice({
              to: emailToSend,
              customerName: user.name || "Customer",
              amount: numericAmount.toString(),
              fee: feeAmount.toString(),
              newBalance: newBalance.toString(),
              referenceId: momoRefId,
            });
          } else {
            console.warn(
              "No email found for user (both DB and Session were empty). Skipping invoice email."
            );
          }
        } catch (emailErr) {
          console.error("Failed to send withdrawal Email", emailErr);
        }
      } catch (err: any) {
        console.error("❌ [Withdrawal] Auto-disbursement failed:", err);

        await insertSystemLog(
          "error",
          `Auto-disbursement failed for ${amount} RWF`,
          "RequestWithdraw API",
          {
            error: err.message || err,
            business_id,
            businessWallet_id,
            phone: phoneNumber,
          }
        );

        await logErrorToSlack("RequestWithdraw API (Auto-Disbursement)", err, {
          business_id,
          businessWallet_id,
          phone: phoneNumber,
          amount,
        });

        // Throw the error so the request fails and the user gets informed
        throw new Error(err.message || "Auto-disbursement processing failed");
      }
    } else if (numericAmount >= 200000) {
      // Send Slack notification for large manual withdrawal
      try {
        await sendLargeWithdrawalRequestToSlack({
          amount: numericAmount.toString(),
          businessName: user.name || "Unknown Business",
          businessWalletId: businessWallet_id,
          contactName: user.name || "Customer",
          email: user.email,
          phone: phoneNumber,
          userId: user.id,
        });
      } catch (slackErr) {
        console.error("Failed to notify Slack for large withdrawal", slackErr);
      }
    }

    const result = await hasuraClient.request<{
      insert_withDraweRequest: { affected_rows: number };
    }>(REQUEST_WITHDRAW, {
      amount: String(amount),
      businessWallet_id,
      business_id,
      phoneNumber: phoneNumber || "",
      shopperWallet_id: null,
      shopper_id: null,
      status: finalStatus,
      update_at: new Date().toISOString(),
      verification_image: verification_image || "",
    });

    if (
      !result.insert_withDraweRequest ||
      result.insert_withDraweRequest.affected_rows === 0
    ) {
      throw new Error("Failed to create withdrawal request");
    }

    return res.status(200).json({
      success: true,
      message: "Withdrawal request submitted successfully",
    });
  } catch (error: any) {
    console.error("Error creating withdrawal request:", error);

    await insertSystemLog(
      "error",
      `Withdrawal request failed: ${error.message || "Unknown error"}`,
      "RequestWithdraw API",
      { error: error.message || error, body: req.body }
    );

    await logErrorToSlack("RequestWithdraw API", error, { body: req.body });

    return res.status(500).json({
      error: "Failed to submit withdrawal request",
      message: error.message,
    });
  }
}
