import { randomUUID } from "crypto";

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  generated_at: number;
}

export interface Payer {
  partyIdType: "MSISDN";
  partyId: string;
}

export interface RequestToPayBody {
  amount: string;
  currency: string;
  externalId: string;
  payer: Payer;
  payerMessage: string;
  payeeNote: string;
}

export interface PaymentStatus {
  amount: string;
  currency: string;
  externalId: string;
  payer: Payer;
  status: "PENDING" | "SUCCESSFUL" | "FAILED" | "REJECTED" | "EXPIRED";
  reason?: string;
}

class MomoService {
  private token: TokenData | null = null;
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60; // 5 minutes buffer

  private getEnv() {
    return {
      subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY_SANDBOX,
      userId: process.env.MOMO_API_USER_SANDBOX,
      apiKey: process.env.MOMO_API_KEY_SANDBOX,
      baseUrl: (process.env.MOMO_SANDBOX_URL || "https://sandbox.momodeveloper.mtn.com").replace(/\/$/, ""),
      environment: "sandbox" as const,
    };
  }

  /**
   * Get a valid access token, generating a new one if missing or expired.
   */
  async getAccessToken(): Promise<string> {
    const { subscriptionKey, userId, apiKey, baseUrl } = this.getEnv();

    if (!subscriptionKey || !userId || !apiKey) {
      throw new Error("MTN MoMo credentials are not configured in environment variables.");
    }

    const now = Math.floor(Date.now() / 1000);
    if (this.token && this.token.generated_at + this.token.expires_in > now + this.TOKEN_EXPIRY_BUFFER) {
      return this.token.access_token;
    }

    console.log("🔄 [MoMo Service] Fetching new access token from:", `${baseUrl}/collection/token/`);
    console.log("🔑 [MoMo Service] Using credentials:", {
      hasSubscriptionKey: !!subscriptionKey,
      hasUserId: !!userId,
      hasApiKey: !!apiKey,
      subKeyPreview: subscriptionKey ? `${subscriptionKey.substring(0, 4)}...` : "none"
    });

    const auth = Buffer.from(`${userId}:${apiKey}`).toString("base64");

    const response = await fetch(`${baseUrl}/collection/token/`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [MoMo Service] Token generation failed:", errorText);
      throw new Error(`MoMo Token Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    this.token = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: parseInt(data.expires_in, 10),
      generated_at: now,
    };

    return this.token.access_token;
  }

  /**
   * Initiate a RequestToPay.
   */
  async requestToPay(params: {
    amount: number | string;
    currency: string;
    externalId: string;
    payerNumber: string;
    payerMessage?: string;
    payeeNote?: string;
    referenceId?: string;
  }): Promise<{ referenceId: string }> {
    const referenceId = params.referenceId || randomUUID();
    const { subscriptionKey, baseUrl, environment } = this.getEnv();

    const finalCurrency = environment === "sandbox" ? "EUR" : params.currency;
    const body = {
      amount: String(params.amount),
      currency: finalCurrency,
      externalId: params.externalId,
      payer: {
        partyIdType: "MSISDN",
        partyId: this.formatPhoneNumber(params.payerNumber),
      },
      payerMessage: params.payerMessage || "Payment Request",
      payeeNote: params.payeeNote || "Thank you",
    };

    const callApi = async (retry = true): Promise<Response> => {
      const token = await this.getAccessToken();
      const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey!,
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": environment,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.status === 401 && retry) {
        console.warn("⚠️ [MoMo Service] 401 Unauthorized, retrying once...");
        this.token = null; // Clear cached token
        return callApi(false);
      }
      return response;
    };

    const response = await callApi();

    if (response.status !== 202) {
      const errorText = await response.text();
      console.error("❌ [MoMo Service] RequestToPay failed:", errorText);
      throw new Error(`MoMo RequestToPay Error: ${response.status} - ${errorText}`);
    }

    console.log("✅ [MoMo Service] RequestToPay accepted, referenceId:", referenceId);
    return { referenceId };
  }

  /**
   * Check the status of a payment request.
   */
  async getPaymentStatus(referenceId: string): Promise<PaymentStatus> {
    const { subscriptionKey, baseUrl, environment } = this.getEnv();

    const callApi = async (retry = true): Promise<Response> => {
      const token = await this.getAccessToken();
      const response = await fetch(`${baseUrl}/collection/v1_0/requesttopay/${referenceId}`, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": subscriptionKey!,
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": environment,
        },
      });

      if (response.status === 401 && retry) {
        console.warn("⚠️ [MoMo Service] 401 Unauthorized, retrying once...");
        this.token = null; // Clear cached token
        return callApi(false);
      }
      return response;
    };

    const response = await callApi();

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ [MoMo Service] GetPaymentStatus failed:", errorText);
      throw new Error(`MoMo GetPaymentStatus Error: ${response.status} - ${errorText}`);
    }

    return (await response.json()) as PaymentStatus;
  }

  /**
   * Request a disbursement (transfer)
   * @param amount Amount to transfer
   * @param currency Currency code (e.g., "RWF")
   * @param payeeNumber Phone number of the payee (e.g., "25078xxxxxxx")
   * @param externalId External reference ID
   * @param payerMessage Message for the payer
   * @param payeeNote Note for the payee
   * @returns Reference ID of the transfer request
   */
  async transfer(
    amount: number | string,
    currency: string,
    payeeNumber: string,
    externalId: string,
    payerMessage: string = "Transfer request",
    payeeNote: string = "Transfer confirmation",
    referenceId?: string
  ): Promise<{ referenceId: string }> {
    const finalReferenceId = referenceId || randomUUID();
    const token = await this.getAccessToken();
    const { baseUrl, subscriptionKey, environment } = this.getEnv();

    const url = `${baseUrl}/disbursement/v1_0/transfer`;
    const payload = {
      amount: amount.toString(),
      currency,
      externalId,
      payee: {
        partyIdType: "MSISDN",
        partyId: this.formatPhoneNumber(payeeNumber),
      },
      payerMessage,
      payeeNote,
    };

    const headers = {
      Authorization: `Bearer ${token}`,
      "X-Reference-Id": finalReferenceId,
      "X-Target-Environment": environment,
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": subscriptionKey!,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.status === 202) {
        return { referenceId: finalReferenceId };
      }

      if (response.status === 401) {
        // Redo once with fresh token
        this.token = null;
        return this.transfer(
          amount,
          currency,
          payeeNumber,
          externalId,
          payerMessage,
          payeeNote,
          finalReferenceId
        );
      }

      const errorText = await response.text();
      throw new Error(`MoMo transfer failed (${response.status}): ${errorText}`);
    } catch (error) {
      console.error("💥 [momoService] Transfer error:", error);
      throw error;
    }
  }

  /**
   * Check the status of a disbursement (transfer)
   * @param referenceId The X-Reference-Id used in the transfer request
   * @returns Transfer status object
   */
  async getTransferStatus(referenceId: string): Promise<any> {
    const token = await this.getAccessToken();
    const { baseUrl, subscriptionKey, environment } = this.getEnv();

    const url = `${baseUrl}/disbursement/v1_0/transfer/${referenceId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "X-Target-Environment": environment,
      "Ocp-Apim-Subscription-Key": subscriptionKey!,
    };

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 401) {
        this.token = null;
        return this.getTransferStatus(referenceId);
      }

      const errorText = await response.text();
      throw new Error(
        `MoMo getTransferStatus failed (${response.status}): ${errorText}`
      );
    } catch (error) {
      console.error("💥 [momoService] GetTransferStatus error:", error);
      throw error;
    }
  }
  private formatPhoneNumber(phone: string): string {
    let partyId = String(phone).replace(/\D/g, "");
    if (partyId.startsWith("0")) {
      partyId = "250" + partyId.slice(1);
    } else if (!partyId.startsWith("250")) {
      partyId = "250" + partyId;
    }
    return partyId;
  }
}

export const momoService = new MomoService();
