import { Tier } from "@prisma/client";

const GUMROAD_ACCESS_TOKEN = process.env.GUMROAD_ACCESS_TOKEN!;

export const TIER_VIDEOS_PER_WEEK: Record<Exclude<Tier, "FREE">, number> = {
  HATCHLING: 3,
  DRAKE: 7,
  ELDER_DRAGON: 14,
};

/** Gumroad product permalinks for each tier */
export const GUMROAD_PRODUCTS: Record<
  Exclude<Tier, "FREE">,
  { permalink: string; productId: string }
> = {
  HATCHLING: {
    permalink: "tfcvqp",
    productId: "BZJd2YNvAXouL7pRhJEilw==",
  },
  DRAKE: {
    permalink: "hgvftr",
    productId: "uCuEiTMvw83vTLLJ7sjmrQ==",
  },
  ELDER_DRAGON: {
    permalink: "txpbh",
    productId: "5W08H4RMM4dhMeHEnzGRNw==",
  },
};

/** Map a Gumroad product ID back to a tier */
export function mapGumroadProductToTier(
  productId: string
): Exclude<Tier, "FREE"> | null {
  for (const [tier, info] of Object.entries(GUMROAD_PRODUCTS)) {
    if (info.productId === productId) {
      return tier as Exclude<Tier, "FREE">;
    }
  }
  return null;
}

/** Build the Gumroad checkout URL for a tier */
export function getCheckoutUrl(
  tier: Exclude<Tier, "FREE">,
  email: string
): string {
  const product = GUMROAD_PRODUCTS[tier];
  return `https://adonanthony.gumroad.com/l/${product.permalink}?email=${encodeURIComponent(email)}&wanted=true`;
}

/** Cancel a Gumroad subscription */
export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const res = await fetch(
    `https://api.gumroad.com/v2/resource_subscriptions/${subscriptionId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `access_token=${GUMROAD_ACCESS_TOKEN}&cancelled=true`,
    }
  );

  if (!res.ok) {
    const data = await res.text();
    throw new Error(`Gumroad cancel failed: ${data}`);
  }
}

/** Gumroad webhook payload (sale event) */
export interface GumroadSalePayload {
  seller_id: string;
  product_id: string;
  product_name: string;
  permalink: string;
  product_permalink: string;
  email: string;
  price: number;
  currency: string;
  quantity: number;
  order_number: string;
  sale_id: string;
  sale_timestamp: string;
  purchaser_id: string;
  subscription_id: string;
  recurrence: string;
  is_recurring_charge: boolean;
  refunded: boolean;
  resource_name: string;
  disputed: boolean;
  dispute_won: boolean;
}
