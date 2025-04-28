import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { GraphQLClient, gql } from "graphql-request";
import bcrypt from "bcryptjs";

const HASURA_URL = process.env.HASURA_GRAPHQL_URL!;
const HASURA_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET!;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

const hasuraClient = new GraphQLClient(HASURA_URL, {
  headers: { 'x-hasura-admin-secret': HASURA_SECRET }
});

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        if (!credentials) return null;
        const { email, password } = credentials;
        const query = gql`
          query GetUserByEmail($email: String!) {
            Users(where: { email: { _eq: $email }, is_active: { _eq: true } }) {
              id
              name
              email
              password_hash
            }
          }
        `;
        const res = await hasuraClient.request<{
          Users: { id: string; name: string; email: string; password_hash: string }[];
        }>(query, { email });
        const user = res.Users[0];
        if (!user) {
          throw new Error("No user found");
        }
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }
        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  session: { strategy: "jwt" },
  jwt: { secret: NEXTAUTH_SECRET },
  secret: NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  }
}); 