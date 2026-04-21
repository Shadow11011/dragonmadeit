import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_CONFIG } from "@/types";

const scheduleShape = z.object({
  days: z.array(z.number().int().min(0).max(6)).min(1).max(7),
  times: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1).max(2),
  timezone: z.string().default("UTC"),
});

const contentConfigShape = z.object({
  videoType: z.enum(["GAMEPLAY", "AI_IMAGES"]).default("GAMEPLAY"),
  voiceType: z.enum(["MALE", "FEMALE", "RANDOM"]).default("RANDOM"),
  storyTypes: z.array(z.string()).min(1),
  randomizeStories: z.boolean().default(true),
});

const bodySchema = z.object({
  schedule: scheduleShape.optional(),
  contentConfig: contentConfigShape,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const json = (await request.json()) as unknown;
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { schedule, contentConfig } = parsed.data;

    // Abuse control: one FREE account per user, ever.
    const existingFree = await prisma.tikTokAccount.findFirst({
      where: { userId: session.user.id, tier: "FREE" },
      select: { id: true },
    });
    if (existingFree) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You already have a free account. Upgrade to a paid tier to add another channel.",
        },
        { status: 409 }
      );
    }

    // FREE forces gameplay — never persist AI_IMAGES for a FREE account.
    const videoType = contentConfig.videoType === "AI_IMAGES" ? "GAMEPLAY" : contentConfig.videoType;

    const pendingUsername = `pending-${Math.random().toString(36).slice(2, 10)}`;

    const account = await prisma.tikTokAccount.create({
      data: {
        userId: session.user.id,
        username: pendingUsername,
        tier: "FREE",
        billingInterval: "MONTHLY",
        videosPerWeek: TIER_CONFIG.FREE.videosPerWeek,
        schedule: schedule ? (schedule as object) : undefined,
        scheduleLocked: Boolean(schedule),
        videoType,
        voiceType: contentConfig.voiceType,
        storyTypes: contentConfig.storyTypes,
        randomizeStories: contentConfig.randomizeStories,
      },
      select: { id: true },
    });

    return NextResponse.json({ success: true, accountId: account.id });
  } catch (error) {
    console.error("POST /api/tiktok-accounts/free error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
