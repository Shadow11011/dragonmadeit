import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAccountHealth } from "@/lib/late-api";

export async function GET(
  _request: Request,
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

    const account = await prisma.tikTokAccount.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        lateAccountId: true,
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

    if (!account.lateAccountId) {
      return NextResponse.json(
        { success: false, error: "Account is not linked to TikTok yet" },
        { status: 400 }
      );
    }

    const health = await getAccountHealth(account.lateAccountId);

    return NextResponse.json({ success: true, data: health });
  } catch (error) {
    console.error(
      `GET /api/tiktok-accounts/${params?.id}/health error:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
