import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnalytics, getDailyMetrics } from "@/lib/late-api";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "7", 10);

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromDateStr = fromDate.toISOString().split("T")[0];
    const toDateStr = new Date().toISOString().split("T")[0];

    // Get all user's TikTok accounts that have a Late profile
    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: session.user.id, lateProfileId: { not: null } },
      select: { id: true, lateProfileId: true, username: true },
    });

    if (accounts.length === 0) {
      return NextResponse.json({
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagementRate: 0,
        dailyMetrics: [],
        topPosts: [],
      });
    }

    // Fetch analytics for each account in parallel
    const [analyticsResults, dailyResults] = await Promise.all([
      Promise.all(
        accounts.map((a) =>
          getAnalytics({
            profileId: a.lateProfileId!,
            fromDate: fromDateStr,
            toDate: toDateStr,
            sortBy: "engagement",
            limit: 10,
          }).catch(() => null)
        )
      ),
      Promise.all(
        accounts.map((a) =>
          getDailyMetrics({
            profileId: a.lateProfileId!,
            fromDate: fromDateStr,
            toDate: toDateStr,
          }).catch(() => null)
        )
      ),
    ]);

    // Aggregate analytics across accounts
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalEngagement = 0;
    let postCount = 0;
    const topPosts: Array<{
      id: string;
      content: string | null;
      views: number;
      likes: number;
      engagementRate: number;
      username: string;
    }> = [];

    for (let i = 0; i < analyticsResults.length; i++) {
      const result = analyticsResults[i];
      if (!result) continue;
      const username = accounts[i].username;
      for (const post of result.posts) {
        totalViews += post.views;
        totalLikes += post.likes;
        totalComments += post.comments;
        totalShares += post.shares;
        totalEngagement += post.engagementRate;
        postCount++;
        topPosts.push({
          id: post.id,
          content: post.content,
          views: post.views,
          likes: post.likes,
          engagementRate: post.engagementRate,
          username,
        });
      }
    }

    // Sort top posts by views and take top 5
    topPosts.sort((a, b) => b.views - a.views);
    const top5 = topPosts.slice(0, 5);

    // Merge daily metrics across accounts by date
    const dailyMap = new Map<
      string,
      {
        views: number;
        likes: number;
        comments: number;
        shares: number;
        engagementTotal: number;
      }
    >();
    for (const result of dailyResults) {
      if (!result) continue;
      for (const day of result) {
        const existing = dailyMap.get(day.date);
        if (existing) {
          existing.views += day.views;
          existing.likes += day.likes;
          existing.comments += day.comments;
          existing.shares += day.shares;
          existing.engagementTotal += day.engagementTotal;
        } else {
          dailyMap.set(day.date, { ...day });
        }
      }
    }

    const dailyMetrics = Array.from(dailyMap.entries())
      .map(([date, m]) => ({ date, ...m }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate: postCount > 0 ? totalEngagement / postCount : 0,
      dailyMetrics,
      topPosts: top5,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
