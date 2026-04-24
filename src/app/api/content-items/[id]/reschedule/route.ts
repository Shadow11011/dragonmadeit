import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rescheduleSchema = z.object({
  scheduledFor: z.string().datetime({ message: "Invalid ISO timestamp" }),
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = params;

    const raw: unknown = await request.json();
    const parsed = rescheduleSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 },
      );
    }

    const newDate = new Date(parsed.data.scheduledFor);
    if (Number.isNaN(newDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid timestamp" },
        { status: 400 },
      );
    }

    if (newDate.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, error: "Scheduled time must be in the future" },
        { status: 400 },
      );
    }

    const item = await prisma.contentItem.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        userId: true,
        tiktokAccount: {
          select: { userId: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Content item not found" },
        { status: 404 },
      );
    }

    // Ownership check: direct userId OR via TikTokAccount.userId
    const ownedDirectly = item.userId === session.user.id;
    const ownedViaAccount = item.tiktokAccount?.userId === session.user.id;
    if (!ownedDirectly && !ownedViaAccount) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    if (item.status !== "SCHEDULED" && item.status !== "PROCESSING") {
      return NextResponse.json(
        {
          success: false,
          error: "Only scheduled or processing items can be rescheduled",
        },
        { status: 400 },
      );
    }

    const updated = await prisma.contentItem.update({
      where: { id },
      data: { scheduledAt: newDate },
      select: {
        id: true,
        title: true,
        status: true,
        scheduledAt: true,
        postedAt: true,
        tiktokPostId: true,
        createdAt: true,
        tiktokAccount: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        tiktokAccountUsername: updated.tiktokAccount?.username ?? null,
        tiktokAccount: undefined,
      },
    });
  } catch (error) {
    console.error(
      `PATCH /api/content-items/${params?.id}/reschedule error:`,
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
