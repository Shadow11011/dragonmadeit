import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createProfile, getTikTokConnectUrl } from "@/lib/late-api";

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

    // Only allow connecting if the account is still pending
    if (!account.username.startsWith("pending-")) {
      return NextResponse.json(
        {
          success: false,
          error: "This account is already linked to a TikTok username",
        },
        { status: 409 }
      );
    }

    // Create a Late.dev profile if one doesn't exist yet
    let lateProfileId = account.lateProfileId;

    if (!lateProfileId) {
      const profile = await createProfile(`dragonmadeit-${id}`);
      lateProfileId = profile.id;

      await prisma.tikTokAccount.update({
        where: { id },
        data: { lateProfileId },
      });
    }

    // Get the TikTok OAuth connect URL from Late.dev
    const redirectUrl = `${process.env.NEXTAUTH_URL}/dashboard/accounts/link/${id}/callback`;
    const { authUrl } = await getTikTokConnectUrl(lateProfileId, redirectUrl);

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
