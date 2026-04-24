import { Tier, BillingInterval } from "@prisma/client";
import crypto from "crypto";
import type { SelfServePaidTier } from "@/types";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

/**
 * Legacy per-week video cadence per paid tier. Preserved for the Paystack
 * webhook which still writes TikTokAccount.videosPerWeek at subscription
 * create time so the n8n orchestrator's scheduling maths stay consistent.
 *
 * Derived from TIER_CONFIG[tier].generateQuotaPerMonth / 4. Tiers without
 * the Generate pillar (SCHEDULER, CLIPPER) are set to 0. AGENCY is 0 as a
 * placeholder; enterprise onboarding will set this per account.
 */
export const TIER_VIDEOS_PER_WEEK: Record<Exclude<Tier, "FREE">, number> = {
  SCHEDULER: 0,
  CREATOR: 5,
  CLIPPER: 0,
  STUDIO: 10,
  STUDIO_PRO: 25,
  AGENCY: 0,
};

/** Plan amounts in kobo (NGN smallest unit) for each self-serve paid tier + billing interval */
export const PAYSTACK_PLAN_AMOUNTS: Record<
  SelfServePaidTier,
  Record<BillingInterval, number>
> = {
  SCHEDULER: {
    MONTHLY: 1800000,    // ₦18,000
    QUARTERLY: 4590000,  // ₦18,000 × 3 × 0.85
    ANNUAL: 15120000,    // ₦18,000 × 12 × 0.70
  },
  CREATOR: {
    MONTHLY: 2900000,    // ₦29,000
    QUARTERLY: 7395000,  // ₦29,000 × 3 × 0.85
    ANNUAL: 24360000,    // ₦29,000 × 12 × 0.70
  },
  CLIPPER: {
    MONTHLY: 2900000,    // ₦29,000
    QUARTERLY: 7395000,  // ₦29,000 × 3 × 0.85
    ANNUAL: 24360000,    // ₦29,000 × 12 × 0.70
  },
  STUDIO: {
    MONTHLY: 6800000,    // ₦68,000
    QUARTERLY: 17340000, // ₦68,000 × 3 × 0.85
    ANNUAL: 57120000,    // ₦68,000 × 12 × 0.70
  },
  STUDIO_PRO: {
    MONTHLY: 12000000,   // ₦120,000
    QUARTERLY: 30600000, // ₦120,000 × 3 × 0.85
    ANNUAL: 100800000,   // ₦120,000 × 12 × 0.70
  },
};

/**
 * Paystack plan codes for each self-serve paid tier + billing interval. The
 * env vars are populated by Don after he creates the 15 new plans in the
 * Paystack dashboard; until then they're empty strings and the webhook will
 * skip-map any plan code that doesn't match. AGENCY has no self-serve plan.
 */
export const PAYSTACK_PLAN_CODES: Record<
  SelfServePaidTier,
  Record<BillingInterval, string>
> = {
  SCHEDULER: {
    MONTHLY: process.env.PAYSTACK_SCHEDULER_MONTHLY_PLAN_CODE ?? "",
    QUARTERLY: process.env.PAYSTACK_SCHEDULER_QUARTERLY_PLAN_CODE ?? "",
    ANNUAL: process.env.PAYSTACK_SCHEDULER_ANNUAL_PLAN_CODE ?? "",
  },
  CREATOR: {
    MONTHLY: process.env.PAYSTACK_CREATOR_MONTHLY_PLAN_CODE ?? "",
    QUARTERLY: process.env.PAYSTACK_CREATOR_QUARTERLY_PLAN_CODE ?? "",
    ANNUAL: process.env.PAYSTACK_CREATOR_ANNUAL_PLAN_CODE ?? "",
  },
  CLIPPER: {
    MONTHLY: process.env.PAYSTACK_CLIPPER_MONTHLY_PLAN_CODE ?? "",
    QUARTERLY: process.env.PAYSTACK_CLIPPER_QUARTERLY_PLAN_CODE ?? "",
    ANNUAL: process.env.PAYSTACK_CLIPPER_ANNUAL_PLAN_CODE ?? "",
  },
  STUDIO: {
    MONTHLY: process.env.PAYSTACK_STUDIO_MONTHLY_PLAN_CODE ?? "",
    QUARTERLY: process.env.PAYSTACK_STUDIO_QUARTERLY_PLAN_CODE ?? "",
    ANNUAL: process.env.PAYSTACK_STUDIO_ANNUAL_PLAN_CODE ?? "",
  },
  STUDIO_PRO: {
    MONTHLY: process.env.PAYSTACK_STUDIO_PRO_MONTHLY_PLAN_CODE ?? "",
    QUARTERLY: process.env.PAYSTACK_STUDIO_PRO_QUARTERLY_PLAN_CODE ?? "",
    ANNUAL: process.env.PAYSTACK_STUDIO_PRO_ANNUAL_PLAN_CODE ?? "",
  },
};

/** Reverse lookup: plan code → { tier, interval } */
export function mapPlanCodeToTier(
  planCode: string
): { tier: SelfServePaidTier; interval: BillingInterval } | null {
  if (!planCode) return null;
  for (const [tier, intervals] of Object.entries(PAYSTACK_PLAN_CODES)) {
    for (const [interval, code] of Object.entries(intervals)) {
      if (code && code === planCode) {
        return {
          tier: tier as SelfServePaidTier,
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
  amount: number;
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
      amount: params.amount,
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
