import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend the default session interface with an `id` on user
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      phone?: string;
      gender?: string;
      is_guest: boolean;
      isProfileComplete?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: string;
    phone?: string;
    gender?: string;
    is_guest: boolean;
    isProfileComplete?: boolean;
  }
}

// Extend the JWT payload to include user id and other fields
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    phone?: string;
    gender?: string;
    is_guest: boolean;
    isProfileComplete?: boolean;
  }
}
