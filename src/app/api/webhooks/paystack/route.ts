import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  mapPlanCodeToTier,
  TIER_VIDEOS_PER_WEEK,
} from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { disconnectAccount } from "@/lib/late-api";
import {
  sendPaymentConfirmedEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { getNextPostTime, normalizeSchedule } from "@/lib/schedule-utils";
import type { PostingSchedule } from "@/types";

function extractSchedule(data: Record<string, unknown>): PostingSchedule | null {
  const meta = (data.metadata ?? {}) as Record<string, unknown>;
  return normalizeSchedule(meta.schedule);
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature") ?? "";

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.error("paystack webhook: invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody) as {
      event: string;
      data: Record<string, unknown>;
    };

    const { event, data } = payload;

    switch (event) {
      case "subscription.create": {
        const subscriptionCode = data.subscription_code as string;
        const emailToken = data.email_token as string;
        const customerData = data.customer as { email: string } | undefined;
        const planData = data.plan as { plan_code: string } | undefined;
        const email = customerData?.email;
        const planCode = planData?.plan_code;

        if (!email || !planCode || !subscriptionCode) {
          console.error("paystack webhook: missing fields in subscription.create");
          break;
        }

        const mapped = mapPlanCodeToTier(planCode);
        if (!mapped) {
          console.error("paystack webhook: unknown plan_code", planCode);
          break;
        }

        const { tier, interval } = mapped;
        const videosPerWeek = TIER_VIDEOS_PER_WEEK[tier];

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            name: true,
            referredByUserId: true,
            referralCreditAppliedAt: true,
          },
        });

        if (!user) {
          console.error("paystack webhook: no user found for email", email);
          break;
        }

        // Check if account already exists for this subscription
        const existing = await prisma.tikTokAccount.findFirst({
          where: { paystackSubscriptionCode: subscriptionCode },
          select: { id: true },
        });
        if (existing) {
          break;
        }

        // Referral credit: first-paid-upgrade trigger.
        //
        // Fire exactly once per referred user. Idempotency guard:
        //   1. `user.referralCreditAppliedAt` must be null (never credited).
        //   2. Atomic `updateMany` with a null-check in the WHERE clause so a
        //      concurrent webhook delivery races on the DB, not on our code.
        //      The update affects 0 rows on the second delivery → we skip
        //      the increment. That's the watertight check.
        //   3. The increment and the flag-set are in the same transaction.
        //
        // We don't need to look at TikTokAccount history for "first paid"
        // because the flag handles it: if any prior subscription.create
        // already credited the referrer, the flag is non-null and the
        // updateMany returns 0.
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
            // Never let a referral-credit failure crash the subscription
            // flow. Log and move on.
            console.error("paystack webhook: referral credit failed", err);
          }
        }

        // Store customer code on user if not already set
        const customerCode = (data.customer as { customer_code?: string })?.customer_code;
        if (customerCode) {
          await prisma.user.update({
            where: { id: user.id },
            data: { paystackCustomerCode: customerCode },
          });
        }

        const schedule = extractSchedule(data);
        const nextPostAt = schedule ? getNextPostTime(schedule) : null;

        // Create pending TikTok account
        await prisma.tikTokAccount.create({
          data: {
            username: `pending-${Date.now()}`,
            tier,
            billingInterval: interval,
            paystackSubscriptionCode: subscriptionCode,
            paystackEmailToken: emailToken,
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
          to: email,
          tier,
          name: user.name,
        });

        break;
      }

      case "subscription.disable": {
        const subscriptionCode = data.subscription_code as string;

        if (!subscriptionCode) {
          console.error("paystack webhook: missing subscription_code for disable");
          break;
        }

        // Find the account to disconnect from Late.dev
        const accountToCancel = await prisma.tikTokAccount.findFirst({
          where: { paystackSubscriptionCode: subscriptionCode },
          select: { id: true, lateAccountId: true },
        });

        if (accountToCancel?.lateAccountId) {
          try {
            await disconnectAccount(accountToCancel.lateAccountId);
          } catch (err) {
            console.error("Failed to disconnect Late.dev:", err);
          }
        }

        await prisma.tikTokAccount.updateMany({
          where: { paystackSubscriptionCode: subscriptionCode },
          data: {
            tier: "FREE",
            paystackSubscriptionCode: null,
            paystackEmailToken: null,
            videosPerWeek: 0,
            lateAccountId: null,
            lateProfileId: null,
            username: `unlinked-${Date.now()}`,
          },
        });

        break;
      }

      case "charge.success": {
        // Recurring charge success — subscription already exists, nothing to create.
        // Paystack handles renewal automatically.
        break;
      }

      case "invoice.payment_failed": {
        const subscriptionCode = (data.subscription as { subscription_code?: string })?.subscription_code;

        if (subscriptionCode) {
          const failedAccount = await prisma.tikTokAccount.findFirst({
            where: { paystackSubscriptionCode: subscriptionCode },
            select: { user: { select: { email: true, name: true } } },
          });
          if (failedAccount?.user?.email) {
            await sendPaymentFailedEmail({
              to: failedAccount.user.email,
              name: failedAccount.user.name,
            });
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
