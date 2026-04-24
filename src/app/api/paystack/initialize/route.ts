import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PAYSTACK_PLAN_CODES, PAYSTACK_PLAN_AMOUNTS, initializeTransaction } from "@/lib/paystack";
import { prisma } from "@/lib/prisma";
import { TIER_CONFIG } from "@/types";
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
    const planCode = PAYSTACK_PLAN_CODES[tier][billingInterval];
    const amount = PAYSTACK_PLAN_AMOUNTS[tier][billingInterval];

    // Guard: Don hasn't populated the 15 new Paystack plan-code env vars yet,
    // so `planCode` may be empty. Fail fast with a clear message rather than
    // forwarding an empty plan to Paystack.
    if (!planCode) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This tier isn't available yet — Paystack plan is being provisioned. Please try again soon.",
        },
        { status: 503 }
      );
    }

    // Enforce maxAccounts for the chosen tier. Count the user's existing
    // accounts on this tier — if the new subscription would exceed the cap,
    // block before we ever hit Paystack.
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

    const result = await initializeTransaction({
      email: session.user.email,
      amount,
      plan: planCode,
      callbackUrl: `${baseUrl}/dashboard/accounts?checkout=success`,
      metadata: {
        userId: session.user.id,
        tier,
        billingInterval,
        ...(schedule ? { schedule } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: { authorization_url: result.authorization_url },
    });
  } catch (error) {
    console.error("POST /api/paystack/initialize error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
