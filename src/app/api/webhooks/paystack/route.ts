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
          select: { id: true, name: true },
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
          console.log("paystack webhook: account already exists for subscription", subscriptionCode);
          break;
        }

        // Store customer code on user if not already set
        const customerCode = (data.customer as { customer_code?: string })?.customer_code;
        if (customerCode) {
          await prisma.user.update({
            where: { id: user.id },
            data: { paystackCustomerCode: customerCode },
          });
        }

        // Create pending TikTok account
        const account = await prisma.tikTokAccount.create({
          data: {
            username: `pending-${Date.now()}`,
            tier,
            billingInterval: interval,
            paystackSubscriptionCode: subscriptionCode,
            paystackEmailToken: emailToken,
            videosPerWeek,
            userId: user.id,
          },
        });

        console.log(`paystack webhook: created account ${account.id} for user ${user.id} tier ${tier}`);

        // Send confirmation email
        sendPaymentConfirmedEmail({
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

        console.log(`paystack webhook: disabled subscription ${subscriptionCode}`);
        break;
      }

      case "charge.success": {
        // Recurring charge success — subscription already exists, nothing to create.
        // Paystack handles renewal automatically.
        const subscriptionCode = (data.subscription as { subscription_code?: string })?.subscription_code;
        if (subscriptionCode) {
          console.log(`paystack webhook: charge.success for subscription ${subscriptionCode}`);
        }
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
            sendPaymentFailedEmail({
              to: failedAccount.user.email,
              name: failedAccount.user.name,
            });
          }
        }
        break;
      }

      default:
        console.log(`paystack webhook: unhandled event ${event}`);
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
