import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAnalytics } from "@/lib/late-api";
import type { DashboardStats } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    let stats: DashboardStats;

    try {
      const [totalPosts, scheduledPosts, failedPosts, accountCount, postsThisWeek, accounts] =
        await Promise.all([
          prisma.contentItem.count({
            where: { userId, status: "POSTED" },
          }),
          prisma.contentItem.count({
            where: { userId, status: "SCHEDULED" },
          }),
          prisma.contentItem.count({
            where: { userId, status: "FAILED" },
          }),
          prisma.tikTokAccount.count({
            where: { userId },
          }),
          prisma.contentItem.count({
            where: {
              userId,
              status: "POSTED",
              postedAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              },
            },
          }),
          prisma.tikTokAccount.findMany({
            where: { userId, lateProfileId: { not: null } },
            select: { lateProfileId: true },
          }),
        ]);

      // Fetch total views from Late API across all linked accounts
      let totalViews = 0;
      try {
        const analyticsResults = await Promise.all(
          accounts.map((a) =>
            getAnalytics({
              profileId: a.lateProfileId!,
              limit: 50,
            }).catch(() => null)
          )
        );
        for (const result of analyticsResults) {
          if (!result) continue;
          for (const post of result.posts) {
            totalViews += post.views;
          }
        }
      } catch {
        // Late API unavailable — fall back to 0
      }

      stats = {
        totalPosts,
        scheduledPosts,
        accountCount,
        totalViews,
        postsThisWeek,
        failedPosts,
      };
    } catch {
      // If DB is unavailable, return zeros
      stats = {
        totalPosts: 0,
        scheduledPosts: 0,
        accountCount: 0,
        totalViews: 0,
        postsThisWeek: 0,
        failedPosts: 0,
      };
    }

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("GET /api/user/stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
