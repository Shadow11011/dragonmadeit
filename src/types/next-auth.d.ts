import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      paystackCustomerCode: string | null;
      onboardingComplete: boolean;
      hasActiveSubscription: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    paystackCustomerCode: string | null;
    onboardingComplete: boolean;
    hasActiveSubscription: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    paystackCustomerCode: string | null;
    onboardingComplete: boolean;
    hasActiveSubscription: boolean;
    refreshedAt: number;
  }
}
