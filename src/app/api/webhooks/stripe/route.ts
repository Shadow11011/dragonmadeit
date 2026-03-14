import { NextResponse } from "next/server";
import { stripe, mapStripePriceToTier, TIER_VIDEOS_PER_WEEK } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { Tier } from "@prisma/client";
import Stripe from "stripe";

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
            userId,
          },
        });

        console.log(
          `Created TikTokAccount ${account.id} for user ${userId} with tier ${tier}`
        );
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

        await prisma.tikTokAccount.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            tier: "FREE",
            stripeSubscriptionId: null,
            videosPerWeek: 0,
          },
        });

        console.log(
          `Cancelled subscription ${subscription.id}, set TikTokAccount to FREE`
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
