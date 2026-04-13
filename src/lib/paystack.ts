import { Tier, BillingInterval } from "@prisma/client";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export const TIER_VIDEOS_PER_WEEK: Record<Exclude<Tier, "FREE">, number> = {
  HATCHLING: 3,
  DRAKE: 7,
  ELDER_DRAGON: 14,
};

type PaidTier = Exclude<Tier, "FREE">;

/** Paystack plan codes for each tier + billing interval */
export const PAYSTACK_PLAN_CODES: Record<
  PaidTier,
  Record<BillingInterval, string>
> = {
  HATCHLING: {
    MONTHLY: process.env.PAYSTACK_HATCHLING_MONTHLY_PLAN_CODE!,
    QUARTERLY: process.env.PAYSTACK_HATCHLING_QUARTERLY_PLAN_CODE!,
    ANNUAL: process.env.PAYSTACK_HATCHLING_ANNUAL_PLAN_CODE!,
  },
  DRAKE: {
    MONTHLY: process.env.PAYSTACK_DRAKE_MONTHLY_PLAN_CODE!,
    QUARTERLY: process.env.PAYSTACK_DRAKE_QUARTERLY_PLAN_CODE!,
    ANNUAL: process.env.PAYSTACK_DRAKE_ANNUAL_PLAN_CODE!,
  },
  ELDER_DRAGON: {
    MONTHLY: process.env.PAYSTACK_ELDER_DRAGON_MONTHLY_PLAN_CODE!,
    QUARTERLY: process.env.PAYSTACK_ELDER_DRAGON_QUARTERLY_PLAN_CODE!,
    ANNUAL: process.env.PAYSTACK_ELDER_DRAGON_ANNUAL_PLAN_CODE!,
  },
};

/** Reverse lookup: plan code → { tier, interval } */
export function mapPlanCodeToTier(
  planCode: string
): { tier: PaidTier; interval: BillingInterval } | null {
  for (const [tier, intervals] of Object.entries(PAYSTACK_PLAN_CODES)) {
    for (const [interval, code] of Object.entries(intervals)) {
      if (code === planCode) {
        return {
          tier: tier as PaidTier,
          interval: interval as BillingInterval,
        };
      }
    }
  }
  return null;
}

/** Verify Paystack webhook signature (HMAC-SHA512) */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

/** Initialize a Paystack transaction for subscription */
export async function initializeTransaction(params: {
  email: string;
  plan: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorization_url: string; access_code: string; reference: string }> {
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      plan: params.plan,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });

  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data: { authorization_url: string; access_code: string; reference: string };
  };

  if (!data.status) {
    throw new Error(`Paystack initialize failed: ${data.message}`);
  }

  return data.data;
}

/** Cancel a Paystack subscription */
export async function cancelSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<void> {
  const res = await fetch("https://api.paystack.co/subscription/disable", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: subscriptionCode,
      token: emailToken,
    }),
  });

  const data = (await res.json()) as { status: boolean; message: string };

  if (!data.status) {
    throw new Error(`Paystack cancel failed: ${data.message}`);
  }
}

/** Fetch subscription details from Paystack */
export async function getSubscription(
  subscriptionCode: string
): Promise<{
  status: string;
  email_token: string;
  subscription_code: string;
  plan: { plan_code: string };
}> {
  const res = await fetch(
    `https://api.paystack.co/subscription/${subscriptionCode}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = (await res.json()) as {
    status: boolean;
    data: {
      status: string;
      email_token: string;
      subscription_code: string;
      plan: { plan_code: string };
    };
  };

  if (!data.status) {
    throw new Error("Failed to fetch Paystack subscription");
  }

  return data.data;
}
