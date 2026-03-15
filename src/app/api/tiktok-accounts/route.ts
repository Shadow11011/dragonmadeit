import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { TikTokAccountInfo, PostingSchedule } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const accounts = await prisma.tikTokAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
        tier: true,
        videosPerWeek: true,
        schedule: true,
        scheduleLocked: true,
        videoType: true,
        voiceType: true,
        storyTypes: true,
        randomizeStories: true,
        lateProfileId: true,
        lateAccountId: true,
        createdAt: true,
      },
    });

    const data: TikTokAccountInfo[] = accounts.map((account) => ({
      id: account.id,
      username: account.username,
      displayName: account.displayName,
      tier: account.tier,
      videosPerWeek: account.videosPerWeek,
      schedule: account.schedule as PostingSchedule | null,
      scheduleLocked: account.scheduleLocked,
      videoType: account.videoType ?? "GAMEPLAY",
      voiceType: account.voiceType ?? "RANDOM",
      storyTypes: (Array.isArray(account.storyTypes) ? account.storyTypes : []) as string[],
      randomizeStories: account.randomizeStories ?? true,
      lateProfileId: account.lateProfileId,
      lateAccountId: account.lateAccountId,
      isLinked: account.username ? !account.username.startsWith("pending-") : false,
      createdAt: account.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/tiktok-accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
