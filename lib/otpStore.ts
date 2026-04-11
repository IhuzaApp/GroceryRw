// In-memory OTP storage for development
// In production, use Redis or database for persistence

interface OTPData {
  otp: string;
  email: string;
  fullName: string;
  phone: string;
  password?: string;
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

// Use a process-wide global so the same store is shared across all API routes
// (Next.js can load the module in different contexts, giving separate instances otherwise)
const globalForOtp =
  typeof globalThis !== "undefined"
    ? globalThis
    : typeof global !== "undefined"
    ? global
    : ({} as any);
const STORE_KEY = "__otpStore__";
const otpStore = ((globalForOtp as any)[STORE_KEY] ??=
  new OTPStore()) as OTPStore;

export { otpStore };

// Cleanup expired OTPs every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    otpStore.cleanup();
  }, 5 * 60 * 1000);
}
