import { Tier } from "@prisma/client";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tier: Tier;
      stripeCustomerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    tier: Tier;
    stripeCustomerId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier: Tier;
    stripeCustomerId: string | null;
    tierRefreshedAt: number;
  }
}
