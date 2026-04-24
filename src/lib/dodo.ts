import DodoPayments from "dodopayments";
import type { BillingInterval } from "@prisma/client";
import type { SelfServePaidTier } from "@/types";

/**
 * Dodo Payments SDK client (singleton). Instantiation is cheap so we lazy-init
 * once per Node process. Mirrors the singleton pattern in `src/lib/prisma.ts`.
 *
 * `DODO_ENV=test` -> test_mode -> https://test.dodopayments.com
 * `DODO_ENV=live` -> live_mode -> https://live.dodopayments.com
 */
const globalForDodo = globalThis as unknown as {
  dodo: DodoPayments | undefined;
};

export const dodo =
  globalForDodo.dodo ??
  new DodoPayments({
    bearerToken: process.env.DODO_API_KEY,
    webhookKey: process.env.DODO_WEBHOOK_SECRET || undefined,
    environment: process.env.DODO_ENV === "live" ? "live_mode" : "test_mode",
  });

globalForDodo.dodo = dodo;

/**
 * Product-ID lookup table. Populated from env vars; AGENCY has no self-serve
 * product and is omitted. Missing env vars are empty strings — the checkout
 * helper 503-guards on empty before calling Dodo.
 */
export const DODO_PRODUCT_IDS: Record<
  SelfServePaidTier,
  Record<BillingInterval, string>
> = {
  SCHEDULER: {
    MONTHLY: process.env.DODO_SCHEDULER_MONTHLY_PRODUCT_ID ?? "",
    QUARTERLY: process.env.DODO_SCHEDULER_QUARTERLY_PRODUCT_ID ?? "",
    ANNUAL: process.env.DODO_SCHEDULER_ANNUAL_PRODUCT_ID ?? "",
  },
  CREATOR: {
    MONTHLY: process.env.DODO_CREATOR_MONTHLY_PRODUCT_ID ?? "",
    QUARTERLY: process.env.DODO_CREATOR_QUARTERLY_PRODUCT_ID ?? "",
    ANNUAL: process.env.DODO_CREATOR_ANNUAL_PRODUCT_ID ?? "",
  },
  CLIPPER: {
    MONTHLY: process.env.DODO_CLIPPER_MONTHLY_PRODUCT_ID ?? "",
    QUARTERLY: process.env.DODO_CLIPPER_QUARTERLY_PRODUCT_ID ?? "",
    ANNUAL: process.env.DODO_CLIPPER_ANNUAL_PRODUCT_ID ?? "",
  },
  STUDIO: {
    MONTHLY: process.env.DODO_STUDIO_MONTHLY_PRODUCT_ID ?? "",
    QUARTERLY: process.env.DODO_STUDIO_QUARTERLY_PRODUCT_ID ?? "",
    ANNUAL: process.env.DODO_STUDIO_ANNUAL_PRODUCT_ID ?? "",
  },
  STUDIO_PRO: {
    MONTHLY: process.env.DODO_STUDIO_PRO_MONTHLY_PRODUCT_ID ?? "",
    QUARTERLY: process.env.DODO_STUDIO_PRO_QUARTERLY_PRODUCT_ID ?? "",
    ANNUAL: process.env.DODO_STUDIO_PRO_ANNUAL_PRODUCT_ID ?? "",
  },
};

/**
 * Legacy per-week video cadence per paid tier. Preserved so the webhook can
 * still set TikTokAccount.videosPerWeek at subscription.active time and the
 * n8n orchestrator's scheduling maths stay consistent.
 */
export const TIER_VIDEOS_PER_WEEK: Record<SelfServePaidTier, number> = {
  SCHEDULER: 0,
  CREATOR: 5,
  CLIPPER: 0,
  STUDIO: 10,
  STUDIO_PRO: 25,
};

/**
 * Reverse lookup: product_id -> { tier, interval }. Used by the webhook when
 * the metadata.tier / metadata.billing_interval fields are missing or we need
 * to verify them against the product.
 */
export function mapProductIdToTier(
  productId: string
): { tier: SelfServePaidTier; interval: BillingInterval } | null {
  if (!productId) return null;
  for (const [tier, intervals] of Object.entries(DODO_PRODUCT_IDS)) {
    for (const [interval, id] of Object.entries(intervals)) {
      if (id && id === productId) {
        return {
          tier: tier as SelfServePaidTier,
          interval: interval as BillingInterval,
        };
      }
    }
  }
  return null;
}

export type CreateCheckoutError =
  | { kind: "PRODUCT_NOT_CONFIGURED" }
  | { kind: "DODO_FAILED"; message: string };

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string; sessionId: string }
  | { ok: false; error: CreateCheckoutError };

/**
 * Create a Dodo checkout session for a subscription. Returns a tagged result
 * rather than throwing — the caller maps the error to an HTTP response.
 *
 * Metadata is the ONLY bridge the webhook has back to our domain: `user_id`,
 * `tier`, and `billing_interval` are required on the `subscription.active`
 * event. Keep these keys stable.
 */
export async function createCheckoutSession(params: {
  userId: string;
  email: string;
  name: string | null;
  tier: SelfServePaidTier;
  interval: BillingInterval;
  returnUrl: string;
  metadata?: Record<string, string>;
}): Promise<CreateCheckoutResult> {
  const productId = DODO_PRODUCT_IDS[params.tier][params.interval];
  if (!productId) {
    return { ok: false, error: { kind: "PRODUCT_NOT_CONFIGURED" } };
  }

  try {
    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: params.email,
        name: params.name ?? params.email,
      },
      return_url: params.returnUrl,
      metadata: {
        user_id: params.userId,
        tier: params.tier,
        billing_interval: params.interval,
        ...(params.metadata ?? {}),
      },
    });

    if (!session.checkout_url) {
      return {
        ok: false,
        error: {
          kind: "DODO_FAILED",
          message: "Dodo returned no checkout_url",
        },
      };
    }

    return {
      ok: true,
      checkoutUrl: session.checkout_url,
      sessionId: session.session_id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: { kind: "DODO_FAILED", message } };
  }
}

/**
 * Cancel a Dodo subscription. Uses the subscription.update endpoint with
 * `cancel_at_next_billing_date: true`. Dodo then emits `subscription.cancelled`
 * which the webhook handler uses to downgrade the account.
 *
 * If you want an immediate cancel (no remaining billing period), Dodo's API
 * accepts `status: "cancelled"` as an update. We use cancel-at-period-end here
 * to mirror typical SaaS UX.
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await dodo.subscriptions.update(subscriptionId, {
    cancel_at_next_billing_date: true,
  });
}
