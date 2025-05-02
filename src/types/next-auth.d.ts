import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

// Extend the default session interface with an `id` on user
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
  }
}

// Extend the JWT payload to include user id
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
