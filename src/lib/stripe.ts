import Stripe from "stripe";
import { Tier } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as Stripe.LatestApiVersion,
  typescript: true,
});

export const PRICE_IDS: Record<Exclude<Tier, "FREE">, string> = {
  HATCHLING: process.env.STRIPE_PRICE_HATCHLING || "price_hatchling",
  DRAKE: process.env.STRIPE_PRICE_DRAKE || "price_drake",
  ELDER_DRAGON: process.env.STRIPE_PRICE_ELDER_DRAGON || "price_elder_dragon",
};

export function mapStripePriceToTier(priceId: string): Tier {
  for (const [tier, id] of Object.entries(PRICE_IDS)) {
    if (id === priceId) return tier as Tier;
  }
  return "FREE";
}

export async function getOrCreateCustomer(userId: string, email: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeCustomerId: true },
  });

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/settings?checkout=cancel`,
    metadata: { userId },
  });

  return session.url!;
}

export async function createBillingPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
  });

  return session.url;
}
