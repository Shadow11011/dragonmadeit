import { NextResponse } from "next/server";
import { stripe, mapStripePriceToTier, TIER_VIDEOS_PER_WEEK } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { disconnectAccount } from "@/lib/late-api";
import { sendPaymentConfirmedEmail, sendPaymentFailedEmail } from "@/lib/email";
import { getNextPostTime } from "@/lib/schedule-utils";
import { Tier, VideoType, VoiceType } from "@prisma/client";
import Stripe from "stripe";
import type { ContentConfig, PostingSchedule } from "@/types";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { success: false, error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return NextResponse.json(
      { success: false, error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tierStr = session.metadata?.tier;
        const scheduleStr = session.metadata?.schedule;
        const contentConfigStr = session.metadata?.contentConfig;

        if (!session.subscription || !userId || !tierStr) {
          console.error(
            "checkout.session.completed: missing required metadata",
            { userId, tierStr, subscriptionId: session.subscription }
          );
          break;
        }

        const tier = tierStr as Exclude<Tier, "FREE">;
        const videosPerWeek = TIER_VIDEOS_PER_WEEK[tier] ?? 0;

        let schedule: unknown = null;
        if (scheduleStr) {
          try {
            schedule = JSON.parse(scheduleStr);
          } catch {
            console.error("Failed to parse schedule metadata:", scheduleStr);
          }
        }

        // Parse content config from metadata with safe defaults
        let contentVideoType: VideoType = "GAMEPLAY";
        let contentVoiceType: VoiceType = "RANDOM";
        let contentStoryTypes: string[] = [];
        let contentRandomizeStories = true;

        if (contentConfigStr) {
          try {
            const parsed: unknown = JSON.parse(contentConfigStr);
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
              contentConfigStr
            );
          }
        }

        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;

        // Ensure the user has the Stripe customer ID set
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (customerId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }

        // Create a new TikTokAccount with the subscription details
        // Username is a placeholder until the user links their TikTok account
        const account = await prisma.tikTokAccount.create({
          data: {
            username: `pending-${Date.now()}`,
            tier,
            stripeSubscriptionId: subscriptionId,
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
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;

        if (!priceId) {
          console.error("subscription.updated: no price ID found");
          break;
        }

        const tier = mapStripePriceToTier(priceId);

        if (tier === "FREE") {
          // Price ID doesn't map to a known tier — log and skip
          console.warn(
            "subscription.updated: unrecognized price ID",
            priceId
          );
          break;
        }

        const paidTier = tier as Exclude<Tier, "FREE">;
        const videosPerWeek = TIER_VIDEOS_PER_WEEK[paidTier] ?? 0;

        await prisma.tikTokAccount.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { tier, videosPerWeek },
        });

        console.log(
          `Updated TikTokAccount subscription ${subscription.id} to tier ${tier}`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Find the account to disconnect from Late.dev before updating
        const accountToCancel = await prisma.tikTokAccount.findFirst({
          where: { stripeSubscriptionId: subscription.id },
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
          where: { stripeSubscriptionId: subscription.id },
          data: {
            tier: "FREE",
            stripeSubscriptionId: null,
            videosPerWeek: 0,
            lateAccountId: null,
            lateProfileId: null,
            username: `unlinked-${Date.now()}`,
          },
        });

        console.log(
          `Cancelled subscription ${subscription.id}, fully unlinked TikTok account`
        );
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        if (subscriptionId) {
          // Flag the account — could add a `paymentFailed` field later
          // For now, log the failure for monitoring
          console.error(
            `Payment failed for subscription ${subscriptionId}, customer: ${
              typeof invoice.customer === "string"
                ? invoice.customer
                : invoice.customer?.id
            }`
          );

          const failedAccount = await prisma.tikTokAccount.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
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

      case "invoice.payment_succeeded": {
        // Payment succeeded — tier already handled by subscription events
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
