import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createContentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(2000).optional(),
  scheduledAt: z.string().datetime().optional(),
  tiktokAccountId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          scheduledAt: true,
          postedAt: true,
          createdAt: true,
          tiktokAccount: {
            select: { username: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contentItem.count({
        where: { userId: session.user.id },
      }),
    ]);

    const data = items.map((item) => ({
      ...item,
      tiktokAccountUsername: item.tiktokAccount?.username ?? null,
      tiktokAccount: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GET /api/user/content error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: unknown = await request.json();
    const parsed = createContentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { title, description, scheduledAt, tiktokAccountId } = parsed.data;

    // Verify TikTok account belongs to user if provided
    if (tiktokAccountId) {
      const account = await prisma.tikTokAccount.findFirst({
        where: { id: tiktokAccountId, userId: session.user.id },
        select: { id: true },
      });
      if (!account) {
        return NextResponse.json(
          { success: false, error: "TikTok account not found" },
          { status: 404 }
        );
      }
    }

    const contentItem = await prisma.contentItem.create({
      data: {
        title,
        description: description ?? null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "SCHEDULED" : "DRAFT",
        userId: session.user.id,
        tiktokAccountId: tiktokAccountId ?? null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        scheduledAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: contentItem }, { status: 201 });
  } catch (error) {
    console.error("POST /api/user/content error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
