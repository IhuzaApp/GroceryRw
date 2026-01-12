// In-memory OTP storage for development
// In production, use Redis or database for persistence

interface OTPData {
  otp: string;
  email: string;
  fullName: string;
  gender: string;
  expiresAt: number;
}

class OTPStore {
  private store: Map<string, OTPData>;

  constructor() {
    this.store = new Map();
  }

  set(userId: string, data: OTPData): void {
    this.store.set(userId, data);
  }

  get(userId: string): OTPData | undefined {
    return this.store.get(userId);
  }

  delete(userId: string): boolean {
    return this.store.delete(userId);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [userId, data] of this.store.entries()) {
      if (now > data.expiresAt) {
        this.store.delete(userId);
      }
    }
  }
}

// Export singleton instance
export const otpStore = new OTPStore();

// Cleanup expired OTPs every 5 minutes
setInterval(() => {
  otpStore.cleanup();
}, 5 * 60 * 1000);
