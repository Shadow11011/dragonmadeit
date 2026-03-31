import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const SESSION_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

async function userHasActiveSubscription(userId: string): Promise<boolean> {
  const count = await prisma.tikTokAccount.count({
    where: {
      userId,
      tier: { not: "FREE" },
      gumroadSubscriptionId: { not: null },
    },
  });
  return count > 0;
}

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

        if (!user.emailVerified) {
          throw new Error("Please verify your email first");
        }

        const hasActive = await userHasActiveSubscription(user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          onboardingComplete: user.onboardingComplete,
          hasActiveSubscription: hasActive,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.onboardingComplete = user.onboardingComplete;
        token.hasActiveSubscription = user.hasActiveSubscription;
        token.refreshedAt = Date.now();
      }

      // Re-fetch from DB periodically to address staleness after payment events
      if (
        trigger === "update" ||
        Date.now() - (token.refreshedAt ?? 0) > SESSION_REFRESH_INTERVAL
      ) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id },
            select: {
              onboardingComplete: true,
            },
          });
          if (dbUser) {
            token.onboardingComplete = dbUser.onboardingComplete;
            token.hasActiveSubscription = await userHasActiveSubscription(
              token.id
            );
            token.refreshedAt = Date.now();
          }
        } catch {
          // If DB is unavailable, keep existing token data
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.onboardingComplete = token.onboardingComplete;
      session.user.hasActiveSubscription = token.hasActiveSubscription;
      return session;
    },
  },
};
