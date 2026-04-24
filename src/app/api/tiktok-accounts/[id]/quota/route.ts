import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_CONFIG } from "@/types";

// Monthly quota is now driven by TIER_CONFIG[tier].generateQuotaPerMonth for
// the Generate pillar. Clipper / Scheduler pillars aren't shipped yet — when
// they are, they'll have their own quota endpoints or a combined one.
//
// Quota semantics:
//   - canGenerate:false tiers (SCHEDULER, CLIPPER) -> limit: 0 (pillar locked)
//   - canGenerate:true tiers -> limit: generateQuotaPerMonth
//   - AGENCY has generateQuotaPerMonth: 0 as a placeholder for "custom" -
//     until we store per-account AGENCY quotas, report null (uncapped) so
//     the UI doesn't mislead enterprise users.

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const account = await prisma.tikTokAccount.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, tier: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }
    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Start of the current calendar month (UTC) — matches the orchestrator's
    // date_trunc('month', NOW()) in the SELECT gate, so the counter the user
    // sees is the same counter the scheduler enforces.
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    );
    const nextMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)
    );

    const used = await prisma.contentItem.count({
      where: {
        tiktokAccountId: account.id,
        status: "POSTED",
        postedAt: { gte: monthStart },
      },
    });

    const config = TIER_CONFIG[account.tier];
    // AGENCY: report null (uncapped) until per-account custom quotas are stored.
    const limit =
      account.tier === "AGENCY" ? null : config.generateQuotaPerMonth;
    const remaining = limit === null ? null : Math.max(0, limit - used);

    return NextResponse.json({
      success: true,
      data: {
        tier: account.tier,
        videosPerWeek: config.videosPerWeek,
        used,
        limit,
        remaining,
        resetAt: nextMonthStart.toISOString(),
      },
    });
  } catch (error) {
    console.error(
      `GET /api/tiktok-accounts/${params?.id}/quota error:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
