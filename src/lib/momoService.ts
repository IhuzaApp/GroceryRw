import { randomUUID } from "crypto";

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  generated_at: number;
}

export interface Payer {
  partyIdType: "MSISDN" | "EMAIL" | "PERSONAL_ID";
  partyId: string;
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
  private collectionToken: TokenData | null = null;
  private disbursementToken: TokenData | null = null;
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60; // 5 minutes buffer

  private getEnv() {
    return {
      subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY_SANDBOX,
      userId: process.env.MOMO_API_USER_SANDBOX,
      apiKey: process.env.MOMO_API_KEY_SANDBOX,
      baseUrl: (
        process.env.MOMO_SANDBOX_URL || "https://sandbox.momodeveloper.mtn.com"
      ).replace(/\/$/, ""),
      environment: "sandbox" as const,
    };
  }

  /**
   * Get a valid access token for a specific product, generating a new one if missing or expired.
   */
  async getAccessToken(product: "collection" | "disbursement"): Promise<string> {
    const { subscriptionKey, userId, apiKey, baseUrl } = this.getEnv();

    if (!subscriptionKey || !userId || !apiKey) {
      throw new Error(
        "MTN MoMo credentials are not configured in environment variables."
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const cachedToken = product === "collection" ? this.collectionToken : this.disbursementToken;

    if (
      cachedToken &&
      cachedToken.generated_at + cachedToken.expires_in >
      now + this.TOKEN_EXPIRY_BUFFER
    ) {
      return cachedToken.access_token;
    }

    console.log(
      `🔄 [MoMo Service] Fetching new ${product} access token...`
    );

    const auth = Buffer.from(`${userId}:${apiKey}`).toString("base64");

    const response = await fetch(`${baseUrl}/${product}/token/`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": subscriptionKey,
        Authorization: `Basic ${auth}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [MoMo Service] ${product} token generation failed:`, errorText);
      throw new Error(`MoMo ${product} Token Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const newToken = {
      access_token: data.access_token,
      token_type: data.token_type,
      expires_in: parseInt(data.expires_in, 10),
      generated_at: now,
    };

    if (product === "collection") this.collectionToken = newToken;
    else this.disbursementToken = newToken;

    return newToken.access_token;
  }

  /**
   * Initiate a RequestToPay (Collection API).
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
      const token = await this.getAccessToken("collection");
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
        this.collectionToken = null;
        return callApi(false);
      }
      return response;
    };

    const response = await callApi();

    if (response.status !== 202) {
      const errorText = await response.text();
      throw new Error(`MoMo RequestToPay Error: ${response.status} - ${errorText}`);
    }

    return { referenceId };
  }

  /**
   * Check status of a RequestToPay.
   */
  async getPaymentStatus(referenceId: string): Promise<PaymentStatus> {
    const { subscriptionKey, baseUrl, environment } = this.getEnv();

    const callApi = async (retry = true): Promise<Response> => {
      const token = await this.getAccessToken("collection");
      const response = await fetch(
        `${baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
        {
          method: "GET",
          headers: {
            "Ocp-Apim-Subscription-Key": subscriptionKey!,
            Authorization: `Bearer ${token}`,
            "X-Target-Environment": environment,
          },
        }
      );

      if (response.status === 401 && retry) {
        this.collectionToken = null;
        return callApi(false);
      }
      return response;
    };

    const response = await callApi();
    if (!response.ok) throw new Error(`MoMo status check failed: ${response.status}`);
    return (await response.json()) as PaymentStatus;
  }

  /**
   * Initiate a Transfer (Disbursement API).
   * Can be used to disburse to a phone number or a MoMo code.
   */
  async transfer(params: {
    amount: number | string;
    currency: string;
    payeeId: string;
    partyIdType?: "MSISDN" | "EMAIL" | "PERSONAL_ID";
    externalId: string;
    payerMessage?: string;
    payeeNote?: string;
    referenceId?: string;
  }): Promise<{ referenceId: string }> {
    const referenceId = params.referenceId || randomUUID();
    const { subscriptionKey, baseUrl, environment } = this.getEnv();

    const finalCurrency = environment === "sandbox" ? "EUR" : params.currency;

    // For MoMo codes, we often use MSISDN if it looks like a code, or the provided type
    const partyId = params.partyIdType === "MSISDN" || !params.partyIdType
      ? this.formatPhoneNumber(params.payeeId)
      : params.payeeId;

    const body = {
      amount: String(params.amount),
      currency: finalCurrency,
      externalId: params.externalId,
      payee: {
        partyIdType: params.partyIdType || "MSISDN",
        partyId: partyId,
      },
      payerMessage: params.payerMessage || "Disbursement Request",
      payeeNote: params.payeeNote || "Payment Confirmed",
    };

    const callApi = async (retry = true): Promise<Response> => {
      const token = await this.getAccessToken("disbursement");
      const response = await fetch(`${baseUrl}/disbursement/v1_0/transfer`, {
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
        this.disbursementToken = null;
        return callApi(false);
      }
      return response;
    };

    const response = await callApi();

    if (response.status !== 202) {
      const errorText = await response.text();
      console.error("❌ [MoMo Service] Transfer failed:", errorText);
      throw new Error(`MoMo Transfer Error: ${response.status} - ${errorText}`);
    }

    return { referenceId };
  }

  /**
   * Check status of a Transfer (Disbursement API).
   */
  async getTransferStatus(referenceId: string): Promise<any> {
    const { subscriptionKey, baseUrl, environment } = this.getEnv();

    const callApi = async (retry = true): Promise<Response> => {
      const token = await this.getAccessToken("disbursement");
      const response = await fetch(
        `${baseUrl}/disbursement/v1_0/transfer/${referenceId}`,
        {
          method: "GET",
          headers: {
            "Ocp-Apim-Subscription-Key": subscriptionKey!,
            Authorization: `Bearer ${token}`,
            "X-Target-Environment": environment,
          },
        }
      );

      if (response.status === 401 && retry) {
        this.disbursementToken = null;
        return callApi(false);
      }
      return response;
    };

    const response = await callApi();
    if (!response.ok) throw new Error(`MoMo transfer status check failed: ${response.status}`);
    return await response.json();
  }

  private formatPhoneNumber(phone: string): string {
    let partyId = String(phone).replace(/\D/g, "");

    // If it's a short MoMo code (5-6 digits), don't add prefix
    if (partyId.length >= 5 && partyId.length <= 8) {
      return partyId;
    }

    if (partyId.startsWith("0")) {
      partyId = "250" + partyId.slice(1);
    } else if (!partyId.startsWith("250") && partyId.length >= 9) {
      partyId = "250" + partyId;
    }
    return partyId;
  }
}

export const momoService = new MomoService();
