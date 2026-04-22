import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextPostTime } from "@/lib/schedule-utils";
import { z } from "zod";

const linkSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(100, "Username too long")
    .regex(
      /^[a-zA-Z0-9._]+$/,
      "Username can only contain letters, numbers, dots, and underscores"
    ),
  lateAccountId: z.string().min(1, "Late account ID cannot be empty").optional(),
});

export async function POST(
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
      select: {
        id: true,
        username: true,
        userId: true,
        schedule: true,
      },
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

    // Only allow linking if the account is still pending
    if (!account.username.startsWith("pending-")) {
      return NextResponse.json(
        {
          success: false,
          error: "This account is already linked to a TikTok username",
        },
        { status: 409 }
      );
    }

    const body: unknown = await request.json();
    const parsed = linkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const { username, lateAccountId } = parsed.data;

    // Compute the first scheduled post time so the n8n Orchestrator's SELECT
    // (nextPostAt <= NOW() AND videoGenStatus='IDLE' AND lateAccountId IS NOT NULL)
    // starts matching this account on its next 30-min tick. videoGenStatus is
    // already 'IDLE' by default from account creation.
    const nextPostAt = getNextPostTime(account.schedule);

    const updatedAccount = await prisma.tikTokAccount.update({
      where: { id },
      data: {
        username,
        ...(lateAccountId ? { lateAccountId } : {}),
        ...(nextPostAt ? { nextPostAt } : {}),
      },
      select: {
        id: true,
        username: true,
        tier: true,
        videosPerWeek: true,
        scheduleLocked: true,
        nextPostAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedAccount });
  } catch (error) {
    console.error(`POST /api/tiktok-accounts/${params?.id}/link error:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
