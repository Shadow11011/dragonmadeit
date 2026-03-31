import { NextResponse } from "next/server";
import {
  mapGumroadProductToTier,
  TIER_VIDEOS_PER_WEEK,
} from "@/lib/gumroad";
import { prisma } from "@/lib/prisma";
import { disconnectAccount } from "@/lib/late-api";
import {
  sendPaymentConfirmedEmail,
  sendPaymentFailedEmail,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const resourceName = data.resource_name;
    const email = data.email;
    const productId = data.product_id;
    const subscriptionId = data.subscription_id;

    switch (resourceName) {
      case "sale": {
        if (!email || !productId) {
          console.error("gumroad webhook: missing email or product_id");
          break;
        }

        const tier = mapGumroadProductToTier(productId);
        if (!tier) {
          console.error("gumroad webhook: unknown product_id", productId);
          break;
        }

        const videosPerWeek = TIER_VIDEOS_PER_WEEK[tier];

        // Skip recurring charges — only handle initial purchase
        if (data.is_recurring_charge === "true") {
          console.log("gumroad webhook: recurring charge, skipping account creation");
          break;
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true },
        });

        if (!user) {
          console.error("gumroad webhook: no user found for email", email);
          break;
        }

        // Check if account already exists for this subscription
        if (subscriptionId) {
          const existing = await prisma.tikTokAccount.findFirst({
            where: { gumroadSubscriptionId: subscriptionId },
            select: { id: true },
          });
          if (existing) {
            console.log("gumroad webhook: account already exists for subscription", subscriptionId);
            break;
          }
        }

        // Create pending TikTok account
        const account = await prisma.tikTokAccount.create({
          data: {
            username: `pending-${Date.now()}`,
            tier,
            billingInterval: "MONTHLY",
            gumroadSubscriptionId: subscriptionId || null,
            videosPerWeek,
            userId: user.id,
          },
        });

        console.log(`gumroad webhook: created account ${account.id} for user ${user.id} tier ${tier}`);

        // Send confirmation email
        sendPaymentConfirmedEmail({
          to: email,
          tier,
          name: user.name,
        });

        break;
      }

      case "cancellation":
      case "subscription_ended": {
        if (!subscriptionId) {
          console.error("gumroad webhook: missing subscription_id for cancellation");
          break;
        }

        // Find the account to disconnect from Late.dev
        const accountToCancel = await prisma.tikTokAccount.findFirst({
          where: { gumroadSubscriptionId: subscriptionId },
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
          where: { gumroadSubscriptionId: subscriptionId },
          data: {
            tier: "FREE",
            gumroadSubscriptionId: null,
            videosPerWeek: 0,
            lateAccountId: null,
            lateProfileId: null,
            username: `unlinked-${Date.now()}`,
          },
        });

        console.log(`gumroad webhook: cancelled subscription ${subscriptionId}`);
        break;
      }

      case "subscription_updated": {
        // Handle failed payments
        if (data.failed_at && subscriptionId) {
          const failedAccount = await prisma.tikTokAccount.findFirst({
            where: { gumroadSubscriptionId: subscriptionId },
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
    console.error("Gumroad webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
