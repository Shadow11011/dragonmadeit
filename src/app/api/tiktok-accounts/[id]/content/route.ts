import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { contentConfigSchema, validateContentConfig } from "@/lib/content-config";

export async function PUT(
  request: Request,
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

    const { id } = params;

    // Find the TikTok account and verify ownership
    const account = await prisma.tikTokAccount.findUnique({
      where: { id },
      select: { id: true, userId: true },
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

    const body: unknown = await request.json();
    const parsed = contentConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const config = parsed.data;

    // Validate story types against voice type compatibility
    const validation = validateContentConfig(config);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors[0] ?? "Invalid content config",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.tikTokAccount.update({
      where: { id },
      data: {
        videoType: config.videoType,
        voiceType: config.voiceType,
        storyTypes: config.storyTypes,
        randomizeStories: config.randomizeStories,
      },
      select: {
        id: true,
        videoType: true,
        voiceType: true,
        storyTypes: true,
        randomizeStories: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        videoType: updated.videoType,
        voiceType: updated.voiceType,
        storyTypes: updated.storyTypes as string[],
        randomizeStories: updated.randomizeStories,
      },
    });
  } catch (error) {
    console.error(
      `PUT /api/tiktok-accounts/${params?.id}/content error:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
