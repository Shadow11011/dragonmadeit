import { NextResponse } from "next/server";
import { dodo, mapProductIdToTier, TIER_VIDEOS_PER_WEEK } from "@/lib/dodo";
import { prisma } from "@/lib/prisma";
import { disconnectAccount } from "@/lib/late-api";
import { sendPaymentFailedEmail, sendPaymentConfirmedEmail } from "@/lib/email";
import { getNextPostTime, normalizeSchedule } from "@/lib/schedule-utils";
import type { BillingInterval } from "@prisma/client";
import type { SelfServePaidTier } from "@/types";

type DodoSubscriptionPayload = {
  subscription_id: string;
  product_id: string;
  customer: {
    customer_id: string;
    email: string;
    name: string;
  };
  metadata?: Record<string, string>;
};

function isSelfServeTier(value: unknown): value is SelfServePaidTier {
  return (
    value === "SCHEDULER" ||
    value === "CREATOR" ||
    value === "CLIPPER" ||
    value === "STUDIO" ||
    value === "STUDIO_PRO"
  );
}

function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "MONTHLY" || value === "QUARTERLY" || value === "ANNUAL";
}

/**
 * Resolve (tier, interval) from the subscription payload. Prefers metadata
 * (set at checkout time), falls back to product_id lookup. If neither yields
 * a match we return null and the caller logs + no-ops.
 */
function resolveTierAndInterval(
  sub: DodoSubscriptionPayload
): { tier: SelfServePaidTier; interval: BillingInterval } | null {
  const meta = sub.metadata ?? {};
  if (isSelfServeTier(meta.tier) && isBillingInterval(meta.billing_interval)) {
    return { tier: meta.tier, interval: meta.billing_interval };
  }
  return mapProductIdToTier(sub.product_id);
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  // --- Signature verification ---
  //
  // Production path: `unwrap` using the configured webhook secret. This
  // validates the Standard-Webhooks signature and returns a typed event.
  //
  // Test-mode fallback: if DODO_ENV=test AND the secret is empty, we
  // accept the payload via `unsafe_unwrap` but log a warning. In any other
  // environment, missing/invalid signature means 401.
  let event: import("dodopayments/resources/webhooks/webhooks").UnwrapWebhookEvent;

  try {
    const secret = process.env.DODO_WEBHOOK_SECRET ?? "";
    const isTestEnv = process.env.DODO_ENV !== "live";

    if (secret) {
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key.toLowerCase()] = value;
      });
      event = dodo.webhooks.unwrap(rawBody, { headers, key: secret });
    } else if (isTestEnv) {
      console.warn(
        "dodo webhook: DODO_WEBHOOK_SECRET empty — using unsafe_unwrap (test mode)"
      );
      event = dodo.webhooks.unsafeUnwrap(rawBody);
    } else {
      console.error(
        "dodo webhook: no secret configured in non-test env; refusing unsafe_unwrap"
      );
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error("dodo webhook: signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    switch (event.type) {
      // -----------------------------------------------------------------
      // subscription.active
      // Fires on first activation AND after a trial ends. This is the hook
      // we use to upgrade a TikTokAccount from FREE to the paid tier.
      //
      // Idempotency: `dodoSubscriptionId` has a UNIQUE index. We check for
      // an existing account with that ID first — if present, this delivery
      // is a retry and we return success without reprocessing. The referral
      // credit then can't fire twice because it's gated by the already-
      // idempotent `referralCreditAppliedAt` flag on the REFERRED user.
      // -----------------------------------------------------------------
      case "subscription.active": {
        const sub = event.data as unknown as DodoSubscriptionPayload;

        // Idempotency guard: if we've already processed this subscription,
        // bail early. Dodo retries webhooks and we can receive duplicates.
        const alreadyProcessed = await prisma.tikTokAccount.findFirst({
          where: { dodoSubscriptionId: sub.subscription_id },
          select: { id: true },
        });
        if (alreadyProcessed) {
          return NextResponse.json({ received: true, handled: false, reason: "duplicate" });
        }

        const mapped = resolveTierAndInterval(sub);
        if (!mapped) {
          console.error(
            "dodo webhook: could not resolve tier/interval",
            sub.subscription_id,
            sub.product_id,
            sub.metadata
          );
          return NextResponse.json({ received: true, handled: false });
        }
        const { tier, interval } = mapped;
        const videosPerWeek = TIER_VIDEOS_PER_WEEK[tier];

        const metaUserId = sub.metadata?.user_id;
        const user = metaUserId
          ? await prisma.user.findUnique({
              where: { id: metaUserId },
              select: {
                id: true,
                name: true,
                email: true,
                dodoCustomerId: true,
                referredByUserId: true,
                referralCreditAppliedAt: true,
              },
            })
          : await prisma.user.findUnique({
              where: { email: sub.customer.email },
              select: {
                id: true,
                name: true,
                email: true,
                dodoCustomerId: true,
                referredByUserId: true,
                referralCreditAppliedAt: true,
              },
            });

        if (!user) {
          console.error(
            "dodo webhook: no user found for subscription",
            sub.subscription_id,
            metaUserId,
            sub.customer.email
          );
          return NextResponse.json({ received: true, handled: false });
        }

        // Referral credit: first-paid-upgrade trigger. Ported verbatim from
        // the old Paystack webhook. Idempotency guard: updateMany with a
        // null-check in WHERE so a concurrent delivery loses the race on the
        // DB, not on our code.
        if (user.referredByUserId && !user.referralCreditAppliedAt) {
          try {
            await prisma.$transaction(async (tx) => {
              const now = new Date();
              const claimed = await tx.user.updateMany({
                where: { id: user.id, referralCreditAppliedAt: null },
                data: { referralCreditAppliedAt: now },
              });
              if (claimed.count === 1) {
                await tx.user.update({
                  where: { id: user.referredByUserId! },
                  data: { referralCredits: { increment: 1000 } },
                });
              }
            });
          } catch (err) {
            console.error("dodo webhook: referral credit failed", err);
          }
        }

        // Persist the Dodo customer ID on first successful subscription.
        if (!user.dodoCustomerId && sub.customer.customer_id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { dodoCustomerId: sub.customer.customer_id },
          });
        }

        // Schedule passed through checkout metadata as a JSON-encoded string.
        let schedule: ReturnType<typeof normalizeSchedule> = null;
        if (sub.metadata?.schedule) {
          try {
            schedule = normalizeSchedule(JSON.parse(sub.metadata.schedule));
          } catch {
            schedule = null;
          }
        }
        const nextPostAt = schedule ? getNextPostTime(schedule) : null;

        // Create the TikTokAccount row for this subscription. Username is a
        // placeholder ("pending-*") until the user links their TikTok via
        // the Late.dev flow — same pattern as the old Paystack webhook.
        await prisma.tikTokAccount.create({
          data: {
            username: `pending-${Date.now()}`,
            tier,
            billingInterval: interval,
            dodoSubscriptionId: sub.subscription_id,
            videosPerWeek,
            userId: user.id,
            ...(schedule
              ? {
                  schedule: {
                    days: schedule.days,
                    times: schedule.times,
                    timezone: schedule.timezone,
                  },
                  nextPostAt,
                }
              : {}),
          },
        });

        await sendPaymentConfirmedEmail({
          to: user.email,
          tier,
          name: user.name,
        });

        return NextResponse.json({ received: true, handled: true });
      }

      // -----------------------------------------------------------------
      // subscription.renewed
      // Periodic rebill succeeded. Nothing to do for the MVP — Dodo handles
      // the renewal internally and we have no `lastRenewedAt` column to
      // update. Log and no-op.
      // -----------------------------------------------------------------
      case "subscription.renewed": {
        const sub = event.data as unknown as DodoSubscriptionPayload;
        console.info("dodo webhook: subscription.renewed", sub.subscription_id);
        return NextResponse.json({ received: true, handled: false });
      }

      // -----------------------------------------------------------------
      // subscription.on_hold
      // Charge failed, subscription paused. Email the user so they know to
      // update their card; account stays on the paid tier (Dodo will retry).
      // -----------------------------------------------------------------
      case "subscription.on_hold": {
        const sub = event.data as unknown as DodoSubscriptionPayload;
        const account = await prisma.tikTokAccount.findUnique({
          where: { dodoSubscriptionId: sub.subscription_id },
          select: { user: { select: { email: true, name: true } } },
        });
        if (account?.user?.email) {
          await sendPaymentFailedEmail({
            to: account.user.email,
            name: account.user.name,
          });
        }
        return NextResponse.json({ received: true, handled: true });
      }

      // -----------------------------------------------------------------
      // subscription.cancelled / subscription.expired / subscription.failed
      // User cancelled, subscription expired, or mandate setup failed. Find
      // the TikTokAccount by `dodoSubscriptionId`, disconnect it from
      // Late.dev, and downgrade to FREE. Mirrors the old Paystack
      // subscription.disable path.
      // -----------------------------------------------------------------
      case "subscription.cancelled":
      case "subscription.expired":
      case "subscription.failed": {
        const sub = event.data as unknown as DodoSubscriptionPayload;
        const account = await prisma.tikTokAccount.findUnique({
          where: { dodoSubscriptionId: sub.subscription_id },
          select: { id: true, lateAccountId: true },
        });

        if (!account) {
          // Idempotency: already-downgraded accounts have no match. Return
          // 200 so Dodo stops retrying.
          return NextResponse.json({ received: true, handled: false });
        }

        if (account.lateAccountId) {
          try {
            await disconnectAccount(account.lateAccountId);
          } catch (err) {
            console.error("dodo webhook: Late.dev disconnect failed", err);
          }
        }

        await prisma.tikTokAccount.update({
          where: { id: account.id },
          data: {
            tier: "FREE",
            dodoSubscriptionId: null,
            videosPerWeek: 0,
            lateAccountId: null,
            lateProfileId: null,
            username: `unlinked-${Date.now()}`,
          },
        });

        return NextResponse.json({ received: true, handled: true });
      }

      // -----------------------------------------------------------------
      // payment.failed — log only. The subscription-level on_hold event
      // will drive the email.
      // -----------------------------------------------------------------
      case "payment.failed": {
        console.info("dodo webhook: payment.failed", event.data);
        return NextResponse.json({ received: true, handled: false });
      }

      // payment.succeeded logs only. Individual charges are covered by the
      // subscription-level events for our use case.
      case "payment.succeeded": {
        return NextResponse.json({ received: true, handled: false });
      }

      default:
        return NextResponse.json({ received: true, handled: false });
    }
  } catch (error) {
    console.error("dodo webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
