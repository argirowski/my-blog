import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import {
  findCredentialUserByEmail,
  revokeAllRefreshTokensForUser,
} from "@/lib/db";
import { SESSION_COOKIE_MAX_AGE_SEC } from "@/lib/session-durations";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email and password",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;

        const user = findCredentialUserByEmail(email);
        if (!user) return null;

        const ok = bcrypt.compareSync(password, user.password_hash);
        if (!ok) return null;

        return {
          id: String(user.id),
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: SESSION_COOKIE_MAX_AGE_SEC,
  },
  events: {
    async signOut(message) {
      const id = Number(message.token?.sub);
      if (Number.isFinite(id) && id > 0) {
        revokeAllRefreshTokensForUser(id);
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
