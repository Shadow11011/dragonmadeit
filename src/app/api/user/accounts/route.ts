import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createAccountSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username too long")
    .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, dots, and underscores"),
  displayName: z.string().max(100).optional(),
});

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
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error("GET /api/user/accounts error:", error);
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
    const parsed = createAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // In the multi-account model, each account gets its own subscription.
    // No global account limit — users can add as many as they want.
    const account = await prisma.tikTokAccount.create({
      data: {
        username: parsed.data.username,
        displayName: parsed.data.displayName ?? null,
        userId: session.user.id,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: account }, { status: 201 });
  } catch (error) {
    console.error("POST /api/user/accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = request.nextUrl.searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Account ID is required" },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.tikTokAccount.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    await prisma.tikTokAccount.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, data: { deleted: id } });
  } catch (error) {
    console.error("DELETE /api/user/accounts error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
