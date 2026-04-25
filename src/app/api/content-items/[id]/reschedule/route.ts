import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const rescheduleSchema = z.object({
  scheduledAt: z.string().datetime({ message: "Invalid ISO timestamp" }),
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

    const newDate = new Date(parsed.data.scheduledAt);
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

    // Schedule horizon cap: posts cannot be scheduled more than 30 days out.
    // Keeps the planning surface short and prevents stale scheduled-but-unverified
    // jobs accumulating in the DB.
    const MAX_SCHEDULE_HORIZON_DAYS = 30;
    const horizonMs = MAX_SCHEDULE_HORIZON_DAYS * 24 * 60 * 60 * 1000;
    if (newDate.getTime() > Date.now() + horizonMs) {
      return NextResponse.json(
        {
          success: false,
          error: `Scheduled time cannot be more than ${MAX_SCHEDULE_HORIZON_DAYS} days from now`,
        },
        { status: 400 },
      );
    }

    // Single atomic conditional update: enforces ownership (via ContentItem.userId)
    // AND reschedulable status in the same query, preventing TOCTOU races where
    // a posting job flips the status between a read and the write.
    const result = await prisma.contentItem.updateMany({
      where: {
        id,
        userId: session.user.id,
        status: { in: ["SCHEDULED", "PROCESSING"] },
      },
      data: { scheduledAt: newDate },
    });

    if (result.count === 0) {
      // The update matched nothing. Disambiguate: does the item exist at all?
      const exists = await prisma.contentItem.findUnique({
        where: { id },
        select: { userId: true, status: true },
      });
      if (!exists) {
        return NextResponse.json(
          { success: false, error: "Content item not found" },
          { status: 404 },
        );
      }
      if (exists.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 },
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: "Only scheduled or processing items can be rescheduled",
        },
        { status: 400 },
      );
    }

    const updated = await prisma.contentItem.findUnique({
      where: { id },
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

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Content item not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        title: updated.title,
        status: updated.status,
        scheduledAt: updated.scheduledAt,
        postedAt: updated.postedAt,
        tiktokPostId: updated.tiktokPostId,
        createdAt: updated.createdAt,
        tiktokAccountUsername: updated.tiktokAccount?.username ?? null,
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
