import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyTransaction, TIER_VIDEOS_PER_WEEK, fetchSubscription } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { getNextPostTime } from "@/lib/schedule-utils";
import { Tier, BillingInterval, VideoType, VoiceType } from "@prisma/client";
import type { PostingSchedule } from "@/types";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const { reference } = body as { reference?: string };

    if (!reference || typeof reference !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing reference" },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check if user already has a pending account (webhook may have beaten us)
    const existing = await prisma.tikTokAccount.findFirst({
      where: {
        userId,
        username: { startsWith: "pending-" },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json({ success: true, data: { accountId: existing.id } });
    }

    // Verify with Paystack
    const txn = await verifyTransaction(reference);

    if (txn.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Transaction not successful" },
        { status: 400 }
      );
    }

    const metadata = txn.metadata as
      | { userId?: string; tier?: string; billingInterval?: string; schedule?: string; contentConfig?: string }
      | undefined;

    if (!metadata?.tier) {
      return NextResponse.json(
        { success: false, error: "Missing tier in transaction metadata" },
        { status: 400 }
      );
    }

    // Double-check: re-query in case webhook created it between our first check and now
    const doubleCheck = await prisma.tikTokAccount.findFirst({
      where: {
        userId,
        username: { startsWith: "pending-" },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    if (doubleCheck) {
      return NextResponse.json({ success: true, data: { accountId: doubleCheck.id } });
    }

    const tier = metadata.tier as Exclude<Tier, "FREE">;
    const videosPerWeek = TIER_VIDEOS_PER_WEEK[tier] ?? 0;
    const billingInterval = (metadata.billingInterval as BillingInterval) ?? "MONTHLY";

    // Parse schedule
    let schedule: unknown = null;
    if (metadata.schedule) {
      try {
        schedule = JSON.parse(metadata.schedule);
      } catch { /* use null */ }
    }

    // Parse content config
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
          if (cfg.voiceType === "MALE" || cfg.voiceType === "FEMALE" || cfg.voiceType === "RANDOM") {
            contentVoiceType = cfg.voiceType;
          }
          if (Array.isArray(cfg.storyTypes)) {
            contentStoryTypes = cfg.storyTypes.filter((s): s is string => typeof s === "string");
          }
          if (typeof cfg.randomizeStories === "boolean") {
            contentRandomizeStories = cfg.randomizeStories;
          }
        }
      } catch { /* use defaults */ }
    }

    // Get subscription code
    const subscriptionCode =
      txn.plan_object?.subscriptions?.[0]?.subscription_code ??
      txn.authorization?.subscription_code ??
      null;

    // Store customer code
    if (txn.customer?.customer_code) {
      await prisma.user.update({
        where: { id: userId },
        data: { paystackCustomerCode: txn.customer.customer_code },
      });
    }

    // Create the pending account
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

    // Calculate nextPostAt
    if (schedule) {
      try {
        const nextPost = getNextPostTime(schedule as PostingSchedule);
        if (nextPost) {
          await prisma.tikTokAccount.update({
            where: { id: account.id },
            data: { nextPostAt: nextPost },
          });
        }
      } catch { /* non-critical */ }
    }

    // Try to fetch email_token for subscription cancellation
    if (subscriptionCode) {
      try {
        const sub = await fetchSubscription(subscriptionCode);
        if (sub.email_token) {
          await prisma.tikTokAccount.update({
            where: { id: account.id },
            data: { paystackEmailToken: sub.email_token },
          });
        }
      } catch { /* will be captured by subscription.create webhook */ }
    }

    return NextResponse.json({ success: true, data: { accountId: account.id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("POST /api/paystack/verify error:", message, error);
    return NextResponse.json(
      { success: false, error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
