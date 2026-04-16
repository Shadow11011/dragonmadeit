import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTikTokConnectUrl } from "@/lib/late-api";

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

    const account = await prisma.tikTokAccount.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        userId: true,
        lateProfileId: true,
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

    if (!account.username.startsWith("pending-")) {
      return NextResponse.json(
        {
          success: false,
          error: "This account is already linked to a TikTok username",
        },
        { status: 409 }
      );
    }

    // All TikTok accounts share a single Zernio profile. Per-account profiles
    // hit the Free-plan profile limit (2) almost immediately.
    const sharedProfileId = process.env.LATE_PROFILE_ID;
    if (!sharedProfileId) {
      console.error("LATE_PROFILE_ID is not configured");
      return NextResponse.json(
        { success: false, error: "Zernio profile not configured" },
        { status: 500 }
      );
    }

    if (account.lateProfileId !== sharedProfileId) {
      await prisma.tikTokAccount.update({
        where: { id },
        data: { lateProfileId: sharedProfileId },
      });
    }

    const redirectUrl = `${process.env.NEXTAUTH_URL}/dashboard/accounts/link/${id}/callback`;
    const { authUrl } = await getTikTokConnectUrl(sharedProfileId, redirectUrl);

    return NextResponse.json({ success: true, data: { authUrl } });
  } catch (error) {
    console.error(
      `POST /api/tiktok-accounts/${params?.id}/connect error:`,
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
