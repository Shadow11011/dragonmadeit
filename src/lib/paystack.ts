import crypto from "crypto";
import { Tier, BillingInterval } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ContentConfig } from "@/types";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const TIER_VIDEOS_PER_WEEK: Record<Exclude<Tier, "FREE">, number> = {
  HATCHLING: 3,
  DRAKE: 7,
  ELDER_DRAGON: 14,
};

/** Monthly base prices in NGN */
const TIER_MONTHLY_NGN: Record<Exclude<Tier, "FREE">, number> = {
  HATCHLING: 23000,
  DRAKE: 60000,
  ELDER_DRAGON: 200000,
};

/** Get plan amount in kobo (smallest currency unit) for Paystack */
function getPlanAmountInKobo(tier: Exclude<Tier, "FREE">, interval: BillingInterval): number {
  const monthly = TIER_MONTHLY_NGN[tier];
  let amount: number;
  switch (interval) {
    case "MONTHLY":
      amount = monthly;
      break;
    case "QUARTERLY":
      amount = Math.round(monthly * 3 * 0.85); // 15% discount
      break;
    case "ANNUAL":
      amount = Math.round(monthly * 12 * 0.70); // 30% discount
      break;
  }
  return amount * 100; // Convert to kobo
}

export const PLAN_CODES: Record<Exclude<Tier, "FREE">, Record<BillingInterval, string>> = {
  HATCHLING: {
    MONTHLY: process.env.PAYSTACK_HATCHLING_MONTHLY_PLAN_CODE || "PLN_hatchling_monthly",
    QUARTERLY: process.env.PAYSTACK_HATCHLING_QUARTERLY_PLAN_CODE || "PLN_hatchling_quarterly",
    ANNUAL: process.env.PAYSTACK_HATCHLING_ANNUAL_PLAN_CODE || "PLN_hatchling_annual",
  },
  DRAKE: {
    MONTHLY: process.env.PAYSTACK_DRAKE_MONTHLY_PLAN_CODE || "PLN_drake_monthly",
    QUARTERLY: process.env.PAYSTACK_DRAKE_QUARTERLY_PLAN_CODE || "PLN_drake_quarterly",
    ANNUAL: process.env.PAYSTACK_DRAKE_ANNUAL_PLAN_CODE || "PLN_drake_annual",
  },
  ELDER_DRAGON: {
    MONTHLY: process.env.PAYSTACK_ELDER_DRAGON_MONTHLY_PLAN_CODE || "PLN_elder_dragon_monthly",
    QUARTERLY: process.env.PAYSTACK_ELDER_DRAGON_QUARTERLY_PLAN_CODE || "PLN_elder_dragon_quarterly",
    ANNUAL: process.env.PAYSTACK_ELDER_DRAGON_ANNUAL_PLAN_CODE || "PLN_elder_dragon_annual",
  },
};

export function mapPaystackPlanToTier(planCode: string): { tier: Tier; billingInterval: BillingInterval } {
  for (const [tier, intervals] of Object.entries(PLAN_CODES)) {
    for (const [interval, code] of Object.entries(intervals)) {
      if (code === planCode) {
        return { tier: tier as Tier, billingInterval: interval as BillingInterval };
      }
    }
  }
  return { tier: "FREE", billingInterval: "MONTHLY" };
}

async function paystackRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = (await res.json()) as {
    status: boolean;
    message: string;
    data: T;
  };

  if (!res.ok || !data.status) {
    throw new Error(`Paystack API error: ${data.message}`);
  }

  return data.data;
}

export async function getOrCreateCustomer(
  userId: string,
  email: string
): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { paystackCustomerCode: true },
  });

  if (user?.paystackCustomerCode) {
    return user.paystackCustomerCode;
  }

  const customer = await paystackRequest<{ customer_code: string }>(
    "POST",
    "/customer",
    {
      email,
      metadata: { userId },
    }
  );

  await prisma.user.update({
    where: { id: userId },
    data: { paystackCustomerCode: customer.customer_code },
  });

  return customer.customer_code;
}

export interface InitializeTransactionParams {
  customerEmail: string;
  tier: Exclude<Tier, "FREE">;
  billingInterval: BillingInterval;
  userId: string;
  schedule: Record<string, unknown>;
  contentConfig?: ContentConfig;
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<{ authorizationUrl: string; accessCode: string; reference: string }> {
  const { customerEmail, tier, billingInterval, userId, schedule, contentConfig } = params;
  const planCode = PLAN_CODES[tier][billingInterval];

  const metadata: Record<string, string> = {
    userId,
    tier,
    billingInterval,
    schedule: JSON.stringify(schedule),
    cancel_action: "https://dragonmadeit.vercel.app",
  };

  if (contentConfig) {
    metadata.contentConfig = JSON.stringify(contentConfig);
  }

  const baseUrl = process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://dragonmadeit.vercel.app");

  const result = await paystackRequest<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>("POST", "/transaction/initialize", {
    email: customerEmail,
    amount: getPlanAmountInKobo(tier, billingInterval),
    plan: planCode,
    callback_url: `${baseUrl}/dashboard/accounts?checkout=success`,
    metadata: {
      custom_fields: [],
      ...metadata,
    },
  });

  return {
    authorizationUrl: result.authorization_url,
    accessCode: result.access_code,
    reference: result.reference,
  };
}

export async function disableSubscription(
  subscriptionCode: string,
  emailToken: string
): Promise<void> {
  await paystackRequest("POST", "/subscription/disable", {
    code: subscriptionCode,
    token: emailToken,
  });
}

export async function fetchSubscription(
  subscriptionCode: string
): Promise<{ email_token: string; subscription_code: string }> {
  return paystackRequest<{ email_token: string; subscription_code: string }>(
    "GET",
    `/subscription/${subscriptionCode}`
  );
}

export interface PaystackTransactionData {
  status: string;
  reference: string;
  metadata: Record<string, unknown>;
  plan_object?: { plan_code: string; subscriptions?: Array<{ subscription_code: string }> };
  authorization?: { subscription_code?: string };
  customer?: { customer_code: string; email?: string };
}

export async function verifyTransaction(reference: string): Promise<PaystackTransactionData> {
  return paystackRequest<PaystackTransactionData>(
    "GET",
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");
  return hash === signature;
}
