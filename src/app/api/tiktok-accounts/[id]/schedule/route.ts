import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNextPostTime } from "@/lib/schedule-utils";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const DAY_NAME_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const scheduleSchema = z.object({
  days: z
    .array(z.union([z.number().int().min(0).max(6), z.string()]))
    .min(1, "Select at least one day"),
  times: z
    .array(z.string().regex(/^\d{2}:\d{2}$/))
    .min(1, "Select at least one time"),
  // All schedules are UTC. The field is accepted for forward-compat but
  // ignored and overwritten before persisting.
  timezone: z.string().optional(),
});

function normalizeDays(days: (number | string)[]): number[] {
  const nums = days.map((d) => {
    if (typeof d === "number") return d;
    return DAY_NAME_TO_NUMBER[d.toLowerCase()];
  });
  const valid = nums.filter(
    (n): n is number => typeof n === "number" && n >= 0 && n <= 6,
  );
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

function compareHHMM(a: string, b: string): number {
  const [ah, am] = a.split(":").map((v) => parseInt(v, 10));
  const [bh, bm] = b.split(":").map((v) => parseInt(v, 10));
  return ah * 60 + am - (bh * 60 + bm);
}

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

    const account = await prisma.tikTokAccount.findUnique({
      where: { id },
      select: { id: true, userId: true, scheduleLocked: true, videosPerWeek: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 },
      );
    }

    if (account.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    if (account.scheduleLocked) {
      return NextResponse.json(
        { success: false, error: "Schedule is locked for this account" },
        { status: 409 },
      );
    }

    const raw: unknown = await request.json();
    const parsed = scheduleSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }

    const days = normalizeDays(parsed.data.days);
    if (days.length === 0) {
      return NextResponse.json(
        { success: false, error: "Select at least one valid day (Sun–Sat)" },
        { status: 400 },
      );
    }

    const times = [...parsed.data.times].sort(compareHHMM);

    const schedule: Prisma.InputJsonValue = {
      days,
      times,
      timezone: "UTC",
    };

    let nextPostAt: Date | null = null;
    try {
      nextPostAt = getNextPostTime({ days, times, timezone: "UTC" });
      if (nextPostAt) {
        const startOfTodayUtc = new Date();
        startOfTodayUtc.setUTCHours(0, 0, 0, 0);
        const postedToday = await prisma.contentItem.count({
          where: {
            tiktokAccountId: id,
            status: "POSTED",
            postedAt: { gte: startOfTodayUtc },
          },
        });
        const dailyCap = times.length;
        if (postedToday >= dailyCap) {
          const tomorrow = new Date();
          tomorrow.setUTCHours(0, 0, 0, 0);
          tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
          const [h, m] = times[0].split(":").map((v) => parseInt(v, 10));
          tomorrow.setUTCHours(h, m, 0, 0);
          nextPostAt = tomorrow;
        }
      }
    } catch (e) {
      console.error("getNextPostTime failed", e);
      nextPostAt = null;
    }

    const updated = await prisma.tikTokAccount.update({
      where: { id },
      data: {
        schedule,
        nextPostAt,
      },
      select: {
        id: true,
        schedule: true,
        nextPostAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        schedule: updated.schedule,
        nextPostAt: updated.nextPostAt?.toISOString() ?? null,
      },
    });
  } catch (error) {
    console.error(
      `PATCH /api/tiktok-accounts/${params?.id}/schedule error:`,
      error,
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
