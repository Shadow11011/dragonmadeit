import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIER_CONFIG } from "@/types";
import { getServerFingerprint } from "@/lib/server-fingerprint";

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
  // SHA-256 hex (64 chars). Required — clients must submit a fingerprint
  // to activate a free account.
  deviceFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
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

    const { schedule, contentConfig, deviceFingerprint } = parsed.data;
    const { ipHash, uaHash } = getServerFingerprint(request);

    // Abuse control layer 1: one FREE account per user, ever.
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

    // Abuse control layer 2: one FREE account per device fingerprint.
    // A device that has already minted a free account (under any user) is
    // locked out. Legitimate edge cases (shared family device) are the
    // tradeoff we accept — they can upgrade to a paid tier from either
    // device.
    const existingDevice = await prisma.deviceFingerprint.findFirst({
      where: { clientHash: deviceFingerprint, tier: "FREE" },
      select: { id: true, userId: true },
    });
    if (existingDevice) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This device has already claimed a free account. Sign in with that account, or upgrade to a paid tier to add a new channel.",
          code: "DEVICE_ALREADY_CLAIMED",
        },
        { status: 429 }
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

    // Record the fingerprint. Best-effort — if this write fails (e.g. race)
    // we still keep the account; the next free attempt from the same device
    // will catch it via the user-level 409.
    await prisma.deviceFingerprint
      .create({
        data: {
          clientHash: deviceFingerprint,
          ipHash,
          uaHash,
          tier: "FREE",
          userId: session.user.id,
          accountId: account.id,
        },
      })
      .catch((err) => {
        console.error("DeviceFingerprint write failed (non-fatal):", err);
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
