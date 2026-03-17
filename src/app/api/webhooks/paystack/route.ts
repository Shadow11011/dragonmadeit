import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  TIER_VIDEOS_PER_WEEK,
  fetchSubscription,
} from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { disconnectAccount } from "@/lib/late-api";
import {
  sendPaymentConfirmedEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";
import { getNextPostTime } from "@/lib/schedule-utils";
import { Tier, BillingInterval, VideoType, VoiceType } from "@prisma/client";
import type { PostingSchedule } from "@/types";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("x-paystack-signature");

  if (!sig) {
    return NextResponse.json(
      { success: false, error: "Missing signature" },
      { status: 400 }
    );
  }

  if (!verifyWebhookSignature(body, sig)) {
    console.error("Webhook signature verification failed");
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  const payload = JSON.parse(body) as {
    event: string;
    data: Record<string, unknown>;
  };

  try {
    switch (payload.event) {
      case "charge.success": {
        const data = payload.data;
        const planObject = data.plan_object as
          | { plan_code: string; name: string; subscriptions?: Array<{ subscription_code: string }> }
          | undefined;
        const metadata = data.metadata as
          | { userId?: string; tier?: string; billingInterval?: string; schedule?: string; contentConfig?: string }
          | undefined;

        // Only handle initial subscription payments (has plan_object + userId metadata)
        if (!planObject || !metadata?.userId) {
          break;
        }

        const userId = metadata.userId;
        const tierStr = metadata.tier;

        if (!tierStr) {
          console.error("charge.success: missing tier in metadata", { userId });
          break;
        }

        const tier = tierStr as Exclude<Tier, "FREE">;
        const videosPerWeek = TIER_VIDEOS_PER_WEEK[tier] ?? 0;
        const billingInterval = (metadata.billingInterval as BillingInterval) ?? "MONTHLY";

        // Parse schedule from metadata
        let schedule: unknown = null;
        if (metadata.schedule) {
          try {
            schedule = JSON.parse(metadata.schedule);
          } catch {
            console.error("Failed to parse schedule metadata:", metadata.schedule);
          }
        }

        // Parse content config from metadata with safe defaults
        let contentVideoType: VideoType = "GAMEPLAY";
        let contentVoiceType: VoiceType = "RANDOM";
        let contentStoryTypes: string[] = [];
        let contentRandomizeStories = true;

        if (metadata.contentConfig) {
          try {
            const parsed: unknown = JSON.parse(metadata.contentConfig);
            if (parsed && typeof parsed === "object") {
              const cfg = parsed as Record<string, unknown>;
              if (cfg.videoType === "GAMEPLAY" || cfg.videoType === "AI_IMAGES") {
                contentVideoType = cfg.videoType;
              }
              if (
                cfg.voiceType === "MALE" ||
                cfg.voiceType === "FEMALE" ||
                cfg.voiceType === "RANDOM"
              ) {
                contentVoiceType = cfg.voiceType;
              }
              if (Array.isArray(cfg.storyTypes)) {
                contentStoryTypes = cfg.storyTypes.filter(
                  (s): s is string => typeof s === "string"
                );
              }
              if (typeof cfg.randomizeStories === "boolean") {
                contentRandomizeStories = cfg.randomizeStories;
              }
            }
          } catch {
            console.error(
              "Failed to parse contentConfig metadata:",
              metadata.contentConfig
            );
          }
        }

        // Get subscription code from plan_object or authorization
        const authorization = data.authorization as
          | { subscription_code?: string }
          | undefined;
        const subscriptionCode =
          planObject.subscriptions?.[0]?.subscription_code ??
          authorization?.subscription_code ??
          null;

        // Store Paystack customer code on user if not already set
        const customer = data.customer as
          | { customer_code: string; email?: string }
          | undefined;
        if (customer?.customer_code) {
          await prisma.user.update({
            where: { id: userId },
            data: { paystackCustomerCode: customer.customer_code },
          });
        }

        // Create a new TikTokAccount with the subscription details
        const account = await prisma.tikTokAccount.create({
          data: {
            username: `pending-${Date.now()}`,
            tier,
            billingInterval,
            paystackSubscriptionCode: subscriptionCode,
            videosPerWeek,
            schedule: schedule ?? undefined,
            scheduleLocked: true,
            videoType: contentVideoType,
            voiceType: contentVoiceType,
            storyTypes: contentStoryTypes,
            randomizeStories: contentRandomizeStories,
            userId,
          },
        });

        // Calculate and store nextPostAt from the schedule
        if (schedule) {
          try {
            const nextPost = getNextPostTime(schedule as PostingSchedule);
            if (nextPost) {
              await prisma.tikTokAccount.update({
                where: { id: account.id },
                data: { nextPostAt: nextPost },
              });
            }
          } catch (err) {
            console.error("Failed to calculate nextPostAt:", err);
          }
        }

        console.log(
          `Created TikTokAccount ${account.id} for user ${userId} with tier ${tier}`
        );

        // Send payment confirmed email
        const checkoutUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, name: true },
        });
        if (checkoutUser?.email) {
          sendPaymentConfirmedEmail({
            to: checkoutUser.email,
            tier: tier,
            name: checkoutUser.name,
          });
        }

        // Try to fetch subscription details to get email_token
        if (subscriptionCode) {
          try {
            const sub = await fetchSubscription(subscriptionCode);
            if (sub.email_token) {
              await prisma.tikTokAccount.update({
                where: { id: account.id },
                data: { paystackEmailToken: sub.email_token },
              });
            }
          } catch (err) {
            console.error(
              "Failed to fetch subscription for email_token:",
              err
            );
            // email_token will be captured by subscription.create event
          }
        }

        break;
      }

      case "subscription.create": {
        const data = payload.data;
        const subscriptionCode = data.subscription_code as string;
        const emailToken = data.email_token as string;

        if (!subscriptionCode || !emailToken) {
          console.error("subscription.create: missing subscription_code or email_token");
          break;
        }

        // Find account by subscription code and store email_token
        const updated = await prisma.tikTokAccount.updateMany({
          where: { paystackSubscriptionCode: subscriptionCode },
          data: { paystackEmailToken: emailToken },
        });

        if (updated.count === 0) {
          // Race condition: charge.success hasn't created the account yet
          // Try to find by customer email and most recent account
          const customer = data.customer as
            | { customer_code: string; email?: string }
            | undefined;

          if (customer?.customer_code) {
            const user = await prisma.user.findFirst({
              where: { paystackCustomerCode: customer.customer_code },
              select: { id: true },
            });

            if (user) {
              const recentAccount = await prisma.tikTokAccount.findFirst({
                where: {
                  userId: user.id,
                  paystackSubscriptionCode: null,
                },
                orderBy: { createdAt: "desc" },
              });

              if (recentAccount) {
                await prisma.tikTokAccount.update({
                  where: { id: recentAccount.id },
                  data: {
                    paystackSubscriptionCode: subscriptionCode,
                    paystackEmailToken: emailToken,
                  },
                });
                console.log(
                  `subscription.create: linked subscription ${subscriptionCode} to account ${recentAccount.id} via customer fallback`
                );
              } else {
                console.warn(
                  `subscription.create: no matching account found for subscription ${subscriptionCode}`
                );
              }
            }
          }
        } else {
          console.log(
            `subscription.create: stored email_token for subscription ${subscriptionCode}`
          );
        }

        break;
      }

      case "subscription.disable": {
        const data = payload.data;
        const subscriptionCode = data.subscription_code as string;

        if (!subscriptionCode) {
          console.error("subscription.disable: missing subscription_code");
          break;
        }

        // Find the account to disconnect from Late.dev before updating
        const accountToCancel = await prisma.tikTokAccount.findFirst({
          where: { paystackSubscriptionCode: subscriptionCode },
          select: { id: true, lateAccountId: true },
        });

        // Disconnect from Late.dev if linked
        if (accountToCancel?.lateAccountId) {
          try {
            await disconnectAccount(accountToCancel.lateAccountId);
            console.log(
              `Disconnected Late.dev account ${accountToCancel.lateAccountId}`
            );
          } catch (lateErr) {
            console.error(
              "Failed to disconnect Late.dev account:",
              lateErr
            );
            // Continue with DB cleanup even if Late.dev disconnect fails
          }
        }

        // Fully unlink: clear subscription, Late IDs, and reset username
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

        console.log(
          `Cancelled subscription ${subscriptionCode}, fully unlinked TikTok account`
        );
        break;
      }

      case "invoice.payment_failed": {
        const data = payload.data;
        const subscription = data.subscription as
          | { subscription_code?: string }
          | undefined;
        const subscriptionCode = subscription?.subscription_code;

        console.error(
          `Payment failed for subscription ${subscriptionCode ?? "unknown"}, customer: ${
            (data.customer as { customer_code?: string } | undefined)?.customer_code ?? "unknown"
          }`
        );

        if (subscriptionCode) {
          const failedAccount = await prisma.tikTokAccount.findFirst({
            where: { paystackSubscriptionCode: subscriptionCode },
            select: { user: { select: { email: true, name: true } } },
          });
          if (failedAccount?.user?.email) {
            sendPaymentFailedEmail({
              to: failedAccount.user.email,
              name: failedAccount.user.name,
            });
          }
        }
        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
