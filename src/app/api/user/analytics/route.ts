import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ContentStatus } from "@prisma/client";

interface AccountStats {
  posted: number;
  scheduled: number;
  processing: number;
  failed: number;
  total: number;
  successRate: number;
  lastPostedAt: string | null;
  nextPostAt: string | null;
  dailyCounts: Array<{ date: string; posted: number; failed: number }>;
}

interface AccountBlock {
  id: string;
  username: string;
  displayName: string | null;
  tier: string;
  videosPerWeek: number;
  videoType: string;
  isLinked: boolean;
  stats: AccountStats;
  recent: Array<{
    id: string;
    title: string;
    status: ContentStatus;
    scheduledAt: string | null;
    postedAt: string | null;
    tiktokPostId: string | null;
    createdAt: string;
  }>;
}

function startOfDayISO(offsetDays = 0): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(90, Math.max(1, parseInt(searchParams.get("days") ?? "7", 10)));

    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        tier: true,
        videosPerWeek: true,
        videoType: true,
        nextPostAt: true,
      },
    });

    const accountIds = accounts.map((a) => a.id);

    const items = accountIds.length
      ? await prisma.contentItem.findMany({
          where: {
            userId: session.user.id,
            tiktokAccountId: { in: accountIds },
          },
          orderBy: { createdAt: "desc" },
          take: 500,
          select: {
            id: true,
            title: true,
            status: true,
            scheduledAt: true,
            postedAt: true,
            tiktokPostId: true,
            createdAt: true,
            updatedAt: true,
            tiktokAccountId: true,
          },
        })
      : [];

    const byAccount: Record<string, typeof items> = {};
    for (const it of items) {
      const key = it.tiktokAccountId ?? "";
      if (!key) continue;
      (byAccount[key] ??= []).push(it);
    }

    const dayKeys: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      dayKeys.push(startOfDayISO(i));
    }

    const blocks: AccountBlock[] = accounts.map((a) => {
      const rows = byAccount[a.id] ?? [];

      let posted = 0;
      let scheduled = 0;
      let processing = 0;
      let failed = 0;
      let lastPostedAt: Date | null = null;

      const dailyMap: Record<string, { posted: number; failed: number }> = {};
      for (const k of dayKeys) dailyMap[k] = { posted: 0, failed: 0 };

      for (const r of rows) {
        if (r.status === "POSTED") {
          posted++;
          if (r.postedAt && (!lastPostedAt || r.postedAt > lastPostedAt)) {
            lastPostedAt = r.postedAt;
          }
        } else if (r.status === "SCHEDULED") {
          scheduled++;
        } else if (r.status === "PROCESSING") {
          processing++;
        } else if (r.status === "FAILED") {
          failed++;
        }

        // Bucket by the event time for that status. POSTED uses postedAt;
        // FAILED uses updatedAt (when the failure was recorded) so the chart
        // reflects the failure date, not when the item was queued.
        let when: Date | null = null;
        if (r.status === "POSTED") when = r.postedAt ?? null;
        else if (r.status === "FAILED") when = r.updatedAt ?? r.createdAt;
        if (when) {
          const key = when.toISOString().slice(0, 10);
          if (dailyMap[key]) {
            if (r.status === "POSTED") dailyMap[key].posted++;
            else if (r.status === "FAILED") dailyMap[key].failed++;
          }
        }
      }

      const terminal = posted + failed;
      const successRate = terminal > 0 ? Math.round((posted / terminal) * 100) : 0;

      return {
        id: a.id,
        username: a.username,
        displayName: a.displayName,
        tier: a.tier,
        videosPerWeek: a.videosPerWeek,
        videoType: a.videoType,
        isLinked: !a.username.startsWith("pending-"),
        stats: {
          posted,
          scheduled,
          processing,
          failed,
          total: posted + scheduled + processing + failed,
          successRate,
          lastPostedAt: lastPostedAt ? lastPostedAt.toISOString() : null,
          nextPostAt: a.nextPostAt ? a.nextPostAt.toISOString() : null,
          dailyCounts: dayKeys.map((k) => ({
            date: k,
            posted: dailyMap[k]?.posted ?? 0,
            failed: dailyMap[k]?.failed ?? 0,
          })),
        },
        recent: rows.slice(0, 5).map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          scheduledAt: r.scheduledAt?.toISOString() ?? null,
          postedAt: r.postedAt?.toISOString() ?? null,
          tiktokPostId: r.tiktokPostId,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    });

    return NextResponse.json({
      accounts: blocks,
      range: { days, from: dayKeys[0], to: dayKeys[dayKeys.length - 1] },
    });
  } catch (error) {
    console.error("GET /api/user/analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
