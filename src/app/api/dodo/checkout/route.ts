import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession } from "@/lib/dodo";
import { TIER_CONFIG } from "@/types";
import type { PostingSchedule } from "@/types";
import { z } from "zod";

const scheduleShape = z
  .object({
    days: z.array(z.number().int().min(0).max(6)).min(1),
    times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
    timezone: z.string().min(1).default("America/New_York"),
  })
  .optional();

// AGENCY is deliberately excluded — it's custom-billed outside this flow.
const schema = z.object({
  tier: z.enum(["SCHEDULER", "CREATOR", "CLIPPER", "STUDIO", "STUDIO_PRO"]),
  billingInterval: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL"]),
  schedule: scheduleShape,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { tier, billingInterval, schedule } = parsed.data;

    // Enforce maxAccounts for the chosen tier. Count the user's existing
    // accounts on this tier — if the new subscription would exceed the cap,
    // block before hitting Dodo.
    const tierMax = TIER_CONFIG[tier].maxAccounts;
    const existingOnTier = await prisma.tikTokAccount.count({
      where: { userId: session.user.id, tier },
    });
    if (existingOnTier >= tierMax) {
      return NextResponse.json(
        {
          success: false,
          error: `You have reached the ${TIER_CONFIG[tier].name} account limit (${tierMax}). Upgrade to add more accounts.`,
        },
        { status: 409 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://dragonmadeit.app";
    const returnUrl = `${baseUrl}/dashboard/accounts?checkout=success`;

    // Optional schedule (from the tier-pick flow) round-trips via checkout
    // metadata so the webhook can persist it on the new TikTokAccount. Dodo
    // requires metadata values to be strings, so JSON-encode the object.
    const metadata: Record<string, string> = {};
    if (schedule) {
      const normalized: PostingSchedule = {
        days: schedule.days,
        times: schedule.times,
        timezone: schedule.timezone,
      };
      metadata.schedule = JSON.stringify(normalized);
    }

    const result = await createCheckoutSession({
      userId: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      tier,
      interval: billingInterval,
      returnUrl,
      metadata,
    });

    if (!result.ok) {
      if (result.error.kind === "PRODUCT_NOT_CONFIGURED") {
        return NextResponse.json(
          {
            success: false,
            error:
              "This tier isn't available yet — please contact support if this persists.",
          },
          { status: 503 }
        );
      }
      console.error("dodo checkout error:", result.error.message);
      return NextResponse.json(
        { success: false, error: "Failed to start checkout" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { checkoutUrl: result.checkoutUrl },
    });
  } catch (error) {
    console.error("POST /api/dodo/checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize checkout" },
      { status: 500 }
    );
  }
}
