import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_CONFIG } from "@/types";

// Monthly quota for FREE accounts. Paid tiers return limit: null (uncapped
// by calendar month — they're only rate-limited by videosPerWeek via the
// orchestrator scheduling maths).
const FREE_MONTHLY_LIMIT = 4;

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

    const limit = account.tier === "FREE" ? FREE_MONTHLY_LIMIT : null;
    const remaining = limit === null ? null : Math.max(0, limit - used);

    return NextResponse.json({
      success: true,
      data: {
        tier: account.tier,
        videosPerWeek: TIER_CONFIG[account.tier].videosPerWeek,
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
