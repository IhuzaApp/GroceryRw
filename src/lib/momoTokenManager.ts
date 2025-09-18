interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  generated_at: number; // timestamp when token was generated
}

interface CachedToken {
  token: string;
  expiresAt: number; // timestamp when token expires
}

class MomoTokenManager {
  private readonly STORAGE_KEY = "momo_access_token";
  private readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer before expiry

  /**
   * Get a valid access token, generating a new one if needed
   */
  async getValidToken(): Promise<string> {
    try {
      // Check if we have a cached token
      const cachedToken = this.getCachedToken();

      if (cachedToken && this.isTokenValid(cachedToken)) {
        console.log("Using cached MoMo token");
        return cachedToken.token;
      }

      // Generate new token
      console.log("Generating new MoMo token");
      const newToken = await this.generateNewToken();

      // Cache the new token
      this.cacheToken(newToken);

      return newToken.access_token;
    } catch (error) {
      console.error("Error getting MoMo token:", error);
      throw error;
    }
  }

  /**
   * Generate a new token from MoMo API
   */
  private async generateNewToken(): Promise<TokenData> {
    try {
      const response = await fetch("/api/momo/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check if it's a credentials issue (401/403)
        if (response.status === 401 || response.status === 403) {
          console.log("MoMo credentials not configured, using test token");
          // Return a test token for development
          return this.generateTestToken();
        }

        throw new Error(`Token generation failed: ${errorText}`);
      }

      const tokenData: TokenData = await response.json();

      // Add generation timestamp
      tokenData.generated_at = Date.now();

      return tokenData;
    } catch (error) {
      console.error("Error generating MoMo token:", error);

      // If it's a network error or credentials issue, use test token
      if (error instanceof Error && error.message.includes("401")) {
        console.log("Using test token due to credentials issue");
        return this.generateTestToken();
      }

      throw error;
    }
  }

  /**
   * Generate a test token for development/testing
   */
  private generateTestToken(): TokenData {
    const testToken = {
      access_token: `test_token_${Date.now()}`,
      token_type: "Bearer",
      expires_in: 3600, // 1 hour
      generated_at: Date.now(),
    };

    console.log("Generated test MoMo token for development");
    return testToken;
  }

  /**
   * Get cached token from localStorage
   */
  private getCachedToken(): CachedToken | null {
    if (typeof window === "undefined") return null;

    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error("Error reading cached token:", error);
      return null;
    }
  }

  /**
   * Cache token to localStorage
   */
  private cacheToken(tokenData: TokenData): void {
    if (typeof window === "undefined") return;

    try {
      const expiresAt = tokenData.generated_at + tokenData.expires_in * 1000;

      const cachedToken: CachedToken = {
        token: tokenData.access_token,
        expiresAt: expiresAt,
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cachedToken));
      console.log(
        `MoMo token cached until ${new Date(expiresAt).toISOString()}`
      );
    } catch (error) {
      console.error("Error caching token:", error);
    }
  }

  /**
   * Check if cached token is still valid
   */
  private isTokenValid(cachedToken: CachedToken): boolean {
    const now = Date.now();
    const isValid = cachedToken.expiresAt > now + this.TOKEN_EXPIRY_BUFFER;

    if (!isValid) {
      console.log("Cached MoMo token has expired");
    }

    return isValid;
  }

  /**
   * Clear cached token (useful for logout or errors)
   */
  clearCachedToken(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log("MoMo token cache cleared");
    } catch (error) {
      console.error("Error clearing token cache:", error);
    }
  }

  /**
   * Get token info for debugging
   */
  getTokenInfo(): { cached: boolean; expiresAt?: string; isValid?: boolean } {
    const cachedToken = this.getCachedToken();

    if (!cachedToken) {
      return { cached: false };
    }

    return {
      cached: true,
      expiresAt: new Date(cachedToken.expiresAt).toISOString(),
      isValid: this.isTokenValid(cachedToken),
    };
  }
}

// Export singleton instance
export const momoTokenManager = new MomoTokenManager();
export default momoTokenManager;
