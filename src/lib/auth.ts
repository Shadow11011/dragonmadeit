import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Tier } from "@prisma/client";

const TIER_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid email or password");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          stripeCustomerId: user.stripeCustomerId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;
        token.stripeCustomerId = user.stripeCustomerId;
        token.tierRefreshedAt = Date.now();
      }

      // Re-fetch tier from DB periodically to address staleness bug
      if (trigger === "update" || Date.now() - (token.tierRefreshedAt ?? 0) > TIER_REFRESH_INTERVAL) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: { tier: true, stripeCustomerId: true },
          });
          if (dbUser) {
            token.tier = dbUser.tier;
            token.stripeCustomerId = dbUser.stripeCustomerId;
            token.tierRefreshedAt = Date.now();
          }
        } catch {
          // If DB is unavailable, keep existing token data
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.tier = token.tier;
      session.user.stripeCustomerId = token.stripeCustomerId;
      return session;
    },
  },
};
