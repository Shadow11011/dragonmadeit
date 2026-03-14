import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      stripeCustomerId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    stripeCustomerId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    stripeCustomerId: string | null;
  }
}
